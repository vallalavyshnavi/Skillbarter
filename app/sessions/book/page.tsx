'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Coins, ArrowLeft, Loader2 } from 'lucide-react';
import type { Skill, Profile } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BookSessionPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const skillId = searchParams.get('skill');
  const teacherId = searchParams.get('teacher');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [selectedSkill, setSelectedSkill] = useState(skillId || '');
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('skills').select('*').eq('is_active', true),
      supabase.from('profiles').select('*').eq('role', 'teacher'),
    ]).then(([s, t]) => {
      setSkills(s.data || []);
      setTeachers(t.data || []);
      setFetching(false);
    });
  }, []);

  async function handleBook() {
    if (!user || !selectedSkill || !selectedTeacher || !scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }
    if ((profile?.skill_credits || 0) < 1) {
      toast.error('Insufficient credits. Teach a session first to earn credits.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('sessions').insert({
      teacher_id: selectedTeacher,
      learner_id: user.id,
      skill_id: selectedSkill,
      title: title || skills.find((s) => s.id === selectedSkill)?.name || 'Learning Session',
      description,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: parseInt(duration),
      credits_cost: Math.ceil(parseInt(duration) / 60),
    });

    if (error) {
      toast.error('Failed to book session: ' + error.message);
    } else {
      await supabase.from('notifications').insert({
        user_id: selectedTeacher,
        title: 'New Session Request',
        message: `${profile?.full_name} wants to book a session with you.`,
        type: 'session',
      });
      toast.success('Session booked! Waiting for teacher approval.');
      router.push('/sessions');
    }
    setLoading(false);
  }

  if (fetching) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sessions"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Book a Session</h1>
          <p className="text-sm text-muted-foreground">Schedule a learning session with a teacher</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Session Details</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              {profile?.skill_credits || 0} credits available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Skill *</Label>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill to learn" />
              </SelectTrigger>
              <SelectContent>
                {skills.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Teacher *</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Session Title</Label>
            <Input
              placeholder="e.g. Introduction to React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date & Time *</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Cost: {Math.ceil(parseInt(duration) / 60)} credit(s)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Notes for Teacher</Label>
            <Textarea
              placeholder="What do you want to learn? Any specific topics or questions?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button className="w-full h-11" onClick={handleBook} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</>
            ) : (
              <><Calendar className="mr-2 h-4 w-4" /> Book Session</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
