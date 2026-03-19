/**
 * Lead statuses with labels and colors
 */
export const LEAD_STATUSES = {
  NEW: {
    label: "New",
    color: "bg-blue-100 text-blue-800",
    badgeColor: "badge-info",
  },
  CONTACTED: {
    label: "Contacted",
    color: "bg-yellow-100 text-yellow-800",
    badgeColor: "badge-warning",
  },
  QUALIFIED: {
    label: "Qualified",
    color: "bg-purple-100 text-purple-800",
    badgeColor: "badge-primary",
  },
  PROPOSAL: {
    label: "Proposal Sent",
    color: "bg-indigo-100 text-indigo-800",
    badgeColor: "badge-info",
  },
  CONVERTED: {
    label: "Converted",
    color: "bg-green-100 text-green-800",
    badgeColor: "badge-success",
  },
  LOST: {
    label: "Lost",
    color: "bg-red-100 text-red-800",
    badgeColor: "badge-danger",
  },
} as const;

/**
 * Project statuses with labels and colors
 */
export const PROJECT_STATUSES = {
  PLANNING: {
    label: "Planning",
    color: "bg-blue-100 text-blue-800",
    badgeColor: "badge-info",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    badgeColor: "badge-warning",
  },
  IN_REVIEW: {
    label: "In Review",
    color: "bg-purple-100 text-purple-800",
    badgeColor: "badge-primary",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    badgeColor: "badge-success",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "bg-orange-100 text-orange-800",
    badgeColor: "badge-warning",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    badgeColor: "badge-danger",
  },
} as const;

/**
 * Invoice statuses with labels and colors
 */
export const INVOICE_STATUSES = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-100 text-gray-800",
    badgeColor: "badge-secondary",
  },
  SENT: {
    label: "Sent",
    color: "bg-blue-100 text-blue-800",
    badgeColor: "badge-info",
  },
  VIEWED: {
    label: "Viewed",
    color: "bg-cyan-100 text-cyan-800",
    badgeColor: "badge-info",
  },
  PAID: {
    label: "Paid",
    color: "bg-green-100 text-green-800",
    badgeColor: "badge-success",
  },
  OVERDUE: {
    label: "Overdue",
    color: "bg-red-100 text-red-800",
    badgeColor: "badge-danger",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-200 text-gray-800",
    badgeColor: "badge-secondary",
  },
} as const;

/**
 * Services offered by Doomple
 */
export const SERVICES = [
  {
    slug: "web-development",
    title: "Web Development",
    shortDescription:
      "Custom web applications built with modern technologies",
    icon: "Globe",
  },
  {
    slug: "mobile-development",
    title: "Mobile Development",
    shortDescription: "Native and cross-platform mobile applications",
    icon: "Smartphone",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    shortDescription: "Beautiful and user-friendly interface design",
    icon: "Palette",
  },
  {
    slug: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    shortDescription: "Scalable cloud solutions and deployment",
    icon: "Cloud",
  },
  {
    slug: "data-analytics",
    title: "Data Analytics",
    shortDescription: "Data-driven insights and business intelligence",
    icon: "BarChart3",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    shortDescription: "Online marketing and growth strategies",
    icon: "TrendingUp",
  },
  {
    slug: "consulting",
    title: "Consulting",
    shortDescription: "Strategic technology consulting services",
    icon: "Lightbulb",
  },
  {
    slug: "maintenance-support",
    title: "Maintenance & Support",
    shortDescription: "Ongoing support and maintenance services",
    icon: "Wrench",
  },
] as const;

/**
 * Solutions offered by Doomple
 */
