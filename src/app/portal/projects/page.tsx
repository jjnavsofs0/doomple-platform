'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  FolderKanban,
  Layers3,
  TimerReset,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  progress: number;
  startDate: string;
  estimatedEndDate: string;
  description?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'planning':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'web development':
      return 'bg-indigo-100 text-indigo-700';
    case 'mobile app':
      return 'bg-pink-100 text-pink-700';
    case 'design':
      return 'bg-orange-100 text-orange-700';
    case 'consulting':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/portal/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const result = await response.json();
        setProjects(result.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const activeProjects = projects.filter((project) => project.status === 'active').length;
  const completedProjects = projects.filter((project) => project.status === 'completed').length;
  const averageProgress = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="My Projects"
        description="Track the progress of all your projects in one place"
      />

      <section className="overflow-hidden rounded-[32px] border border-[#D9E8F6] bg-[linear-gradient(135deg,#06284A_0%,#0B3763_54%,#115A84_100%)] p-8 text-white shadow-[0_24px_80px_rgba(4,32,66,0.18)]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-[#7CE6DA]">
              <FolderKanban className="h-4 w-4" />
              Delivery overview
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              See what is active, what is complete, and what needs attention next.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
              Each project card shows progress, category, dates, and direct access to detailed
              milestones and notes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: 'Total Projects',
                value: loading ? '...' : String(projects.length),
                icon: Layers3,
              },
              {
                label: 'Active',
                value: loading ? '...' : String(activeProjects),
                icon: FolderKanban,
              },
              {
                label: 'Avg. Progress',
                value: loading ? '...' : `${averageProgress}%`,
                icon: TimerReset,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
              >
                <item.icon className="h-5 w-5 text-[#7CE6DA]" />
                <p className="mt-4 text-sm text-white/65">{item.label}</p>
                <p className="mt-1 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!loading && projects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-[#DDE8F2] bg-white/90 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-[#64748B]">Active delivery lanes</p>
              <p className="mt-2 text-3xl font-bold text-[#042042]">{activeProjects}</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Currently in motion across discovery, build, or review.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-[#DDE8F2] bg-white/90 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-[#64748B]">Completed projects</p>
              <p className="mt-2 text-3xl font-bold text-[#042042]">{completedProjects}</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Finished engagements that reached delivery or sign-off.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-[#DDE8F2] bg-white/90 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-[#64748B]">Portfolio progress</p>
              <p className="mt-2 text-3xl font-bold text-[#042042]">{averageProgress}%</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Average completion level across your current project list.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-4 rounded-3xl border border-red-200 bg-[linear-gradient(180deg,#FFF6F6_0%,#FFF1F1_100%)] p-6 shadow-sm">
          <AlertCircle className="mt-0.5 text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Unable to load projects</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <p className="mt-2 text-sm text-red-600/80">
              Refresh the page in a moment and your project list should reappear.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-80 rounded-[28px]" />
            <Skeleton className="h-80 rounded-[28px]" />
            <Skeleton className="h-80 rounded-[28px]" />
          </>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <Link key={project.id} href={`/portal/projects/${project.id}`}>
              <Card className="h-full cursor-pointer rounded-[28px] border-[#DDE8F2] bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="rounded-2xl bg-[#EAF7F5] p-3 text-[#0D6C62]">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-[#042042]">{project.name}</h3>
                    {project.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#64748B]">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#E6EEF7] bg-[#F8FBFF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                      Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(project.category)}>
                        {project.category}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#64748B]">Progress</span>
                      <span className="text-sm font-bold text-[#042042]">{project.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#D9E6F3]">
                      <div
                        className="h-2.5 rounded-full bg-[linear-gradient(90deg,#1ABFAD,#3BB2F6)] transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[#E6EEF7] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Calendar size={16} />
                      <span>Started: {project.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Calendar size={16} />
                      <span>Est. End: {project.estimatedEndDate}</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-[#0C6AA6]">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-[32px] border border-dashed border-[#C9DAED] bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF7F5] text-[#0D6C62]">
              <FolderKanban className="h-7 w-7" />
            </div>
            <p className="mt-5 text-xl font-semibold text-[#042042]">No projects yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748B]">
              Once a project is created for your account, it will show up here with milestones,
              progress updates, and important dates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
