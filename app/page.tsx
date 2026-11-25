import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { LayerList } from "@/components/layer-list"
import { getSession } from "@/lib/session"

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect("/app")

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-10 px-6 py-12 md:flex-row md:items-center md:gap-16">
      <section className="flex flex-1 flex-col gap-5">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Ship AI Starter</p>
        <h1 className="font-display text-4xl font-extrabold leading-tight text-balance md:text-5xl">
          Leftover Remix
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-pretty">
          List what's left in your fridge after Thanksgiving and get one new meal in 3 steps. Anything
          too old gets tossed, not cooked. Small app, real safety: every layer is the kind you would ship.
        </p>
        <LayerList />
        <p className="text-sm text-muted">Use made-up details only. Assume anything you type is stored.</p>
      </section>
      <section className="w-full md:max-w-sm">
        <AuthForm />
      </section>
    </main>
  )
}
