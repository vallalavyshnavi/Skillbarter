'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Briefcase,
  Award,
  Coins,
  Calendar,
  TrendingUp,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import type { Profile, Job, Certificate } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AuthProvider } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'];

function AdminContent() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalCertificates: 0,
    totalJobs: 0,
    totalApplications: 0,
    creditsExchanged: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('count', { count: 'exact', head: true }),
      supabase.from('sessions').select('count', { count: 'exact', head: true }),
      supabase.from('certificates').select('count', { count: 'exact', head: true }),
      supabase.from('jobs').select('count', { count: 'exact', head: true }),
      supabase.from('job_applications').select('count', { count: 'exact', head: true }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('jobs').select('*, employer:profiles!employer_id(*)').order('created_at', { ascending: false }).limit(10),
    ]).then(([pu, ps, pc, pj, pa, usersRes, jobsRes]) => {
      setStats({
        totalUsers: pu.count || 0,
        totalSessions: ps.count || 0,
        totalCertificates: pc.count || 0,
        totalJobs: pj.count || 0,
        totalApplications: pa.count || 0,
        creditsExchanged: (ps.count || 0) * 1,
      });
      setUsers(usersRes.data || []);
      setJobs((jobsRes.data || []) as Job[]);
      setLoading(false);
    });
  }, [user]);

  const roleData = [
    { name: 'Learners', value: Math.round(stats.totalUsers * 0.55) },
    { name: 'Teachers', value: Math.round(stats.totalUsers * 0.3) },
    { name: 'Employers', value: Math.round(stats.totalUsers * 0.12) },
    { name: 'Admins', value: Math.round(stats.totalUsers * 0.03) },
  ];

  const activityData = [
    { month: 'Jan', sessions: 12, certifications: 5, jobs: 8 },
    { month: 'Feb', sessions: 19, certifications: 8, jobs: 12 },
    { month: 'Mar', sessions: 26, certifications: 14, jobs: 15 },
    { month: 'Apr', sessions: 33, certifications: 18, jobs: 20 },
    { month: 'May', sessions: 45, certifications: 22, jobs: 28 },
    { month: 'Jun', sessions: 38, certifications: 19, jobs: 24 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform analytics and management</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Sessions Conducted', value: stats.totalSessions, icon: Calendar, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Certificates Issued', value: stats.totalCertificates, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Jobs Posted', value: stats.totalJobs, icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          { label: 'Applications', value: stats.totalApplications, icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
          { label: 'Credits Exchanged', value: stats.creditsExchanged, icon: Coins, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Platform Activity (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="sessions" name="Sessions" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="certifications" name="Certs" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="jobs" name="Jobs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roleData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Users & Jobs tables */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Recent Users ({users.length})</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs ({jobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Credits</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Verified</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const initials = u.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
                      return (
                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatar_url} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.full_name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                          </td>
                          <td className="p-4 font-medium">{u.skill_credits}</td>
                          <td className="p-4">
                            {u.is_verified
                              ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                              : <XCircle className="h-4 w-4 text-muted-foreground/40" />
                            }
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Job</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Applications</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.company}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize text-xs">{job.job_type}</Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">{job.location || 'Remote'}</td>
                        <td className="p-4 font-medium">{job.applications_count}</td>
                        <td className="p-4">
                          {job.is_active
                            ? <Badge className="bg-green-500/10 text-green-600 border-0 text-xs">Active</Badge>
                            : <Badge variant="secondary" className="text-xs">Closed</Badge>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl section-padding py-8">
          <AdminContent />
        </div>
      </div>
    </AuthProvider>
  );
}
