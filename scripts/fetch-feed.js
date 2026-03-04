import fs from "fs";

const X_TOKEN = process.env.X_BEARER_TOKEN;
const LINKEDIN_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

async function fetchX() {
  const usernames = ["OpenAI", "elonmusk"];

  const posts = [];

  for (const username of usernames) {
    const res = await fetch(
      `https://api.x.com/2/tweets/search/recent?query=from:${username}&tweet.fields=created_at`,
      {
        headers: { Authorization: `Bearer ${X_TOKEN}` }
      }
    );

    const data = await res.json();

    if (data.data) {
      data.data.forEach(tweet => {
        posts.push({
          platform: "X",
          name: username,
          avatar: "/assets/x.png",
          date: tweet.created_at,
          content: tweet.text
        });
      });
    }
  }

  return posts;
}

async function fetchLinkedIn() {
  const orgIds = ["123456", "789012"]; // Replace with real org IDs

  const posts = [];

  for (const id of orgIds) {
    const res = await fetch(
      `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${id}`,
      {
        headers: {
          Authorization: `Bearer ${LINKEDIN_TOKEN}`,
          "X-Restli-Protocol-Version": "2.0.0"
        }
      }
    );

    const data = await res.json();

    if (data.elements) {
      data.elements.forEach(post => {
        posts.push({
          platform: "LinkedIn",
          name: `Org ${id}`,
          avatar: "/assets/linkedin.png",
          date: post.created.time,
          content: post.text?.text || ""
        });
      });
    }
  }

  return posts;
}

async function main() {
  const xPosts = await fetchX();
  const liPosts = await fetchLinkedIn();

  const allPosts = [...xPosts, ...liPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 50);

  fs.writeFileSync("feed.json", JSON.stringify(allPosts, null, 2));

  console.log("Feed updated successfully.");
}

main();