export const SOLUTIONS = [
  {
    slug: "startup-accelerator",
    title: "Startup Accelerator",
    shortDescription: "End-to-end solutions for startup growth",
    icon: "Rocket",
  },
  {
    slug: "enterprise-transformation",
    title: "Enterprise Transformation",
    shortDescription: "Digital transformation for large organizations",
    icon: "Zap",
  },
  {
    slug: "saas-development",
    title: "SaaS Development",
    shortDescription: "Build and scale your SaaS product",
    icon: "Package",
  },
  {
    slug: "ecommerce-solutions",
    title: "E-Commerce Solutions",
    shortDescription: "Complete online store solutions",
    icon: "ShoppingCart",
  },
  {
    slug: "marketplace-platform",
    title: "Marketplace Platform",
    shortDescription: "Build your own multi-vendor marketplace",
    icon: "Store",
  },
  {
    slug: "crm-implementation",
    title: "CRM Implementation",
    shortDescription: "Customized CRM solutions for your business",
    icon: "Users",
  },
] as const;

/**
 * Industries served by Doomple
 */
export const INDUSTRIES = [
  "E-Commerce",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Real Estate",
  "Travel & Hospitality",
  "Manufacturing",
  "Retail",
  "Technology",
  "Media & Entertainment",
  "Logistics",
  "Insurance",
  "Automotive",
  "Agriculture",
  "Non-Profit",
] as const;

/**
 * Budget ranges for lead qualification
 */
export const BUDGET_RANGES = [
  { value: "0-50k", label: "₹0 - ₹50,000" },
  { value: "50k-100k", label: "₹50,000 - ₹1,00,000" },
  { value: "100k-500k", label: "₹1,00,000 - ₹5,00,000" },
  { value: "500k-1m", label: "₹5,00,000 - ₹10,00,000" },
  { value: "1m+", label: "₹10,00,000+" },
] as const;

/**
 * Billing models
 */
export const BILLING_MODELS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "time-material", label: "Time & Material" },
  { value: "retainer", label: "Retainer" },
] as const;

/**
 * Navigation items for public site
 */
export const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Services",
    href: "/services",
    submenu: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Mobile Development", href: "/services/mobile-development" },
      { label: "UI/UX Design", href: "/services/ui-ux-design" },
      { label: "Cloud Infrastructure", href: "/services/cloud-infrastructure" },
      { label: "Data Analytics", href: "/services/data-analytics" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
      { label: "Consulting", href: "/services/consulting" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    submenu: [
      { label: "Startup Accelerator", href: "/solutions/startup-accelerator" },
      {
        label: "Enterprise Transformation",
        href: "/solutions/enterprise-transformation",
      },
      { label: "SaaS Development", href: "/solutions/saas-development" },
      { label: "E-Commerce", href: "/solutions/ecommerce-solutions" },
      { label: "Marketplace", href: "/solutions/marketplace-platform" },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
] as const;

/**
 * Navigation items for admin dashboard
 */
export const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: "Users",
    badge: "new",
  },
  {
    label: "Clients",
    href: "/admin/clients",
    icon: "Building2",
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: "Briefcase",
  },
  {
    label: "Quotations",
    href: "/admin/quotations",
    icon: "FileText",
  },
  {
    label: "Invoices",
    href: "/admin/invoices",
    icon: "Receipt",
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: "CreditCard",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: "BarChart3",
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: "Users",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
] as const;

/**
 * Company information
 */
export const COMPANY_INFO = {
  name: "Doomple",
  address: "H. No.113 Gali No.1, VIKAS NAGAR, Gurgaon, Basai Road, Gurgaon",
  zipCode: "122001",
  state: "Haryana",
  country: "India",
  contactPerson: "Sneha Sharma",
  email: "sneha@doomple.com",
  phone: "+91-9211698507",
  website: "https://doomple.com",
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

/**
 * Email templates
 */
export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  INVOICE: "invoice",
  QUOTATION: "quotation",
  PROJECT_UPDATE: "project_update",
  PAYMENT_RECEIVED: "payment_received",
  CONTACT_INQUIRY: "contact_inquiry",
} as const;

/**
 * Default date format
 */
export const DATE_FORMAT = "MMM d, yyyy";
export const DATETIME_FORMAT = "MMM d, yyyy h:mm a";
