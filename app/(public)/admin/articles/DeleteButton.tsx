'use client'

import { useState, useTransition } from 'react'
import { deleteArticle } from './actions'

export function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (confirming) {
    return (
      <span className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-[#5A6278] mr-1">Delete?</span>
        <button
          onClick={() => startTransition(() => deleteArticle(id))}
          disabled={pending}
          className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded-md bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]"
        >
          No
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs shrink-0 px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
    >
      Delete
    </button>
  )
}
