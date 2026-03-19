// Re-export all Prisma enums and types
export {
  UserRole,
  LeadStatus,
  LeadSource,
  LeadCategory,
  LeadPriority,
  ProjectStatus,
  ProjectCategory,
  BillingModel,
  QuotationStatus,
  InvoiceStatus,
  PaymentStatus,
  MilestoneStatus,
  BlogStatus,
  NotificationType,
} from '@prisma/client';

export type {
  User,
  Lead,
  LeadNote,
  LeadActivity,
  Client,
  ClientDocument,
  ClientCommunication,
  Project,
  ProjectMilestone,
  ProjectNote,
  ProjectDocument,
  ProjectStatusHistory,
  UepProjectDetail,
  ToolkitProjectDetail,
  Quotation,
  QuotationItem,
  Invoice,
  InvoiceItem,
  Payment,
  Service,
  Solution,
  BlogPost,
  CaseStudy,
  ContactSubmission,
  Notification,
  FileAttachment,
  RazorpayWebhookLog,
} from '@prisma/client';

import type {
  User,
  Lead,
  LeadNote,
  LeadActivity,
  Client,
  ClientDocument,
  ClientCommunication,
  Project,
  ProjectMilestone,
  ProjectNote,
  ProjectDocument,
  ProjectStatusHistory,
  UepProjectDetail,
  ToolkitProjectDetail,
  Quotation,
  QuotationItem,
  Invoice,
  InvoiceItem,
  Payment,
} from '@prisma/client';

// ========== EXTENDED TYPES WITH RELATIONS ==========

/**
 * Lead with all related data loaded
 */
export interface LeadWithRelations extends Lead {
  assignedTo: User | null;
  notes: LeadNote[];
  activities: LeadActivity[];
}

/**
 * Client with all related data loaded
 */
export interface ClientWithRelations extends Client {
  documents: ClientDocument[];
  projects: Project[];
  invoices: Invoice[];
  quotations: Quotation[];
}

/**
 * Project with all related data loaded
 */
export interface ProjectWithRelations extends Project {
  client: Client;
  manager: User | null;
  milestones: ProjectMilestone[];
  notes: ProjectNote[];
  documents: ProjectDocument[];
  uepDetail: UepProjectDetail | null;
  toolkitDetail: ToolkitProjectDetail | null;
}

/**
 * Quotation with all related data loaded
 */
export interface QuotationWithRelations extends Quotation {
  items: QuotationItem[];
  lead: Lead | null;
  client: Client | null;
  createdBy: User;
}

/**
 * Invoice with all related data loaded
 */
export interface InvoiceWithRelations extends Invoice {
  items: InvoiceItem[];
  client: Client;
  project: Project | null;
  payments: Payment[];
  createdBy: User;
}

/**
 * Payment with invoice and client data
 */
export interface PaymentWithRelations extends Payment {
  invoice: Invoice & {
    client: Client;
  };
}

// ========== DASHBOARD STATS ==========

/**
 * Lead dashboard statistics
 */
export interface LeadDashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageTimeToClose: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByPriority: Record<string, number>;
}

/**
 * Project dashboard statistics
 */
export interface ProjectDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overallCompletion: number;
  projectsByStatus: Record<string, number>;
  projectsByCategory: Record<string, number>;
  upcomingMilestones: ProjectMilestone[];
  atRiskProjects: Project[];
}

/**
 * Financial dashboard statistics
 */
export interface FinancialDashboardStats {
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  receivedPayments: number;
  outstandingAmount: number;
  averageInvoiceValue: number;
  invoicesByStatus: Record<string, number>;
  revenueByMonth: Record<string, number>;
}

/**
 * Admin dashboard statistics
 */
export interface AdminDashboardStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  totalClients: number;
  totalProjects: number;
  totalRevenue: number;
  totalLeads: number;
  systemHealth: {
    activeUsers: number;
    uptime: number;
    lastBackup: Date;
  };
}

// ========== API RESPONSE TYPES ==========

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

// ========== FORM TYPES ==========

/**
 * User creation/update form
 */
export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  role: string;
  phone?: string;
}

/**
 * Lead creation/update form
 */
export interface LeadFormData {
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  location?: string;
  country?: string;
  source: string;
  category: string;
  offeringType?: string;
  selectedService?: string;
  selectedSolution?: string;
  budgetRange?: string;
  projectType?: string;
  businessStage?: string;
  timeline?: string;
  requirementsSummary?: string;
  priority?: string;
  assignedToId?: string;
}

/**
 * Client creation/update form
 */
export interface ClientFormData {
  type?: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  gstNumber?: string;
  notes?: string;
}

/**
 * Project creation/update form
 */
export interface ProjectFormData {
  name: string;
  category: string;
  description?: string;
  scope?: string;
  startDate?: Date;
  estimatedEndDate?: Date;
  priority?: string;
  budget?: number;
  billingModel?: string;
  clientId: string;
  managerId?: string;
  leadId?: string;
}

/**
 * Quotation creation/update form
 */
export interface QuotationFormData {
  title: string;
  description?: string;
  validUntil?: Date;
  termsNotes?: string;
  leadId?: string;
  clientId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxPercent?: number;
    discount?: number;
  }[];
}

/**
 * Invoice creation/update form
 */
export interface InvoiceFormData {
  dueDate: Date;
  clientId: string;
  projectId?: string;
  quotationId?: string;
  notes?: string;
  billingCategory?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxPercent?: number;
  }[];
}

/**
 * Contact form submission
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  solutionInterest?: string;
  budgetRange?: string;
  timeline?: string;
  businessType?: string;
  message: string;
}

// ========== NAVIGATION TYPES ==========

/**
 * Navigation item type
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  subItems?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

// ========== SEARCH PARAMS ==========

/**
 * Search and filter parameters
 */
export interface SearchParams {
  query?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ========== SERVICE & SOLUTION TYPES ==========

/**
 * Service offering data
 */
export interface ServiceData {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  problemsSolved: string[];
  idealClients: string[];
  deliverables: string[];
  engagementOptions: string[];
  isMarketingOnly: boolean;
}

/**
 * Solution offering data
 */
export interface SolutionData {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  targetCustomers: string[];
  includedModules: string[];
  customizationOptions: string[];
  implementationModel: string;
  speedAdvantage: string;
  isMarketingOnly: boolean;
}

/**
 * UEP Module data
 */
export interface UepModuleData {
  id: string;
  name: string;
  shortDescription: string;
  features: string[];
  benefits: string[];
  icon: string;
}

/**
 * Industry data
 */
export interface IndustryData {
  slug: string;
  name: string;
  description: string;
  challenges: string[];
  howWeHelp: string[];
  relevantServices: string[];
  relevantSolutions: string[];
}

// ========== UTILITY TYPES ==========

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

/**
 * Filter option
 */
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

/**
 * File upload metadata
 */
export interface FileUploadMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Date range
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  percentage?: number;
}
