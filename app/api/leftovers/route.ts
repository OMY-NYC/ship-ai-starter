import { asUser } from "@/lib/db"
import { checkLeftoverItem } from "@/lib/guardrail"
import { loadSampleFridge } from "@/lib/sample-fridge"
import { getSession } from "@/lib/session"

// Your fridge: add an item, load the sample fridge, or delete an item.
// No AI here, so the order is: sign-in, guardrail, save with asUser.

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Please sign in." }, { status: 401 })

  const body = (await request.json().catch(() => null)) as
    | { sample?: unknown; item?: unknown; days_old?: unknown }
    | null

  if (body?.sample === true) {
    const sample = await loadSampleFridge()
    const added = await asUser(session.user.id, async (db) => {
      const { rows } = await db.query<{ n: number }>("select count(*)::int as n from leftovers")
      if (rows[0].n > 0) return null
      return db.query(
        "insert into leftovers (item, days_old) select * from unnest($1::text[], $2::int[])",
        [sample.map((x) => x.item), sample.map((x) => x.days_old)],
      )
    })
    if (!added) {
      return Response.json({ error: "Your fridge already has leftovers. Delete them first." }, { status: 409 })
    }
    return Response.json({ ok: true, added: added.rowCount })
  }

  const daysOld = Number(body?.days_old)
  if (!Number.isInteger(daysOld) || daysOld < 0 || daysOld > 365) {
    return Response.json({ error: "Days old must be a whole number from 0 to 365." }, { status: 400 })
  }

  const input = checkLeftoverItem(typeof body?.item === "string" ? body.item : "")
  if (input.blocked) {
    return Response.json({ error: input.reason, guardrail: "blocked" }, { status: 400 })
  }

  const saved = await asUser(session.user.id, (db) =>
    db.query(
      "insert into leftovers (item, days_old) values ($1, $2) returning id, item, days_old, created_at",
      [input.text, daysOld],
    ),
  )
  return Response.json({ leftover: saved.rows[0] })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Please sign in." }, { status: 401 })

  const id = new URL(request.url).searchParams.get("id")
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: "Missing id." }, { status: 400 })
  }

  // No "and user_id = ..." needed: the row rule already limits this to your rows.
  const result = await asUser(session.user.id, (db) => db.query("delete from leftovers where id = $1", [id]))

  if (result.rowCount === 0) return Response.json({ error: "Not found." }, { status: 404 })
  return Response.json({ ok: true })
}
