'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Loader2,
  Building2,
} from 'lucide-react';
import type { Job } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const jobTypeColors: Record<string, string> = {
  'full-time': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'part-time': 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  'contract': 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'internship': 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  'remote': 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
};

export default function JobsPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [jobType, setJobType] = useState('all');

  useEffect(() => {
    supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setJobs((data || []) as Job[]);
        setLoading(false);
      });
  }, []);

  const filtered = jobs.filter((j) => {
    const matchesQuery =
      !query ||
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.company.toLowerCase().includes(query.toLowerCase()) ||
      j.location.toLowerCase().includes(query.toLowerCase());
    const matchesType = jobType === 'all' || j.job_type === jobType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {jobs.length} open position{jobs.length !== 1 ? 's' : ''} from verified employers
          </p>
        </div>
        {profile?.role === 'employer' && (
          <Button asChild>
            <Link href="/jobs/post">
              <Plus className="mr-2 h-4 w-4" /> Post a Job
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No jobs found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            className={`text-xs border-0 capitalize ${jobTypeColors[job.job_type] || ''}`}
                          >
                            {job.job_type}
                          </Badge>
                          {job.requires_certification && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Cert Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.location || 'Remote'}
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" /> {job.salary_range}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {job.applications_count} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {job.required_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.required_skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {job.required_skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">+{job.required_skills.length - 4}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
