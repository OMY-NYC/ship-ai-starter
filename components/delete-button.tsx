"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeleteButton({ id, endpoint = "/api/plan" }: { id: string; endpoint?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        router.refresh()
      }}
      className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-background disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  )
}
