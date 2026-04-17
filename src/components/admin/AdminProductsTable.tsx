'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, ArrowUpDown, ArrowUp, ArrowDown, EyeOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatPrice'

interface ProductRow {
  id: string
  name: string
  categoryName: string | null
  variantCount: number
  isActive: boolean
  basePrice: number
}

type SortField = 'name' | 'category' | 'variants' | 'price'
type SortDir = 'asc' | 'desc'

export function AdminProductsTable({ products }: { products: ProductRow[] }) {
  const [search, setSearch] = useState('')
  const [hideInactive, setHideInactive] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let rows = products
    if (hideInactive) rows = rows.filter((p) => p.isActive)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.categoryName ?? '').toLowerCase().includes(q),
      )
    }
    return [...rows].sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'cs')
      else if (sortField === 'category') cmp = (a.categoryName ?? '').localeCompare(b.categoryName ?? '', 'cs')
      else if (sortField === 'variants') cmp = a.variantCount - b.variantCount
      else if (sortField === 'price') cmp = a.basePrice - b.basePrice
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [products, search, hideInactive, sortField, sortDir])

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5" />
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Hledat produkt nebo kategorii…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-9"
        />
        <Button
          variant={hideInactive ? 'default' : 'outline'}
          size="sm"
          onClick={() => setHideInactive((v) => !v)}
          className="gap-1.5"
        >
          <EyeOff className="h-3.5 w-3.5" />
          {hideInactive ? 'Zobrazit vše' : 'Skrýt neaktivní'}
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} / {products.length} produktů
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/40 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => toggleSort('name')}
                  className="inline-flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Název <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('category')}
                  className="inline-flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Kategorie <SortIcon field="category" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('variants')}
                  className="inline-flex items-center font-medium hover:text-foreground transition-colors"
                >
                  Varianty <SortIcon field="variants" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Žádné produkty nevyhovují filtru.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categoryName ?? '—'}</TableCell>
                <TableCell>{product.variantCount}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Aktivní' : 'Neaktivní'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/products/${product.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
