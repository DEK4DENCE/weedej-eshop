# Weedejna Cannabis E-Shop — Complete System Architecture

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Document path:** `docs/superpowers/plans/architecture.md`
**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS v3 · Framer Motion · shadcn/ui · PostgreSQL · Prisma ORM · NextAuth.js v5 · Stripe · Zustand · Resend · Zod · npm

---

## 1. Full Directory and File Structure

```
weedejna-eshop/
├── prisma/
│   ├── schema.prisma                        # All Prisma models
│   └── migrations/                          # Auto-generated migration files
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   └── placeholder-product.webp
│   └── fonts/
│
├── src/
│   ├── app/                                 # Next.js 14 App Router root
│   │   ├── layout.tsx                       # Root layout: fonts, providers, Framer motion wrapper
│   │   ├── page.tsx                         # Homepage: hero, featured products, categories
│   │   ├── error.tsx                        # Global error boundary
│   │   ├── not-found.tsx                    # 404 page
│   │   ├── loading.tsx                      # Global loading skeleton
│   │   │
│   │   ├── (auth)/                          # Auth route group (no shared layout chrome)
│   │   │   ├── layout.tsx                   # Centered card layout for auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx                 # Login form
│   │   │   ├── register/
│   │   │   │   └── page.tsx                 # Registration form
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx                 # Request reset email form
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx                 # New password form (token from URL query)
│   │   │   └── verify-email/
│   │   │       └── page.tsx                 # Email verification landing page
│   │   │
│   │   ├── (shop)/                          # Public shop route group
│   │   │   ├── layout.tsx                   # Shop layout: header, footer, cart sidebar
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                 # Product listing with filters/pagination
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx             # Product detail page
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx             # Category product listing
│   │   │   ├── cart/
│   │   │   │   └── page.tsx                 # Full cart review page
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx                 # Pre-checkout summary (requires auth)
│   │   │   │   └── success/
│   │   │   │       └── page.tsx             # Post-payment success page
│   │   │   └── search/
│   │   │       └── page.tsx                 # Search results page
│   │   │
│   │   ├── (account)/                       # Authenticated user account group
│   │   │   ├── layout.tsx                   # Account layout: sidebar nav
│   │   │   ├── account/
│   │   │   │   └── page.tsx                 # Profile overview
│   │   │   ├── account/orders/
│   │   │   │   ├── page.tsx                 # Order history list
│   │   │   │   └── [orderId]/
│   │   │   │       └── page.tsx             # Single order detail
│   │   │   └── account/settings/
│   │   │       └── page.tsx                 # Update name/email/password
│   │   │
│   │   ├── admin/                           # Admin panel (role-gated)
│   │   │   ├── layout.tsx                   # Admin layout: sidebar, breadcrumbs
│   │   │   ├── page.tsx                     # Dashboard: stats overview
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                 # Product table with search/filter
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx             # Create product form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx             # Edit product form
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx                 # Orders table with status filter
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx             # Order detail + status update
│   │   │   ├── users/
│   │   │   │   ├── page.tsx                 # Users table
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx             # User detail + role management
│   │   │   └── categories/
│   │   │       ├── page.tsx                 # Category tree management
│   │   │       └── new/
│   │   │           └── page.tsx             # Create/edit category
│   │   │
│   │   └── api/                             # Route handlers
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts             # NextAuth.js handler (GET + POST)
│   │       ├── register/
│   │       │   └── route.ts                 # POST: create user + hash password
│   │       ├── forgot-password/
│   │       │   └── route.ts                 # POST: generate token + send Resend email
│   │       ├── reset-password/
│   │       │   └── route.ts                 # POST: validate token + update password
│   │       ├── products/
│   │       │   ├── route.ts                 # GET: list products (public)
│   │       │   └── [id]/
│   │       │       └── route.ts             # GET: single product (public)
│   │       ├── cart/
│   │       │   ├── route.ts                 # GET: fetch cart | POST: add item
│   │       │   └── [itemId]/
│   │       │       └── route.ts             # PATCH: update qty | DELETE: remove item
│   │       ├── orders/
│   │       │   ├── route.ts                 # GET: user's orders (auth required)
│   │       │   └── [id]/
│   │       │       └── route.ts             # GET: order detail (owner or admin)
│   │       ├── checkout/
│   │       │   └── route.ts                 # POST: create Stripe Checkout Session
│   │       ├── webhooks/
│   │       │   └── stripe/
│   │       │       └── route.ts             # POST: Stripe webhook (raw body)
│   │       └── admin/
│   │           ├── products/
│   │           │   ├── route.ts             # POST: create product (admin)
│   │           │   └── [id]/
│   │           │       └── route.ts         # PATCH/DELETE: update/delete product
│   │           ├── orders/
│   │           │   └── [id]/
│   │           │       └── route.ts         # PATCH: update order status
│   │           ├── users/
│   │           │   └── [id]/
│   │           │       └── route.ts         # PATCH: update role | DELETE: deactivate
│   │           └── categories/
│   │               ├── route.ts             # POST: create category
│   │               └── [id]/
│   │                   └── route.ts         # PATCH/DELETE: update/delete category
│   │
│   ├── components/
│   │   ├── ui/                              # shadcn/ui auto-generated primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── sheet.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx                   # Top nav: logo, search, cart icon, auth state
│   │   │   ├── Footer.tsx                   # Footer: links, newsletter, legal disclaimers
│   │   │   ├── MobileNav.tsx                # Hamburger menu for mobile
│   │   │   ├── CartSidebar.tsx              # Framer Motion slide-in cart drawer
│   │   │   ├── AdminSidebar.tsx             # Admin nav sidebar
│   │   │   └── AgeGate.tsx                  # Full-screen age verification modal (18+, 30-day cookie)
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx                # react-hook-form + Zod validation
│   │   │   ├── RegisterForm.tsx             # Registration with password strength
│   │   │   ├── ForgotPasswordForm.tsx       # Email input form
│   │   │   └── ResetPasswordForm.tsx        # New password + confirm
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.tsx              # Card with image, name, price, add-to-cart
│   │   │   ├── ProductGrid.tsx              # Responsive grid of ProductCards
│   │   │   ├── ProductFilters.tsx           # Category, price range, in-stock filters
│   │   │   ├── ProductImages.tsx            # Image gallery with zoom
│   │   │   ├── ProductVariantSelector.tsx   # Weight/size variant picker
│   │   │   ├── ProductBadge.tsx             # In-stock / Out-of-stock / Sale badge
│   │   │   └── ProductSearch.tsx            # Debounced search input
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx                 # Single cart line item with qty controls
│   │   │   ├── CartSummary.tsx              # Subtotal, tax estimate, checkout CTA
│   │   │   └── AddToCartButton.tsx          # Button with optimistic UI + animation
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutButton.tsx           # Initiates Stripe session, shows spinner
│   │   │   └── OrderSummary.tsx             # Read-only cart summary pre-Stripe
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderCard.tsx                # Order list item with status badge
│   │   │   ├── OrderDetail.tsx              # Full order breakdown
│   │   │   └── OrderStatusBadge.tsx         # Color-coded status chip
│   │   │
│   │   ├── admin/
│   │   │   ├── ProductForm.tsx              # Create/edit product form
│   │   │   ├── ProductTable.tsx             # Paginated product data table
│   │   │   ├── OrderTable.tsx               # Orders with inline status update
│   │   │   ├── UserTable.tsx                # Users with role toggle
│   │   │   ├── CategoryTree.tsx             # Drag-reorderable category hierarchy
│   │   │   ├── DashboardStats.tsx           # Revenue, orders, users stats cards
│   │   │   └── ImageUpload.tsx              # Drag-drop image upload with preview
│   │   │
│   │   └── animations/
│   │       ├── PageTransition.tsx           # Framer Motion layout animation wrapper
│   │       ├── FadeIn.tsx                   # Generic fade-in-up component
│   │       ├── StaggerContainer.tsx         # Staggered children animation
│   │       └── CartBounce.tsx               # Cart icon bounce on item add
│   │
│   ├── lib/
│   │   ├── db.ts                            # Prisma client singleton
│   │   ├── auth.ts                          # NextAuth.js config (providers, callbacks)
│   │   ├── stripe.ts                        # Stripe client singleton
│   │   ├── resend.ts                        # Resend client singleton
│   │   ├── validations/
│   │   │   ├── auth.ts                      # Zod schemas: login, register, reset
│   │   │   ├── product.ts                   # Zod schemas: create/update product
│   │   │   ├── cart.ts                      # Zod schemas: add/update cart item
│   │   │   └── order.ts                     # Zod schemas: order status update
│   │   ├── utils/
│   │   │   ├── cn.ts                        # clsx + tailwind-merge utility
│   │   │   ├── formatPrice.ts               # Currency formatting (EUR/PLN)
│   │   │   ├── generateSlug.ts              # URL slug generator
│   │   │   ├── hashPassword.ts              # bcrypt hash + compare
│   │   │   └── generateToken.ts             # Crypto random token for password reset
│   │   └── email/
│   │       ├── templates/
│   │       │   ├── PasswordReset.tsx        # React Email template: reset link
│   │       │   ├── OrderConfirmation.tsx    # React Email template: order summary
│   │       │   ├── WelcomeEmail.tsx         # React Email template: welcome after registration
│   │       │   ├── EmailVerification.tsx    # React Email template: verify email address
│   │       │   └── OrderShipped.tsx         # React Email template: shipping notification
│   │       └── send.ts                      # Typed sendEmail() wrapper around Resend
│   │
│   ├── hooks/
│   │   ├── useCart.ts                       # Cart state + sync logic (Zustand + API)
│   │   ├── useAuth.ts                       # Session wrapper with role helpers
│   │   ├── useProducts.ts                   # fetch wrapper for product queries
│   │   └── useToast.ts                      # shadcn toast trigger shortcut
│   │
│   ├── store/
│   │   └── cartStore.ts                     # Zustand cart store (guest localStorage)
│   │
│   ├── types/
│   │   ├── next-auth.d.ts                   # NextAuth session type augmentation
│   │   ├── product.ts                       # Product + Variant type interfaces
│   │   ├── cart.ts                          # Cart + CartItem type interfaces
│   │   └── order.ts                         # Order + OrderItem type interfaces
│   │
│   └── middleware.ts                        # Next.js middleware: auth guards + admin gate
│
├── .env.local                               # Local secrets (never committed)
├── .env.example                             # Template with variable names only
├── next.config.ts                           # Next.js config: image domains, headers
├── tailwind.config.ts                       # Tailwind: custom colors, fonts, plugins
├── postcss.config.js                        # PostCSS for Tailwind
├── tsconfig.json                            # TypeScript config
├── components.json                          # shadcn/ui config
├── package.json
└── package-lock.json
```

