import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  await db.shippingMethod.createMany({
    data: [
      { name: 'Doručení kurýrem', description: 'Doručení přímo k vám domů', price: 99, freeThreshold: 1500, estimatedDays: '1–2 pracovní dny', sortOrder: 1 },
      { name: 'Zásilkovna', description: 'Vyzvedněte si na pobočce Zásilkovny', price: 59, freeThreshold: 1500, estimatedDays: '1–3 pracovní dny', sortOrder: 2 },
    ],
    skipDuplicates: true,
  })
  console.log('Seeded shipping methods')
}
main().catch(console.error).finally(() => db.$disconnect())
