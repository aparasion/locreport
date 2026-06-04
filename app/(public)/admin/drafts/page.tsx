import { createServiceClient } from '@/lib/supabase/server'
import { DraftCard } from '@/components/DraftCard'
import { Draft } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  const supabase = createServiceClient()

  let query = supabase.from('drafts').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data: drafts, error } = await query
  if (error) throw new Error(error.message)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Drafts</h1>
        <div className="flex gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ].map(({ label, value }) => (
            <a
              key={value}
              href={value ? `/admin/drafts?status=${value}` : '/admin/drafts'}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                (status ?? '') === value
                  ? 'bg-[#3D5AFE] text-white'
                  : 'bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="max-w-[760px]">
        {(drafts as Draft[])?.map(draft => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
        {!drafts?.length && <p className="text-[#5A6278] text-sm">No drafts found.</p>}
      </div>
    </div>
  )
}
