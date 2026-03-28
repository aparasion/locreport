#!/usr/bin/env python3
"""Self-hosted API for community signal proposals, moderation, voting, and auto-promotion.

No third-party services required. Uses SQLite for storage and updates _data/signals.yml
when a proposal reaches the configured promotion threshold.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import sqlite3
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "signal_proposals.db"
SIGNALS_YML_PATH = ROOT / "_data" / "signals.yml"

PROMOTION_UPVOTES_THRESHOLD = int(os.getenv("PROPOSAL_PROMOTION_UPVOTES", "10"))
PROMOTION_SCORE_THRESHOLD = int(os.getenv("PROPOSAL_PROMOTION_SCORE", "8"))
ADMIN_TOKEN = os.getenv("SIGNAL_PROPOSALS_ADMIN_TOKEN", "")
HOST = os.getenv("SIGNAL_PROPOSALS_HOST", "127.0.0.1")
PORT = int(os.getenv("SIGNAL_PROPOSALS_PORT", "8787"))

ALLOWED_CATEGORIES = {"quality", "operations", "governance", "market", "strategy"}


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def utc_today() -> str:
    return dt.datetime.now(dt.timezone.utc).date().isoformat()


def ensure_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS proposals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                hypothesis TEXT NOT NULL,
                category TEXT NOT NULL,
                evidence_links TEXT NOT NULL DEFAULT '[]',
                submitted_by_name TEXT NOT NULL,
                submitted_by_email TEXT,
                status TEXT NOT NULL DEFAULT 'pending_review',
                moderator_note TEXT,
                promoted_signal_id TEXT,
                upvotes INTEGER NOT NULL DEFAULT 0,
                downvotes INTEGER NOT NULL DEFAULT 0,
                score INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                proposal_id INTEGER NOT NULL,
                voter_fingerprint TEXT NOT NULL,
                vote INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(proposal_id, voter_fingerprint),
                FOREIGN KEY(proposal_id) REFERENCES proposals(id)
            )
            """
        )


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def sanitize_text(value: str, max_len: int) -> str:
    text = (value or "").strip()
    if len(text) > max_len:
        text = text[:max_len].strip()
    return text


def parse_links(raw: str) -> list[str]:
    links = []
    for item in (raw or "").splitlines():
        url = item.strip()
        if not url:
            continue
        if url.startswith("http://") or url.startswith("https://"):
            links.append(url)
    return links[:3]


def yaml_quote(value: str) -> str:
    return '"' + value.replace('"', '\\"') + '"'


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    slug = re.sub(r"-{2,}", "-", slug)
    return slug[:72] or "community-signal"


def signal_ids_in_yaml() -> set[str]:
    if not SIGNALS_YML_PATH.exists():
        return set()
    ids: set[str] = set()
    for line in SIGNALS_YML_PATH.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("- id:"):
            ids.add(stripped.split(":", 1)[1].strip().strip("\"'"))
    return ids


def unique_signal_id(base_title: str) -> str:
    existing = signal_ids_in_yaml()
    base = slugify(base_title)
    if base not in existing:
        return base
    suffix = 2
    while f"{base}-{suffix}" in existing:
        suffix += 1
    return f"{base}-{suffix}"


def append_signal_from_proposal(proposal: sqlite3.Row) -> str:
    signal_id = unique_signal_id(proposal["title"])
    title = sanitize_text(proposal["title"], 240)
    category = proposal["category"] if proposal["category"] in ALLOWED_CATEGORIES else "strategy"
    description = sanitize_text(proposal["hypothesis"], 500)
    proposer = sanitize_text(proposal["submitted_by_name"], 120)

    block = (
        "\n"
        f"- id: {signal_id}\n"
        f"  title: {yaml_quote(title)}\n"
        f"  category: {category}\n"
        f"  first_seen: {utc_today()}\n"
        "  current_status: emerging\n"
        f"  description: {yaml_quote(description)}\n"
        "  source: community\n"
        f"  proposed_by: {yaml_quote(proposer)}\n"
    )

    text = SIGNALS_YML_PATH.read_text(encoding="utf-8") if SIGNALS_YML_PATH.exists() else ""
    SIGNALS_YML_PATH.write_text(text.rstrip() + "\n" + block, encoding="utf-8")
    return signal_id