---

## 2. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  PACKED
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
}

enum StrainType {
  INDICA
  SATIVA
  HYBRID
  CBD
}

model User {
  id                  String               @id @default(cuid())
  email               String               @unique
  name                String?
  passwordHash        String?
  role                Role                 @default(CUSTOMER)
  emailVerified       DateTime?
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  dateOfBirth         DateTime?
  cart                Cart?
  orders              Order[]
  addresses           Address[]
  passwordResetTokens PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]
  accounts            Account[]

  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

model Address {
  id         String  @id @default(cuid())
  userId     String
  fullName   String
  line1      String
  line2      String?
  city       String
  postalCode String
  country    String
  isDefault  Boolean @default(false)

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders Order[]

  @@index([userId])
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  imageUrl    String?
  parentId    String?
  sortOrder   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  icon     String?
  isActive Boolean @default(true)

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]

  @@index([slug])
  @@index([parentId])
}

model Product {
  id               String      @id @default(cuid())
  name             String
  slug             String      @unique
  description      String
  shortDescription String?
  imageUrls        String[]
  categoryId       String
  isActive         Boolean     @default(true)
  isFeatured       Boolean     @default(false)
  basePrice        Decimal     @default(0) @db.Decimal(10, 2)
  thcContent       Decimal?    @db.Decimal(5, 2)
  cbdContent       Decimal?    @db.Decimal(5, 2)
  strainType       StrainType?
  effects          String[]
  flavours         String[]
  terpenes         String[]
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  category   Category         @relation(fields: [categoryId], references: [id])
  variants   ProductVariant[]
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@index([slug])
  @@index([categoryId])
  @@index([isActive])
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  name        String
  sku         String?  @unique
  price       Decimal  @db.Decimal(10, 2)
  weightGrams Float?
  stock       Int      @default(0)
  isDefault   Boolean  @default(false)

  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@index([productId])
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]
}

