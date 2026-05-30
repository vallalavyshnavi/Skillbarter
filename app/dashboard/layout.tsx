'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Coins,
  Award,
  Briefcase,
  User,
  Users,
  Bell,
  Video,
  ClipboardList,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/skills', label: 'Skills', icon: BookOpen, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/sessions', label: 'Sessions', icon: Calendar, roles: ['learner', 'teacher', 'admin'] },
  { href: '/credits', label: 'My Credits', icon: Coins, roles: ['learner', 'teacher', 'admin'] },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList, roles: ['learner', 'teacher', 'admin'] },
  { href: '/certificates', label: 'Certificates', icon: Award, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/videos', label: 'Video Library', icon: Video, roles: ['learner', 'teacher', 'admin'] },
  { href: '/jobs', label: 'Job Board', icon: Briefcase, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/meetups', label: 'Meetups', icon: Users, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/profile', label: 'Profile', icon: User, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/notifications', label: 'Notifications', icon: Bell, roles: ['learner', 'teacher', 'employer', 'admin'] },
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const visibleItems = navItems.filter(
    (item) => !profile?.role || item.roles.includes(profile.role)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl section-padding py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
            <nav className="flex flex-col gap-1 sticky top-24">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AuthProvider>
  );
}
