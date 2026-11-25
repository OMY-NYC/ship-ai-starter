"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Leftover } from "@/lib/db"
import { tossReason } from "@/lib/food-safety"
import { DeleteButton } from "./delete-button"

export function LeftoverList({ leftovers }: { leftovers: Leftover[] }) {
  const router = useRouter()
  const [item, setItem] = useState("")
  const [daysOld, setDaysOld] = useState("1")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function post(body: object) {
    if (pending) return false
    setPending(true)
    setMessage(null)
    const response = await fetch("/api/leftovers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await response.json().catch(() => ({}))) as { error?: string; guardrail?: string }
    setPending(false)
    if (!response.ok) {
      setMessage(`${data.guardrail === "blocked" ? "Guardrail: " : ""}${data.error ?? "Something went wrong."}`)
      return false
    }
    router.refresh()
    return true
  }

  return (
    <div className="flex flex-col gap-4">
      {leftovers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-border p-6 text-center text-muted">
          <p>Your fridge is empty. Only you can see what you put here.</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => post({ sample: true })}
            className="rounded-full border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-block hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Loading..." : "Load sample fridge"}
          </button>
        </div>
      ) : (
        <ul className="flex flex-col divide-y-2 divide-border rounded-card border-2 border-border bg-surface shadow-block">
          {leftovers.map((leftover) => {
            const reason = tossReason(leftover.item, leftover.days_old)
            return (
              <li key={leftover.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={`font-semibold ${reason ? "text-muted line-through" : ""}`}>{leftover.item}</span>
                  <span className="text-sm text-muted">
                    {leftover.days_old} {leftover.days_old === 1 ? "day" : "days"} old
                  </span>
                  {reason && (
                    <span
                      title={reason}
                      className="rounded-full bg-foreground px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-surface"
                    >
                      Toss it
                    </span>
                  )}
                </span>
                <DeleteButton id={leftover.id} endpoint="/api/leftovers" />
              </li>
            )
          })}
        </ul>
      )}

      <form
        onSubmit={async (event) => {
          event.preventDefault()
          if (await post({ item, days_old: Number(daysOld) })) {
            setItem("")
            setDaysOld("1")
          }
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-semibold">
          Leftover
          <input
            value={item}
            onChange={(event) => setItem(event.target.value)}
            maxLength={60}
            placeholder="e.g. mashed potatoes"
            className="rounded-card border-2 border-border bg-surface px-3 py-2 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <label className="flex w-24 flex-col gap-1 text-sm font-semibold">
          Days old
          <input
            type="number"
            min={0}
            max={365}
            value={daysOld}
            onChange={(event) => setDaysOld(event.target.value)}
            className="rounded-card border-2 border-border bg-surface px-3 py-2 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !item.trim()}
          className="rounded-full border-2 border-border bg-surface px-4 py-2 font-bold shadow-block hover:-translate-y-0.5 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {message && (
        <p role="alert" className="rounded-card border-2 border-border bg-surface px-4 py-3 text-sm font-semibold text-primary">
          {message}
        </p>
      )}
    </div>
  )
}
