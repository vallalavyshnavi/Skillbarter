'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Skill } from '@/lib/types';

export default function PostJobPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary_range: '',
    job_type: 'full-time',
    requires_certification: false,
  });

  useEffect(() => {
    supabase.from('skills').select('*').then(({ data }) => setSkills(data || []));
  }, []);

  function addSkill(name: string) {
    if (name && !requiredSkills.includes(name)) {
      setRequiredSkills([...requiredSkills, name]);
    }
    setSkillInput('');
  }

  async function handlePost() {
    if (!user || !form.title || !form.company) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('jobs').insert({
      ...form,
      employer_id: user.id,
      required_skills: requiredSkills,
    });

    if (error) {
      toast.error('Failed to post job: ' + error.message);
    } else {
      toast.success('Job posted successfully!');
      router.push('/jobs');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Post a Job</h1>
          <p className="text-sm text-muted-foreground">Connect with certified skilled talent</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Job Title *</Label>
              <Input placeholder="e.g. Junior Web Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Company *</Label>
              <Input placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="e.g. Lagos, Nigeria / Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Salary Range</Label>
              <Input placeholder="e.g. $30,000 - $50,000" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Job Type</Label>
            <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['full-time', 'part-time', 'contract', 'internship', 'remote'].map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Job Description *</Label>
            <Textarea
              placeholder="Describe the role, responsibilities, and what the candidate will do..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Requirements</Label>
            <Textarea
              placeholder="List requirements, qualifications, experience needed..."
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
              />
              <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== skill))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div>
              <p className="font-medium text-sm">Requires Certification</p>
              <p className="text-xs text-muted-foreground">Only certified SkillBarter graduates can apply</p>
            </div>
            <Switch
              checked={form.requires_certification}
              onCheckedChange={(v) => setForm({ ...form, requires_certification: v })}
            />
          </div>

          <Button className="w-full h-11" onClick={handlePost} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : 'Post Job'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
