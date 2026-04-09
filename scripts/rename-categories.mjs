import pg from "pg"
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const renames = [
  { from: "Flowers", to: "Květy", slug: "kvety" },
  { from: "Extracts", to: "Extrakty", slug: "extrakty" },
]

for (const { from, to, slug } of renames) {
  const res = await pool.query(
    `UPDATE "Category" SET name = $1, slug = $2 WHERE name = $3 RETURNING id, name, slug`,
    [to, slug, from]
  )
  if (res.rowCount > 0) {
    console.log(`✓ Renamed "${from}" → "${to}" (slug: ${slug})`)
  } else {
    console.log(`— "${from}" not found (may already be renamed)`)
  }
}

await pool.end()
