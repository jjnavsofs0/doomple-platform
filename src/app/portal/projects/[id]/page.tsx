'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  status: 'done' | 'in-progress' | 'upcoming';
  dueDate: string;
  paymentAmount: number;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  isClientVisible: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  progress: number;
  category: string;
  startDate: string;
  estimatedEndDate: string;
  description: string;
  scope: string;
  milestones: Milestone[];
  notes: Note[];
  documents: Document[];
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'done':
      return <CheckCircle className="text-green-600" size={20} />;
    case 'in-progress':
      return <Clock className="text-blue-600" size={20} />;
    case 'upcoming':
      return <AlertTriangle className="text-gray-400" size={20} />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'upcoming':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/portal/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const result = await response.json();
        setProject(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : project ? (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-indigo-100 text-indigo-800">{project.category}</Badge>
            <Badge
              className={
                project.status === 'active'
                  ? 'bg-blue-100 text-blue-800'
                  : project.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'on-hold'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-purple-100 text-purple-800'
              }
            >
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      ) : null}

      {/* Progress Section */}
      {loading ? (
        <Skeleton className="h-32" />
      ) : project ? (
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{project.progress}% Complete</span>
              <span className="text-sm text-gray-600">
                {Math.round((project.progress / 100) * (project.milestones?.length || 1))} of{' '}
                {project.milestones?.length || 0} milestones completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Project Info Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : project ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">{project.startDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-gray-600">Est. End Date</p>
                  <p className="font-medium text-gray-900">{project.estimatedEndDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Scope */}
      {loading ? (
        <Skeleton className="h-32" />
      ) : project ? (
        <Card>
          <CardHeader>
            <CardTitle>Scope of Work</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{project.scope}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Milestones Timeline */}
      {loading ? (
        <Skeleton className="h-96" />
      ) : project?.milestones && project.milestones.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {/* Timeline line */}
                  {index < project.milestones.length - 1 && (
                    <div className="absolute left-9 top-14 w-0.5 h-12 bg-gray-200" />
                  )}

                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          milestone.status === 'done'
                            ? 'bg-green-100 border-green-600'
                            : milestone.status === 'in-progress'
                              ? 'bg-blue-100 border-blue-600'
                              : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        {getStatusIcon(milestone.status)}
                      </div>
                    </div>

                    {/* Milestone content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-medium text-gray-900">{milestone.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Amount</p>
                          <p className="font-medium text-gray-900">{formatINR(milestone.paymentAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Client-Visible Notes */}
      {loading ? (
        <Skeleton className="h-32" />
      ) : project?.notes && project.notes.filter((n) => n.isClientVisible).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.notes
              .filter((note) => note.isClientVisible)
              .map((note) => (
                <div key={note.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-800 leading-relaxed">{note.content}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Documents */}
      {loading ? (
        <Skeleton className="h-32" />
      ) : project?.documents && project.documents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Download</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
