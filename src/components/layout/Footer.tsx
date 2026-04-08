import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[#d2d2d7] bg-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#22A829] mb-4 font-playfair">
              Weedejna
            </h3>
            <p className="text-sm text-[#6e6e73]">
              Premium cannabis products delivered to your door.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li><Link href="/products" className="hover:text-[#1d1d1f] transition-colors">All Products</Link></li>
              <li><Link href="/products?category=flowers" className="hover:text-[#1d1d1f] transition-colors">Flowers</Link></li>
              <li><Link href="/products?category=extracts" className="hover:text-[#1d1d1f] transition-colors">Extracts</Link></li>
              <li><Link href="/products?category=edibles" className="hover:text-[#1d1d1f] transition-colors">Edibles</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li><Link href="/login" className="hover:text-[#1d1d1f] transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-[#1d1d1f] transition-colors">Register</Link></li>
              <li><Link href="/account/orders" className="hover:text-[#1d1d1f] transition-colors">Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li><span className="text-xs">18+ only. Czech Republic.</span></li>
              <li><span className="text-xs">All products comply with EU law.</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#d2d2d7] text-center text-xs text-[#aeaeb2]">
          © 2026 Weedejna. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
