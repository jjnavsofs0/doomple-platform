"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { Lead, User } from "@prisma/client";

interface LeadWithRelations extends Lead {
  assignedTo: User | null;
}

interface PaginatedResponse {
  success: boolean;
  data: LeadWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "DISCOVERY_SCHEDULED", label: "Discovery Scheduled" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "ON_HOLD", label: "On Hold" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "SERVICE_INQUIRY", label: "Service Inquiry" },
  { value: "SOLUTION_INQUIRY", label: "Solution Inquiry" },
  { value: "UEP_INQUIRY", label: "UEP Inquiry" },
  { value: "SAAS_TOOLKIT_INQUIRY", label: "SaaS Toolkit Inquiry" },
  { value: "WORKFORCE_INQUIRY", label: "Workforce Inquiry" },
  { value: "SUPPORT_INQUIRY", label: "Support Inquiry" },
  { value: "PARTNERSHIP_INQUIRY", label: "Partnership Inquiry" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

function LeadsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentStatus = searchParams.get("status") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentPriority = searchParams.get("priority") || "";
  const currentSearch = searchParams.get("search") || "";

  const [leads, setLeads] = useState<LeadWithRelations[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(currentStatus && { status: currentStatus }),
        ...(currentCategory && { category: currentCategory }),
        ...(currentPriority && { priority: currentPriority }),
        ...(currentSearch && { search: currentSearch }),
      });

      const response = await fetch(`/api/leads?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leads");

      const data: PaginatedResponse = await response.json();
      setLeads(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStatus, currentCategory, currentPriority, currentSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (leadId: string) => {
    router.push(`/admin/leads/${leadId}`);
  };

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <PageHeader
          title="Leads"
          action={
            <Link href="/admin/leads/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Lead
              </Button>
            </Link>
          }
        />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mt-6">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Leads"
        description="Manage and track all leads"
        action={
          <Link href="/admin/leads/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={currentSearch}
                  onChange={(e) => updateSearchParams("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select
                value={currentStatus}
                onValueChange={(value) => updateSearchParams("status", value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={currentCategory}
                onValueChange={(value) => updateSearchParams("category", value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={currentPriority}
                onValueChange={(value) => updateSearchParams("priority", value)}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length > 0 ? (
                    leads.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(lead.id)}
                      >
                        <TableCell className="font-medium">{lead.fullName}</TableCell>
                        <TableCell className="text-sm">{lead.companyName || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                        <TableCell className="text-sm">
                          {lead.category.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={lead.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={lead.priority}
                            customColorMap={{
                              LOW: "outline",
                              MEDIUM: "default",
                              HIGH: "warning",
                              URGENT: "destructive",
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-sm">
                          {lead.assignedTo?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/leads/${lead.id}`);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, pagination.total)} of{" "}
                    {pagination.total} leads
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", Math.max(1, currentPage - 1).toString());
                        router.push(`?${params.toString()}`);
                      }}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", Math.min(pagination.totalPages, currentPage + 1).toString());
                        router.push(`?${params.toString()}`);
                      }}
                      disabled={currentPage >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="space-y-6 p-6 md:p-8" />}>
      <LeadsPageContent />
    </Suspense>
  );
}
