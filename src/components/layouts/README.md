# Layout Components

This directory contains reusable layout components for the Doomple platform, organized by purpose.

## Public Site Layouts

### PublicHeader
A sticky header component for public-facing pages with responsive mobile menu support.

**Features:**
- Sticky positioning that becomes white with shadow on scroll
- Brand logo (Doomple text in primary color)
- Main navigation: Home, About, Services, Solutions, Industries, Case Studies, Pricing, Blog, Contact
- Dropdown menus for Services (7 items) and Solutions (UEP, SaaS Toolkit, Workforce Suite)
- Mobile hamburger menu with collapsible navigation
- "Get Started" CTA button
- Scroll-aware styling with transparent top state

**Usage:**
```tsx
import { PublicHeader } from "@/components/layouts";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      {/* page content */}
    </>
  );
}
```

**State Management:**
- `isMenuOpen`: Controls mobile menu visibility
- `isScrolled`: Tracks scroll position for header styling
- `openDropdown`: Manages which dropdown is open on mobile

### PublicFooter
A rich footer component with company info, navigation links, contact details, and newsletter signup.

**Features:**
- Company info section with logo and description
- Services column (Web Dev, Mobile Dev, UI/UX, Cloud, Data Analytics, etc.)
- Solutions column (UEP, SaaS Toolkit, Workforce Suite)
- Company column (About, Case Studies, Blog, Contact, Pricing)
- Legal column (Privacy, Terms, Refund)
- Contact info section with address, phone, email
- Social media icons (Facebook, Twitter, LinkedIn, Instagram)
- Newsletter signup form
- Copyright notice with dynamic year
- Bottom legal links bar

**Usage:**
```tsx
import { PublicFooter } from "@/components/layouts";

export default function Layout() {
  return (
    <>
      {/* page content */}
      <PublicFooter />
    </>
  );
}
```

**Data Source:**
Uses `COMPANY_INFO` constant from `/lib/constants.ts` for address, phone, and email.

## Admin Dashboard Layouts

### AdminSidebar
A collapsible sidebar for admin dashboard navigation.

**Features:**
- Logo section with Doomple branding
- Navigation sections with lucide-react icons:
  - Dashboard
  - CRM (Leads)
  - Clients
  - Projects
  - Quotations
  - Invoices
  - Payments
  - Users
  - Settings
- Active route highlighting
- Collapse/expand toggle button
- User info section at bottom (shows when expanded)
- Smooth transitions on collapse/expand

**Usage:**
```tsx
import { AdminSidebar } from "@/components/layouts";

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      {/* admin content */}
    </div>
  );
}
```

**State Management:**
- `isCollapsed`: Controls sidebar width (collapsing to 80px vs 256px)
- Uses `usePathname()` for active route detection

### AdminHeader
A top bar for admin pages with search, notifications, and user dropdown.

**Features:**
- Sidebar toggle button (mobile)
- Breadcrumb navigation support
- Search input placeholder (disabled by default)
- Notification bell with indicator dot
- User avatar dropdown with:
  - User info preview
  - Profile link
  - Settings link
  - Logout button
- Responsive design

**Props:**
```tsx
interface AdminHeaderProps {
  onMenuClick?: () => void;
  className?: string;
  breadcrumb?: { label: string; href?: string }[];
}
```

**Usage:**
```tsx
import { AdminHeader } from "@/components/layouts";

<AdminHeader
  onMenuClick={() => setMobileMenuOpen(true)}
  breadcrumb={[
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Leads" }
  ]}
/>
```

**State Management:**
- `isUserDropdownOpen`: Controls user dropdown visibility
- `hasNotifications`: Determines notification indicator display

### AdminLayout
A complete layout wrapper combining sidebar, header, and content area.

**Features:**
- Flexbox layout with sidebar and main content
- Sidebar hidden on mobile, shown in overlay when needed
- Header with menu toggle functionality
- Responsive mobile sidebar with backdrop overlay
- Support for breadcrumb navigation
- Scrollable main content area

**Props:**
```tsx
interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}
```

**Usage:**
```tsx
import { AdminLayout } from "@/components/layouts";

export default function AdminDashboard() {
  return (
    <AdminLayout breadcrumb={[{ label: "Dashboard" }]}>
      <div className="p-6">
        {/* dashboard content */}
      </div>
    </AdminLayout>
  );
}
```

