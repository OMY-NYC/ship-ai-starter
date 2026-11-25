import { readFile } from "node:fs/promises"
import path from "node:path"
import type { FridgeItem } from "./food-safety"

/**
 * Reads the made-up leftovers in data/leftover_remix.csv.
 * Only item and days_old are used; the "note" column is for humans.
 */
export async function loadSampleFridge(): Promise<FridgeItem[]> {
  const csv = await readFile(path.join(process.cwd(), "data", "leftover_remix.csv"), "utf8")
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const columns = header.split(",")
  const itemIndex = columns.indexOf("item")
  const daysIndex = columns.indexOf("days_old")

  return lines
    .map((line) => line.split(","))
    .map((cells) => ({ item: cells[itemIndex]?.trim() ?? "", days_old: Number(cells[daysIndex]) }))
    .filter((row) => row.item && Number.isInteger(row.days_old) && row.days_old >= 0)
}
