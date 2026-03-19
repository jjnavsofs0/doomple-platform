# Admin Lead Management Pages

This document describes the admin lead management pages and components created for the Doomple platform.

## Structure

### App Pages

#### 1. **Admin Layout** (`/src/app/admin/layout.tsx`)
- Root layout for all admin pages
- Imports `AdminLayout` from components
- Sets metadata title: "Admin | Doomple Technologies"
- Wraps all child pages with the admin layout wrapper

#### 2. **Admin Dashboard** (`/src/app/admin/page.tsx`)
- Management overview page
- Displays key statistics:
  - Total Leads count
  - Active Projects count
  - Pending Invoices count
  - Revenue This Month
- Quick action buttons: New Lead, New Project, New Invoice
- Recent leads table (last 5 leads)
- Recent invoices table (last 5 invoices)
- Fetches data from `/api/dashboard?type=management`

#### 3. **Leads Listing** (`/src/app/admin/leads/page.tsx`)
- "use client" component
- Paginated lead listing with filters
- **Filters:**
  - Status dropdown (NEW, CONTACTED, QUALIFIED, DISCOVERY_SCHEDULED, PROPOSAL_SENT, NEGOTIATION, WON, LOST, ON_HOLD)
  - Category dropdown (SERVICE_INQUIRY, SOLUTION_INQUIRY, UEP_INQUIRY, SAAS_TOOLKIT_INQUIRY, WORKFORCE_INQUIRY, SUPPORT_INQUIRY, PARTNERSHIP_INQUIRY)
  - Priority dropdown (LOW, MEDIUM, HIGH, URGENT)
  - Search input (name, email, company)
- **Table Columns:**
  - Name
  - Company
  - Email
  - Category
  - Status (with StatusBadge)
  - Priority (with StatusBadge)
  - Assigned To
  - Created Date
  - Actions (View button)
- Pagination controls (Previous/Next)
- Click row or View button to navigate to lead detail
- Fetches from `/api/leads?page=X&limit=10&filters...`

#### 4. **New Lead Form** (`/src/app/admin/leads/new/page.tsx`)
- Simple wrapper page
- Uses `LeadForm` component
- Redirects to lead detail on success

#### 5. **Lead Detail** (`/src/app/admin/leads/[id]/page.tsx`)
- "use client" component
- Comprehensive lead management interface
- **Header Section:**
  - Lead name with back button
  - Company name (if available)
  - Edit button
- **Main Content:**
  - Lead Pipeline visualization
  - Tabs for Overview, Notes, Activity
- **Overview Tab:**
  - Contact Information (Email, Phone, Location, Company)
  - Lead Details (Category, Source, Priority, Status, Budget, Timeline, Business Stage, Project Type)
  - Requirements Summary (if available)
- **Notes Tab:**
  - Add note form
  - List of all notes with timestamps
- **Activity Tab:**
  - Activity timeline with chronological order
  - Shows activity type, description, user, and timestamp
- **Sidebar:**
  - Status dropdown with change functionality
  - Convert to Client button
  - Key information (Assigned To, Created, Last Updated)
- Fetches from `/api/leads/[id]`

#### 6. **Edit Lead** (`/src/app/admin/leads/[id]/edit/page.tsx`)
- "use client" component
- Uses `LeadForm` component with initial data
- Redirects to lead detail on success
- Fetches lead data to pre-populate form

## Components