def recalc_proposal_counts(conn: sqlite3.Connection, proposal_id: int) -> None:
    row = conn.execute(
        """
        SELECT
            COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes
        FROM votes WHERE proposal_id = ?
        """,
        (proposal_id,),
    ).fetchone()
    upvotes = int(row["upvotes"])
    downvotes = int(row["downvotes"])
    score = upvotes - downvotes
    conn.execute(
        "UPDATE proposals SET upvotes = ?, downvotes = ?, score = ?, updated_at = ? WHERE id = ?",
        (upvotes, downvotes, score, utc_now(), proposal_id),
    )


def maybe_promote(conn: sqlite3.Connection, proposal_id: int) -> dict | None:
    proposal = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
    if not proposal or proposal["status"] != "published" or proposal["promoted_signal_id"]:
        return None

    if proposal["upvotes"] < PROMOTION_UPVOTES_THRESHOLD or proposal["score"] < PROMOTION_SCORE_THRESHOLD:
        return None

    signal_id = append_signal_from_proposal(proposal)
    conn.execute(
        """
        UPDATE proposals
        SET status = 'promoted', promoted_signal_id = ?, updated_at = ?
        WHERE id = ?
        """,
        (signal_id, utc_now(), proposal_id),
    )
    return {"signal_id": signal_id}