model CartItem {
  id        String @id @default(cuid())
  cartId    String
  productId String
  variantId String
  quantity  Int    @default(1)

  cart    Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product        @relation(fields: [productId], references: [id])
  variant ProductVariant @relation(fields: [variantId], references: [id])

  @@unique([cartId, variantId])
  @@index([cartId])
}

model Order {
  id                    String      @id @default(cuid())
  userId                String
  addressId             String?
  status                OrderStatus @default(PENDING)
  stripePaymentIntentId String?     @unique
  stripeSessionId       String?     @unique
  subtotalAmount        Int
  taxAmount             Int         @default(0)
  shippingAmount        Int         @default(0)
  totalAmount           Int
  currency              String      @default("EUR")
  notes                 String?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  user    User        @relation(fields: [userId], references: [id])
  address Address?    @relation(fields: [addressId], references: [id])
  items   OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([stripeSessionId])
}

model OrderItem {
  id           String @id @default(cuid())
  orderId      String
  productId    String
  variantId    String
  productName  String
  variantLabel String
  unitPrice    Int
  quantity     Int

  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product        @relation(fields: [productId], references: [id])
  variant ProductVariant @relation(fields: [variantId], references: [id])

  @@index([orderId])
}
```

---

## 3. API Routes Map

### Public Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | List products (`?category=`, `?search=`, `?page=`, `?featured=`) |
| GET | `/api/products/[id]` | Single product with variants |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/register` | Create user account |
| POST | `/api/forgot-password` | Send password reset email |
| POST | `/api/reset-password` | Validate token + set new password |
| POST | `/api/verify-email` | `api/verify-email/route.ts` | Validate token + mark email verified |
| POST | `/api/resend-verification` | `api/resend-verification/route.ts` | Resend verification email |
| POST | `/api/webhooks/stripe` | Stripe event handler (raw body, sig verified) |

