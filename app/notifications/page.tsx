'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  CheckCheck,
  Loader2,
  Calendar,
  Coins,
  Award,
  Briefcase,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  session: <Calendar className="h-4 w-4 text-blue-500" />,
  credit: <Coins className="h-4 w-4 text-amber-500" />,
  certificate: <Award className="h-4 w-4 text-amber-600" />,
  job: <Briefcase className="h-4 w-4 text-green-600" />,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setNotifications(data || []);
    setLoading(false);
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {notifications.map((notif, i) => (
              <div key={notif.id}>
                {i > 0 && <Separator />}
                <div
                  className={cn(
                    'flex gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors',
                    !notif.is_read && 'bg-accent/20'
                  )}
                  onClick={() => !notif.is_read && markRead(notif.id)}
                >
                  <div className="flex-shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                    {typeIcons[notif.type] || typeIcons.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', !notif.is_read && 'font-semibold')}>{notif.title}</p>
                      {!notif.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
