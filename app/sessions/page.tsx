'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Coins,
  BookOpen,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Video,
  ExternalLink,
} from 'lucide-react';
import type { Session } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const, color: 'text-yellow-600' },
  approved: { label: 'Approved', variant: 'default' as const, color: 'text-green-600' },
  completed: { label: 'Completed', variant: 'secondary' as const, color: 'text-blue-600' },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'text-red-600' },
  rescheduled: { label: 'Rescheduled', variant: 'outline' as const, color: 'text-orange-600' },
};

export default function SessionsPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadSessions();
  }, [user]);

  async function loadSessions() {
    const { data } = await supabase
      .from('sessions')
      .select('*, skill:skills(*), teacher:profiles!teacher_id(*), learner:profiles!learner_id(*)')
      .or(`teacher_id.eq.${user!.id},learner_id.eq.${user!.id}`)
      .order('scheduled_at', { ascending: false });
    setSessions((data || []) as Session[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update session');
      return;
    }
    toast.success(`Session ${status}`);
    loadSessions();
  }

  const upcoming = sessions.filter((s) => ['pending', 'approved'].includes(s.status));
  const past = sessions.filter((s) => ['completed', 'cancelled'].includes(s.status));
  const teaching = sessions.filter((s) => s.teacher_id === user?.id);
  const learning = sessions.filter((s) => s.learner_id === user?.id);

  function SessionCard({ session }: { session: Session }) {
    const isTeacher = session.teacher_id === user?.id;
    const other = isTeacher ? session.learner : session.teacher;
    const otherInitials = (other as any)?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const sc = statusConfig[session.status];

    return (
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={(other as any)?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">{otherInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-semibold">{session.title || session.skill?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isTeacher ? 'Teaching' : 'Learning from'} {(other as any)?.full_name}
                  </p>
                </div>
                <Badge variant={sc.variant} className="flex-shrink-0 text-xs">{sc.label}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(session.scheduled_at), 'PPP')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(session.scheduled_at), 'p')} · {session.duration_minutes}min
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  {session.credits_cost} credit
                </span>
              </div>

              {session.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{session.notes}</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                {session.status === 'pending' && isTeacher && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => updateStatus(session.id, 'approved')}
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => updateStatus(session.id, 'cancelled')}
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Decline
                    </Button>
                  </>
                )}
                {session.status === 'approved' && (
                  <>
                    {session.meeting_url && (
                      <Button size="sm" className="h-7 text-xs" asChild>
                        <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-1 h-3 w-3" /> Join Meeting
                        </a>
                      </Button>
                    )}
                    {isTeacher && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => updateStatus(session.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </>
                )}
                {session.recording_url && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                    <a href={session.recording_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" /> Recording
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">{sessions.length} total sessions</p>
        </div>
        <Button asChild>
          <Link href="/skills">
            <Plus className="mr-2 h-4 w-4" /> Book Session
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({sessions.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="teaching">Teaching ({teaching.length})</TabsTrigger>
          <TabsTrigger value="learning">Learning ({learning.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        {[
          { value: 'all', data: sessions },
          { value: 'upcoming', data: upcoming },
          { value: 'teaching', data: teaching },
          { value: 'learning', data: learning },
          { value: 'past', data: past },
        ].map(({ value, data }) => (
          <TabsContent key={value} value={value} className="space-y-3 mt-4">
            {data.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No sessions here yet</p>
                <Button asChild>
                  <Link href="/skills"><BookOpen className="mr-2 h-4 w-4" /> Browse Skills</Link>
                </Button>
              </div>
            ) : (
              data.map((session) => <SessionCard key={session.id} session={session} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