### Authenticated User Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/cart` | Fetch user cart |
| POST | `/api/cart` | Add item to cart |
| PATCH | `/api/cart/[itemId]` | Update cart item quantity |
| DELETE | `/api/cart/[itemId]` | Remove cart item |
| POST | `/api/checkout` | Create Stripe Checkout Session |
| GET | `/api/orders` | List user's orders |
| GET | `/api/orders/[id]` | Single order detail |

### Admin Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/products` | Create product |
| PATCH/DELETE | `/api/admin/products/[id]` | Update/delete product |
| PATCH | `/api/admin/orders/[id]` | Update order status |
| PATCH/DELETE | `/api/admin/users/[id]` | Update role / deactivate user |
| POST | `/api/admin/categories` | Create category |
| PATCH/DELETE | `/api/admin/categories/[id]` | Update/delete category |

---

## 4. Auth Flow

### Registration
```
RegisterForm → POST /api/register
  → Zod validation
  → Check email uniqueness
  → bcrypt.hash(password, 12)
  → prisma.user.create()
  → 201 → redirect /login?registered=true
```

### Login
```
LoginForm → signIn("credentials", { email, password })
  → NextAuth Credentials provider
  → prisma.user.findUnique
  → bcrypt.compare
  → JWT created with { id, role }
  → redirect /account (or callbackUrl)
```

### Forgot Password
```
POST /api/forgot-password
  → Find user (silent if not found — prevents enumeration)
  → crypto.randomBytes(32).toString('hex') → token
  → prisma.passwordResetToken.create({ token, expiresAt: now+1h })
  → resend.emails.send(PasswordReset template)
  → Always 200

/reset-password?token=... → POST /api/reset-password
  → Validate token (exists, not expired, not used)
  → bcrypt.hash(newPassword, 12)
  → prisma.$transaction([user.update, token.update({ usedAt })])
  → redirect /login?reset=true
```

### JWT Session Structure
```typescript
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name: string | null; role: "CUSTOMER" | "ADMIN" }
  }
  interface JWT { id: string; role: "CUSTOMER" | "ADMIN" }
}
```

---

## 5. Payment Flow