### Lead Form (`/src/components/admin/lead-form.tsx`)
- Reusable form component for creating and editing leads
- **Form Sections:**
  1. **Basic Information**
     - Full Name (required)
     - Email (required)
     - Company Name (optional)
     - Phone (optional)
     - Location (optional)
     - Country (optional)
  2. **Classification**
     - Source (required): WEBSITE, REFERRAL, SOCIAL_MEDIA, CAMPAIGN, DIRECT, PARTNER, OTHER
     - Category (required): SERVICE_INQUIRY, SOLUTION_INQUIRY, UEP_INQUIRY, SAAS_TOOLKIT_INQUIRY, WORKFORCE_INQUIRY, SUPPORT_INQUIRY, PARTNERSHIP_INQUIRY
     - Priority: LOW, MEDIUM (default), HIGH, URGENT
  3. **Business Details**
     - Offering Type (optional)
     - Selected Service (optional)
     - Selected Solution (optional)
     - Project Type (optional)
     - Budget Range (optional): UNDER_50K, 50K_100K, 100K_500K, 500K_1CR, ABOVE_1CR
     - Timeline (optional): IMMEDIATE, SHORT_TERM, MEDIUM_TERM, LONG_TERM
     - Business Stage (optional)
  4. **Requirements**
     - Requirements Summary (optional, textarea)
- **Validation:** Uses Zod schema
- **Submission:**
  - POST `/api/leads` for new leads
  - PATCH `/api/leads/[id]` for updates
- **Error Handling:** Shows validation and submission errors
- **Callbacks:** Optional `onSuccess` callback for custom handling

### Lead Pipeline (`/src/components/admin/lead-pipeline.tsx`)
- Visual representation of lead stages
- **Stages:**
  1. New
  2. Contacted
  3. Qualified
  4. Discovery (Scheduled)
  5. Proposal
  6. Negotiation
  7. Won
- Shows current stage highlighted
- Completed stages show checkmark icon
- Current stage has ring effect
- Upcoming stages are grayed out
- Smooth visual progress bar

### Activity Timeline (`/src/components/admin/activity-timeline.tsx`)
- Displays lead activities in chronological order
- **Activity Types with Icons:**
  - Note (MessageSquare)
  - Status Change (CheckCircle2)
  - Assignment (AlertCircle)
  - Document (FileText)
  - Default (Clock)
- **Features:**
  - Color-coded by activity type
  - Timeline line connects activities
  - Shows user who performed activity
  - Shows timestamp for each activity
  - Loading skeleton state
  - Empty state message

## API Endpoints Used

- `GET /api/dashboard?type=management` - Dashboard statistics
- `GET /api/leads` - List leads with pagination and filters
- `GET /api/leads/[id]` - Get single lead with relations
- `POST /api/leads` - Create new lead
- `PATCH /api/leads/[id]` - Update lead
- `POST /api/leads/[id]/notes` - Add note to lead
- `POST /api/leads/[id]/convert` - Convert lead to client

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `next/navigation` - Router and URL params

## Styling

- All components use Tailwind CSS
- Components follow the existing UI component library
- Responsive design with `md:` and `lg:` breakpoints
- Dark mode support through CSS variables
- Custom components: StatsCard, Card, Button, Input, Select, Textarea, Table, Tabs, StatusBadge, PageHeader, Skeleton

## Features

### Dashboard
- Real-time stats cards with trending indicators
- Quick action buttons for fast navigation
- Recent items preview tables

### Lead Listing
- Advanced filtering and search
- Pagination support
- Status and priority badges
- Click-to-view navigation

### Lead Management
- Complete lead lifecycle tracking
- Status pipeline visualization
- Note-taking system
- Activity timeline
- Lead-to-client conversion
- Inline status updates

### Form Features
- Multi-section organized form
- Comprehensive field coverage
- Client-side validation with error messages
- Loading states
- Error handling and display
- Cancel option

## User Experience

- Loading skeletons for better perceived performance
- Error states with helpful messages
- Confirmation for important actions (convert to client)
- Responsive design for mobile and desktop
- Intuitive navigation with breadcrumbs
- Quick action buttons in multiple locations
- Visual status indicators throughout

## Future Enhancements

- Bulk operations (edit multiple leads)
- Export to CSV/Excel
- Lead scoring algorithm
- Automated follow-up reminders
- Email integration
- Document attachment
- Lead source tracking and analytics
- Custom field support
- Lead assignment to team members with notifications
- Lead history/changelog
