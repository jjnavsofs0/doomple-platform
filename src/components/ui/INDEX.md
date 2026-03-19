# UI Components Library

A comprehensive collection of shadcn/ui-style reusable React components for the Doomple platform.

## Components

### Form Components
- **button.tsx** - Versatile button with 6 variants and 4 sizes
- **input.tsx** - Text input with label, error state, and helper text support
- **textarea.tsx** - Multi-line text input matching input styling
- **select.tsx** - Custom dropdown with label, error state, and helper text
- **label.tsx** - Form label with optional required indicator

### Layout Components
- **card.tsx** - Card container with header, title, description, content, and footer
- **page-header.tsx** - Page title section with description and action slots
- **separator.tsx** - Horizontal or vertical divider line
- **dialog.tsx** - Modal dialog with overlay, header, footer, and close button

### Data Display
- **badge.tsx** - 6 variants (default, secondary, destructive, outline, success, warning)
- **table.tsx** - Complete table structure with header, body, footer, rows, and cells
- **data-table.tsx** - Advanced data table with sorting, searching, and pagination
- **stats-card.tsx** - Dashboard stat card with icon, value, trend indicator
- **status-badge.tsx** - Automatic status-to-color mapping badge

### Navigation & Interaction
- **dropdown-menu.tsx** - Dropdown menu with trigger, content, items, separator, and label
- **tabs.tsx** - Tab navigation with list, triggers, and content panels
- **avatar.tsx** - User avatar with image and fallback support (4 sizes)

### Feedback & Notifications
- **toast.tsx** - Toast notification system with ToastProvider and useToast hook
- **skeleton.tsx** - Animated loading placeholder

### Utility Components
- **empty-state.tsx** - Empty state with icon, title, description, and action button

## Features

All components include:
- ✓ TypeScript support with proper interfaces
- ✓ forwardRef for DOM access where appropriate
- ✓ CSS variable-based Tailwind styling (primary, secondary, destructive, etc.)
- ✓ CVA (Class Variance Authority) for variant patterns
- ✓ cn() utility for class merging
- ✓ "use client" directives for client components
- ✓ Proper accessibility attributes

## Usage

### Import Example
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

### Button Example
```tsx
<Button variant="default" size="lg">
  Click me
</Button>
```

### Form Example
```tsx
<Input 
  label="Email" 
  placeholder="Enter email"
  error={false}
  helperText="Enter a valid email"
/>
```

### Toast Example
```tsx
import { useToast } from "@/components/ui/toast"

function MyComponent() {
  const { toast } = useToast()
  
  return (
    <button onClick={() => toast({ 
      title: "Success", 
      description: "Operation completed",
      type: "success"
    })}>
      Show Toast
    </button>
  )
}
```

## Design System

All components use CSS variables from the Tailwind config:
- Primary colors (primary, primary-foreground)
- Secondary colors (secondary, secondary-foreground)
- Destructive colors (destructive, destructive-foreground)
- Neutral colors (background, foreground, border, muted, etc.)
- UI colors (accent, ring, popover, card)

Dark mode is automatically supported through Tailwind's class-based dark mode system.