```
CheckoutButton → POST /api/checkout
  → Validate session
  → Fetch cart with items
  → Build Stripe line_items (price in euro-cents: Math.round(price * 100))
  → stripe.checkout.sessions.create({ mode: "payment", ... })
  → Return { url }
  → window.location.href = url

Stripe processes payment → redirects to /checkout/success?session_id=...

POST /api/webhooks/stripe (checkout.session.completed)
  → Verify stripe-signature
  → prisma.$transaction([
      order.create({ status: PAID, items: [...] }),
      cartItem.deleteMany(),
      productVariant.update({ stock: { decrement } }) x N
    ])
  → sendEmail OrderConfirmation
  → 200
```

---

## 6. Environment Variables

```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL
NODE_ENV
```

---

## 7. Dependencies

```
next react react-dom typescript @types/node @types/react @types/react-dom
@prisma/client prisma
next-auth bcryptjs @types/bcryptjs
stripe @stripe/stripe-js
resend @react-email/components @react-email/render
zustand
zod
tailwindcss autoprefixer postcss @tailwindcss/typography tailwindcss-animate
framer-motion
class-variance-authority clsx tailwind-merge
lucide-react
@radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
@radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot
@radix-ui/react-toast @radix-ui/react-sheet
react-hook-form @hookform/resolvers
eslint eslint-config-next prettier prettier-plugin-tailwindcss
```

---

## 8. Middleware Route Guards

```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/account/:path*', '/checkout/:path*', '/admin/:path*',
    '/api/cart/:path*', '/api/orders/:path*', '/api/checkout/:path*', '/api/admin/:path*',
  ]
}
// No session → redirect /login?callbackUrl=...
// Session + non-admin on /admin/* → redirect /
// Session + non-admin on /api/admin/* → 403 JSON
```

---

## 9. Order Status Transitions

```
PENDING → PAID              (webhook only)
PAID → PROCESSING           (admin)
PROCESSING → PACKED         (admin)
PACKED → OUT_FOR_DELIVERY   (admin)
OUT_FOR_DELIVERY → DELIVERED (admin)
PROCESSING → SHIPPED        (admin)
SHIPPED → DELIVERED         (admin)
PAID → CANCELLED            (admin, triggers Stripe refund)
PAID → REFUNDED             (Stripe webhook charge.refunded)
```

---

## 10. Build Sequence

### Phase 1 — Foundation
- [ ] `npm create next-app@latest` with TypeScript, Tailwind, App Router, src/ directory
- [ ] Install all dependencies
- [ ] Configure `tailwind.config.ts` with brand colors
- [ ] Initialize shadcn/ui and add all components
- [ ] Write `prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create `src/lib/db.ts`, `src/lib/auth.ts`
- [ ] Wire `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create `src/middleware.ts`
- [ ] Create `src/components/layout/AgeGate.tsx` with 30-day cookie logic

### Phase 2 — Auth
- [ ] All auth API routes
- [ ] Email templates + send.ts
- [ ] `hashPassword.ts`, `generateToken.ts`
- [ ] Auth form components and pages

### Phase 3 — Product Catalog
- [ ] `prisma/seed.ts` with categories and products
- [ ] Product API routes
- [ ] Product components and pages
- [ ] Homepage with featured products

### Phase 4 — Cart
- [ ] Zustand store with localStorage persistence
- [ ] Cart API routes
- [ ] `useCart.ts` unified hook
- [ ] CartSidebar + cart components
- [ ] Guest-to-authenticated cart merge

### Phase 5 — Checkout & Payments
- [ ] Stripe singleton
- [ ] Checkout + webhook API routes
- [ ] Checkout pages and components

### Phase 6 — Orders
- [ ] Order API routes
- [ ] Account orders pages and components
- [ ] Order confirmation email

### Phase 7 — Admin Panel
- [ ] Admin layout + sidebar
- [ ] All admin API routes
- [ ] Admin dashboard, product, order, user, category management

### Phase 8 — Polish & Animations
- [ ] PageTransition, FadeIn, StaggerContainer, CartBounce
- [ ] Mobile nav with Framer Motion
- [ ] Loading skeletons
- [ ] SEO generateMetadata on all pages
- [ ] Responsive audit