def proposal_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "hypothesis": row["hypothesis"],
        "category": row["category"],
        "evidence_links": json.loads(row["evidence_links"] or "[]"),
        "submitted_by_name": row["submitted_by_name"],
        "status": row["status"],
        "moderator_note": row["moderator_note"],
        "promoted_signal_id": row["promoted_signal_id"],
        "upvotes": row["upvotes"],
        "downvotes": row["downvotes"],
        "score": row["score"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


class ProposalHandler(BaseHTTPRequestHandler):
    server_version = "LocReportProposals/1.0"

    def _send(self, status: int, data: dict) -> None:
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0") or "0")
        if content_length <= 0:
            return {}
        payload = self.rfile.read(content_length)
        if not payload:
            return {}
        try:
            return json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def _is_admin(self) -> bool:
        if not ADMIN_TOKEN:
            return False
        return self.headers.get("X-Admin-Token", "") == ADMIN_TOKEN

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send(HTTPStatus.NO_CONTENT, {})

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/proposals":
            query = parse_qs(parsed.query)
            status = query.get("status", ["published"])[0]
            limit = min(max(int(query.get("limit", ["100"])[0]), 1), 500)

            with db() as conn:
                if status == "all":
                    rows = conn.execute(
                        "SELECT * FROM proposals ORDER BY score DESC, upvotes DESC, created_at ASC LIMIT ?",
                        (limit,),
                    ).fetchall()
                else:
                    rows = conn.execute(
                        """
                        SELECT * FROM proposals
                        WHERE status = ?
                        ORDER BY score DESC, upvotes DESC, created_at ASC
                        LIMIT ?
                        """,
                        (status, limit),
                    ).fetchall()
            self._send(HTTPStatus.OK, {"proposals": [proposal_to_dict(r) for r in rows]})
            return

        if parsed.path == "/api/proposals/pending":
            if not self._is_admin():
                self._send(HTTPStatus.UNAUTHORIZED, {"error": "Admin token required."})
                return
            with db() as conn:
                rows = conn.execute(
                    "SELECT * FROM proposals WHERE status = 'pending_review' ORDER BY created_at ASC"
                ).fetchall()
            self._send(HTTPStatus.OK, {"proposals": [proposal_to_dict(r) for r in rows]})
            return

        self._send(HTTPStatus.NOT_FOUND, {"error": "Not found."})

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        payload = self._read_json()

        if parsed.path == "/api/proposals":
            title = sanitize_text(payload.get("title", ""), 200)
            hypothesis = sanitize_text(payload.get("hypothesis", ""), 500)
            category = sanitize_text(payload.get("category", ""), 40).lower()
            submitted_by = sanitize_text(payload.get("submitted_by_name", ""), 120)
            submitted_email = sanitize_text(payload.get("submitted_by_email", ""), 200)
            links = parse_links(payload.get("evidence_links", ""))

            if not title or not hypothesis or not submitted_by:
                self._send(HTTPStatus.BAD_REQUEST, {"error": "title, hypothesis, and submitted_by_name are required."})
                return
            if category not in ALLOWED_CATEGORIES:
                self._send(HTTPStatus.BAD_REQUEST, {"error": f"category must be one of {sorted(ALLOWED_CATEGORIES)}"})
                return

            now = utc_now()
            with db() as conn:
                cur = conn.execute(
                    """
                    INSERT INTO proposals (
                        title, hypothesis, category, evidence_links,
                        submitted_by_name, submitted_by_email, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)
                    """,
                    (title, hypothesis, category, json.dumps(links), submitted_by, submitted_email, now, now),
                )
                proposal_id = cur.lastrowid
                row = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
            self._send(HTTPStatus.CREATED, {"proposal": proposal_to_dict(row)})
            return

        moderate_match = re.match(r"^/api/proposals/(\d+)/moderate$", parsed.path)
        if moderate_match:
            if not self._is_admin():
                self._send(HTTPStatus.UNAUTHORIZED, {"error": "Admin token required."})
                return

            proposal_id = int(moderate_match.group(1))
            action = sanitize_text(payload.get("action", ""), 30)
            note = sanitize_text(payload.get("moderator_note", ""), 240)
            if action not in {"approve", "reject"}:
                self._send(HTTPStatus.BAD_REQUEST, {"error": "action must be 'approve' or 'reject'."})
                return

            new_status = "published" if action == "approve" else "rejected"
            with db() as conn:
                exists = conn.execute("SELECT id FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
                if not exists:
                    self._send(HTTPStatus.NOT_FOUND, {"error": "Proposal not found."})
                    return
                conn.execute(
                    "UPDATE proposals SET status = ?, moderator_note = ?, updated_at = ? WHERE id = ?",
                    (new_status, note, utc_now(), proposal_id),
                )
                row = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
            self._send(HTTPStatus.OK, {"proposal": proposal_to_dict(row)})
            return

        vote_match = re.match(r"^/api/proposals/(\d+)/vote$", parsed.path)
        if vote_match:
            proposal_id = int(vote_match.group(1))
            vote_raw = payload.get("vote")
            vote = 1 if vote_raw in {1, "up", "thumbs_up", "+1"} else -1 if vote_raw in {-1, "down", "thumbs_down", "-1"} else 0
            if vote == 0:
                self._send(HTTPStatus.BAD_REQUEST, {"error": "vote must be 'up' or 'down'."})
                return

            voter_hint = sanitize_text(payload.get("voter_id", ""), 120)
            ua = self.headers.get("User-Agent", "")
            remote = self.client_address[0] if self.client_address else "unknown"
            fingerprint_src = f"{voter_hint}|{remote}|{ua}"
            voter_fingerprint = hashlib.sha256(fingerprint_src.encode("utf-8")).hexdigest()

            with db() as conn:
                proposal = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
                if not proposal:
                    self._send(HTTPStatus.NOT_FOUND, {"error": "Proposal not found."})
                    return
                if proposal["status"] not in {"published", "promoted"}:
                    self._send(HTTPStatus.BAD_REQUEST, {"error": "Only published proposals can be voted."})
                    return

                now = utc_now()
                conn.execute(
                    """
                    INSERT INTO votes (proposal_id, voter_fingerprint, vote, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(proposal_id, voter_fingerprint)
                    DO UPDATE SET vote = excluded.vote, updated_at = excluded.updated_at
                    """,
                    (proposal_id, voter_fingerprint, vote, now, now),
                )
                recalc_proposal_counts(conn, proposal_id)
                promoted = maybe_promote(conn, proposal_id)
                row = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()

            response = {"proposal": proposal_to_dict(row)}
            if promoted:
                response["promotion"] = promoted
            self._send(HTTPStatus.OK, response)
            return

        self._send(HTTPStatus.NOT_FOUND, {"error": "Not found."})


def run() -> None:
    ensure_db()
    server = ThreadingHTTPServer((HOST, PORT), ProposalHandler)
    print(f"Signal proposals API running on http://{HOST}:{PORT}")
    print(f"SQLite database: {DB_PATH}")
    print(f"Signals file: {SIGNALS_YML_PATH}")
    print(
        "Promotion thresholds: "
        f"upvotes>={PROMOTION_UPVOTES_THRESHOLD}, score>={PROMOTION_SCORE_THRESHOLD}"
    )
    if not ADMIN_TOKEN:
        print("WARNING: SIGNAL_PROPOSALS_ADMIN_TOKEN is not set. Moderation endpoints are disabled.")
    server.serve_forever()


if __name__ == "__main__":
    run()
