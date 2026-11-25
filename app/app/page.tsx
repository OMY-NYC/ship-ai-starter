import { redirect } from "next/navigation"
import { LeftoverList } from "@/components/leftover-list"
import { PlanForm } from "@/components/plan-form"
import { SignOutButton } from "@/components/sign-out-button"
import { SuggestionCard } from "@/components/suggestion-card"
import { asUser, type Leftover, type Suggestion } from "@/lib/db"
import { getSession } from "@/lib/session"

export default async function AppPage() {
  const session = await getSession()
  if (!session) redirect("/")

  // No WHERE clause on purpose: the row rule already limits both of these to your rows.
  const { leftovers, rows } = await asUser(session.user.id, async (db) => ({
    leftovers: (
      await db.query<Leftover>("select id, item, days_old, created_at from leftovers order by created_at")
    ).rows,
    rows: (
      await db.query<Suggestion>(
        "select id, goal, answer, guardrail, created_at from suggestions order by created_at desc limit 50",
      )
    ).rows,
  }))

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Leftover Remix</p>
          <p className="truncate text-sm text-muted">Signed in as {session.user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <main className="flex flex-col gap-8">
        <section className="flex flex-col gap-4" aria-labelledby="fridge-heading">
          <h1 id="fridge-heading" className="font-display text-3xl font-extrabold text-balance">
            What's in your fridge?
          </h1>
          <LeftoverList leftovers={leftovers} />
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="remix-heading">
          <h2 id="remix-heading" className="font-display text-xl font-bold">
            Turn it into one new meal
          </h2>
          <PlanForm />
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="saved-heading">
          <h2 id="saved-heading" className="font-display text-xl font-bold">
            Your saved remixes
          </h2>
          {rows.length === 0 ? (
            <p className="rounded-card border-2 border-dashed border-border p-6 text-center text-muted">
              Nothing yet. Your remixes show up here, and only you can see them.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
