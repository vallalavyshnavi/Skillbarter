'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  Briefcase,
  Loader2,
  Send,
  Building2,
} from 'lucide-react';
import type { Job } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      const [jobRes, appRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('*, employer:profiles!employer_id(*)')
          .eq('id', id)
          .maybeSingle(),
        user
          ? supabase
              .from('job_applications')
              .select('id')
              .eq('job_id', id)
              .eq('applicant_id', user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setJob(jobRes.data as Job);
      setApplied(!!appRes.data);
      setLoading(false);
    }
    load();
  }, [id, user]);

  async function handleApply() {
    if (!user) { router.push('/auth/login'); return; }
    setApplying(true);
    const { error } = await supabase.from('job_applications').insert({
      job_id: id as string,
      applicant_id: user.id,
      cover_letter: coverLetter,
      status: 'applied',
    });

    if (error) {
      toast.error('Failed to apply: ' + error.message);
    } else {
      try { await supabase.rpc('increment_applications' as any, { job_id: id as string }); } catch { }
      toast.success('Application submitted successfully!');
      setApplied(true);
      setShowForm(false);
    }
    setApplying(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <Button asChild className="mt-4"><Link href="/jobs">Back to Jobs</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs</Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground font-medium">{job.company}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || 'Remote'}</span>
                {job.salary_range && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {job.salary_range}</span>}
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {job.applications_count} applicants</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="capitalize">{job.job_type}</Badge>
                {job.requires_certification && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Certificate Required
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {job.description && (
            <>
              <Separator className="my-5" />
              <div>
                <h2 className="font-semibold mb-3">About this Role</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </>
          )}

          {job.requirements && (
            <>
              <Separator className="my-5" />
              <div>
                <h2 className="font-semibold mb-3">Requirements</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </>
          )}

          {job.required_skills?.length > 0 && (
            <>
              <Separator className="my-5" />
              <div>
                <h2 className="font-semibold mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator className="my-5" />

          {/* Apply section */}
          {applied ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Application Submitted</p>
                <p className="text-sm text-muted-foreground">You've already applied for this position.</p>
              </div>
            </div>
          ) : showForm ? (
            <div className="space-y-4">
              <h2 className="font-semibold">Apply for this Position</h2>
              <div className="space-y-1.5">
                <Label>Cover Letter (Optional)</Label>
                <Textarea
                  placeholder="Tell the employer why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleApply} disabled={applying}>
                  {applying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Application</>}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full h-11"
              onClick={() => user ? setShowForm(true) : router.push('/auth/login')}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              {user ? 'Apply Now' : 'Sign in to Apply'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
