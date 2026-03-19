"use client"

import * as React from "react"
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "default" | "success" | "error" | "info"

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
  open?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast: Toast = {
        ...toast,
        id,
        open: true,
        duration: toast.duration || 3000,
      }

      setToasts((prev) => [...prev, newToast])

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
      }

      return id
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return {
    toast: (options: Omit<Toast, "id">) => context.addToast(options),
    toasts: context.toasts,
    dismiss: context.removeToast,
  }
}

interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:w-[420px]",
        className
      )}
      {...props}
    />
  )
)
ToastViewport.displayName = "ToastViewport"

interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = "ToastAction"

interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
)
ToastClose.displayName = "ToastClose"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: Toast
  onOpenChange?: (open: boolean) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, toast, onOpenChange, ...props }, ref) => {
    const { dismiss } = useToast()

    const getIcon = () => {
      switch (toast.type) {
        case "success":
          return <CheckCircle2 className="h-5 w-5 text-green-600" />
        case "error":
          return <AlertCircle className="h-5 w-5 text-destructive" />
        case "info":
          return <Info className="h-5 w-5 text-blue-600" />
        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative mb-3 flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-border bg-background p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="grid gap-1">
            {toast.title && (
              <p className="text-sm font-semibold leading-relaxed">
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
        </div>
        <ToastClose onClick={() => dismiss(toast.id)} />
      </div>
    )
  }
)
Toast.displayName = "Toast"

interface ToasterProps {}

function Toaster({}: ToasterProps) {
  const { toasts, dismiss } = useToast()

  return (
    <ToastViewport>
      {toasts.map(function (toast) {
        return (
          <Toast
            key={toast.id}
            toast={toast}
            onOpenChange={(open) => {
              if (!open) dismiss(toast.id)
            }}
          />
        )
      })}
    </ToastViewport>
  )
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastViewport,
  Toaster,
}
