import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Stub — replace with real DPD API call when API key is available
// DPD Czech pickup points API: https://api.dpd.cz/
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? ""

  // Mock data for Czech Republic DPD Pickup points
  const mockPoints = [
    {
      id: "dpd-prg-001",
      name: "DPD Pickup – Praha 1",
      nameStreet: "Václavské náměstí 1",
      city: "Praha",
      zip: "11000",
    },
    {
      id: "dpd-prg-002",
      name: "DPD Pickup – Praha 2",
      nameStreet: "Náměstí Míru 5",
      city: "Praha",
      zip: "12000",
    },
    {
      id: "dpd-brn-001",
      name: "DPD Pickup – Brno",
      nameStreet: "Náměstí Svobody 1",
      city: "Brno",
      zip: "60200",
    },
    {
      id: "dpd-ost-001",
      name: "DPD Pickup – Ostrava",
      nameStreet: "Masarykovo náměstí 1",
      city: "Ostrava",
      zip: "70200",
    },
    {
      id: "dpd-plz-001",
      name: "DPD Pickup – Plzeň",
      nameStreet: "náměstí Republiky 1",
      city: "Plzeň",
      zip: "30100",
    },
  ]

  const results = q
    ? mockPoints.filter(
        (p) =>
          p.city.toLowerCase().includes(q) ||
          p.zip.includes(q) ||
          p.name.toLowerCase().includes(q)
      )
    : mockPoints

  return NextResponse.json({ points: results })
}
