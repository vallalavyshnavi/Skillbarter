'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Coins,
  Calendar,
  Award,
  Briefcase,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Star,
  CheckCircle2,
  Clock,
  Bell,
  Loader2,
  Zap,
} from 'lucide-react';
import type { Session, Certificate, Job, Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const creditData = [
  { day: 'Mon', credits: 2 },
  { day: 'Tue', credits: 1 },
  { day: 'Wed', credits: 3 },
  { day: 'Thu', credits: 1 },
  { day: 'Fri', credits: 2 },
  { day: 'Sat', credits: 4 },
  { day: 'Sun', credits: 1 },
];

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from('sessions')
        .select('*, skill:skills(*), teacher:profiles!teacher_id(*), learner:profiles!learner_id(*)')
        .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true })
        .limit(3),
      supabase
        .from('certificates')
        .select('*, skill:skills(*)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
        .limit(3),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3),
    ]).then(([s, c, n, j]) => {
      setSessions((s.data || []) as Session[]);
      setCertificates((c.data || []) as Certificate[]);
      setNotifications(n.data || []);
      setRecentJobs(j.data || []);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Good morning, {profile?.full_name?.split(' ')[0]}!</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {profile?.role} · {profile?.location || 'Location not set'}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/skills">
            <BookOpen className="mr-2 h-4 w-4" /> Find a Skill
          </Link>
        </Button>
      </div>

      {/* Profile completion */}
      {(profile?.profile_completion || 0) < 100 && (
        <Card className="border-primary/20 bg-accent/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Complete your profile</span>
                <span className="text-sm font-semibold text-primary">{profile?.profile_completion || 0}%</span>
              </div>
              <Progress value={profile?.profile_completion || 0} className="h-2" />
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/profile">Complete <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Skill Credits',
            value: profile?.skill_credits || 0,
            icon: Coins,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            link: '/credits',
          },
          {
            title: 'Sessions',
            value: sessions.length,
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            link: '/sessions',
          },
          {
            title: 'Certificates',
            value: certificates.length,
            icon: Award,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-950/30',
            link: '/certificates',
          },
          {
            title: 'Rating',
            value: profile?.rating_avg?.toFixed(1) || '0.0',
            icon: Star,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-950/30',
            suffix: profile?.rating_count ? ` (${profile.rating_count})` : '',
            link: '/profile',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.link}>
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{stat.title}</span>
                    <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {stat.value}
                    {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Credit Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Credit Activity (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={creditData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="credits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#creditGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 items-start">
                    <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs" asChild>
              <Link href="/notifications">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sessions + Jobs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Sessions
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link href="/sessions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No sessions scheduled yet</p>
                <Button size="sm" asChild>
                  <Link href="/skills">Book a Session</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title || session.skill?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.scheduled_at).toLocaleDateString()} ·{' '}
                        {session.duration_minutes}min
                      </p>
                    </div>
                    <Badge
                      variant={
                        session.status === 'approved' ? 'default' :
                        session.status === 'completed' ? 'secondary' : 'outline'
                      }
                      className="text-xs capitalize"
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Jobs */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Latest Jobs
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link href="/jobs">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No jobs posted yet</p>
                {profile?.role === 'employer' && (
                  <Button size="sm" asChild>
                    <Link href="/jobs/post">Post a Job</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{job.company} · {job.location}</p>
                      </div>
                      {job.requires_certification && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              My Certificates
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link href="/certificates">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-4 rounded-xl border border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">CERTIFIED</span>
                  </div>
                  <p className="font-semibold text-sm">{cert.skill?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Score: {cert.score}%</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Browse Skills', href: '/skills', icon: BookOpen, color: 'text-blue-500' },
          { label: 'Book Session', href: '/skills', icon: Calendar, color: 'text-green-500' },
          { label: 'Take Assessment', href: '/assessments', icon: Zap, color: 'text-amber-500' },
          { label: 'View Jobs', href: '/jobs', icon: Briefcase, color: 'text-purple-500' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="card-hover cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-xs font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