## Client Portal Layouts

### PortalHeader
A header for the client portal with navigation and user menu.

**Features:**
- Logo linking to portal dashboard
- Navigation items:
  - Dashboard
  - Projects
  - Invoices
  - Payments
  - Documents
  - Profile
- Active route highlighting
- User avatar dropdown with:
  - User info
  - Profile link
  - Settings link
  - Logout button
- Mobile-responsive horizontal scroll navigation
- Mobile avatar button

**Usage:**
```tsx
import { PortalHeader } from "@/components/layouts";

export default function PortalPage() {
  return (
    <>
      <PortalHeader />
      {/* portal content */}
    </>
  );
}
```

**State Management:**
- `isUserDropdownOpen`: Controls user dropdown visibility
- Uses `usePathname()` for active route detection

### PortalLayout
A complete layout wrapper for portal pages.

**Features:**
- PortalHeader at top
- Responsive content area with max-width container
- Flex column layout
- Padding and spacing

**Props:**
```tsx
interface PortalLayoutProps {
  children: React.ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
import { PortalLayout } from "@/components/layouts";

export default function PortalPage() {
  return (
    <PortalLayout>
      <div>
        {/* portal page content */}
      </div>
    </PortalLayout>
  );
}
```

## Reusable Components

### SectionWrapper
A flexible section wrapper for organizing content on public pages with background variants and typography.

**Features:**
- Background variants: white, gray, dark, gradient
- Padding sizes: sm (8-12), md (12-16), lg (16-24) - in rem units
- Optional title and subtitle with centered layout
- Max-width container (7xl)
- Dynamic styling based on background
- Responsive typography

**Props:**
```tsx
interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  background?: "white" | "gray" | "dark" | "gradient";
  padding?: "sm" | "md" | "lg";
  id?: string;
}
```

**Usage:**
```tsx
import { SectionWrapper } from "@/components/layouts";

export default function HomePage() {
  return (
    <SectionWrapper
      title="Our Services"
      subtitle="Comprehensive solutions for your business"
      background="gray"
      padding="lg"
      id="services"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* service cards */}
      </div>
    </SectionWrapper>
  );
}
```

## Brand Colors (CSS Variables)

All components use the following Doomple brand colors defined in globals.css:

- **Primary** (Deep Blue): `--primary` - Main brand color for CTAs and highlights
- **Secondary** (Teal): `--secondary` - Accent color for secondary actions
- **Accent** (Amber): `--accent` - Attention-grabbing accent elements

These are available as Tailwind classes:
- `bg-primary`, `text-primary`, `bg-primary-foreground`
- `bg-secondary`, `text-secondary`, `bg-secondary-foreground`
- `bg-accent`, `text-accent`, `bg-accent-foreground`

## Icons

All components use icons from `lucide-react`:

**Imported Icons:**
- Menu, X, ChevronDown (headers/navigation)
- LayoutDashboard, Users, Building2, Briefcase, FileText, Receipt, CreditCard, Settings (admin sidebar)
- ChevronLeft, ChevronRight (collapse/expand)
- Bell, LogOut (admin/portal headers)
- Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram (footer)
- User (dropdowns)

## Navigation Integration

Components use Next.js `Link` component for routing and `usePathname()` for active state detection. Ensure your routing structure matches the href patterns used.

**Expected Route Structure:**
```
/                          (public home)
/about                     (public pages)
/services/[service]
/solutions/[solution]
/case-studies
/blog
/contact
/pricing
/get-started

/admin/dashboard           (admin routes)
/admin/leads
/admin/clients
/admin/projects
/admin/quotations
/admin/invoices
/admin/payments
/admin/users
/admin/settings
/admin/profile

/portal/dashboard          (portal routes)
/portal/projects
/portal/invoices
/portal/payments
/portal/documents
/portal/profile
/portal/settings
```

## Styling

All components use Tailwind CSS with custom configuration from `tailwind.config.ts`. They leverage:
- CSS custom properties for brand colors
- Responsive utilities for mobile-first design
- Smooth transitions and hover states
- Semantic HTML for accessibility

## Future Enhancements

- Add theme switcher support (dark mode)
- Implement actual notification system
- Add user authentication state integration
- Implement search functionality
- Add breadcrumb generation utilities
- Add more admin sidebar sections
- Newsletter signup backend integration
