import Link from 'next/link'
import { Draft } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

function statusVariant(status: Draft['status']) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

export function DraftCard({ draft }: { draft: Draft }) {
  const date = new Date(draft.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
  return (
    <div className="border-b border-gray-100 py-4 last:border-0 flex items-start justify-between gap-4">
      <div>
        <Link href={`/admin/drafts/${draft.id}`} className="font-medium text-[#111827] hover:text-[#3D5AFE]">
          {draft.title}
        </Link>
        <p className="text-xs text-[#5A6278] mt-1">{date}{draft.source_url && (() => { try { return ` · ${new URL(draft.source_url!).hostname}` } catch { return ` · ${draft.source_url}` } })()}</p>
      </div>
      <Badge variant={statusVariant(draft.status)}>{draft.status}</Badge>
    </div>
  )
}
