'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Loader2,
  ChefHat,
  Wrench,
  Scissors,
  Bike,
  Leaf,
  Music,
} from 'lucide-react';
import type { Meetup } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const catIcons: Record<string, React.ReactNode> = {
  tailoring: <Scissors className="h-5 w-5" />,
  cooking: <ChefHat className="h-5 w-5" />,
  bike_repair: <Bike className="h-5 w-5" />,
  carpentry: <Wrench className="h-5 w-5" />,
  gardening: <Leaf className="h-5 w-5" />,
  art: <Music className="h-5 w-5" />,
  other: <Users className="h-5 w-5" />,
};

const catColors: Record<string, string> = {
  tailoring: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  cooking: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  bike_repair: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  carpentry: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  gardening: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  art: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  other: 'bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-400',
};

const placeholderMeetups = [
  { title: 'Traditional Tailoring Workshop', category: 'tailoring', location: 'Lagos Community Center', scheduled_at: new Date(Date.now() + 2 * 24 * 3600000).toISOString(), attendees_count: 12, max_attendees: 20 },
  { title: 'West African Cooking Class', category: 'cooking', location: 'Nairobi Kitchen Hub', scheduled_at: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), attendees_count: 8, max_attendees: 15 },
  { title: 'Bicycle Repair Basics', category: 'bike_repair', location: 'Accra Youth Center', scheduled_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), attendees_count: 6, max_attendees: 10 },
  { title: 'Furniture Making Workshop', category: 'carpentry', location: 'Kampala Skills Hub', scheduled_at: new Date(Date.now() + 10 * 24 * 3600000).toISOString(), attendees_count: 4, max_attendees: 8 },
];

export default function MeetupsPage() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [meetupsRes, rsvpsRes] = await Promise.all([
        supabase
          .from('meetups')
          .select('*, organizer:profiles!organizer_id(*)')
          .eq('is_active', true)
          .order('scheduled_at', { ascending: true }),
        user
          ? supabase.from('meetup_rsvps').select('meetup_id').eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);
      setMeetups((meetupsRes.data || []) as Meetup[]);
      setRsvps(new Set((rsvpsRes.data || []).map((r: any) => r.meetup_id)));
      setLoading(false);
    }
    load();
  }, [user]);

  async function toggleRsvp(meetupId: string, currentlyRsvpd: boolean) {
    if (!user) { toast.error('Please sign in to RSVP'); return; }
    if (currentlyRsvpd) {
      await supabase.from('meetup_rsvps').delete().eq('meetup_id', meetupId).eq('user_id', user.id);
      setRsvps((prev) => { const next = new Set(prev); next.delete(meetupId); return next; });
      toast.success('RSVP cancelled');
    } else {
      await supabase.from('meetup_rsvps').insert({ meetup_id: meetupId, user_id: user.id });
      setRsvps((prev) => { const next = new Set(Array.from(prev)); next.add(meetupId); return next; });
      toast.success('RSVP confirmed!');
    }
  }

  const displayMeetups = meetups.length > 0 ? meetups : (placeholderMeetups as any[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Meetups</h1>
          <p className="text-sm text-muted-foreground mt-1">Hands-on learning events in your community</p>
        </div>
        {user && (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Meetup
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayMeetups.map((meetup: any, i: number) => {
            const isRsvpd = rsvps.has(meetup.id);
            const catColor = catColors[meetup.category] || catColors.other;
            const catIcon = catIcons[meetup.category] || catIcons.other;
            const spotsLeft = meetup.max_attendees - meetup.attendees_count;

            return (
              <Card key={meetup.id || i} className="card-hover flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${catColor}`}>
                      {catIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs capitalize mb-1">
                        {meetup.category.replace('_', ' ')}
                      </Badge>
                      <h3 className="font-semibold leading-tight">{meetup.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{meetup.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{format(new Date(meetup.scheduled_at), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{format(new Date(meetup.scheduled_at), 'p')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{meetup.attendees_count}/{meetup.max_attendees} attending · {spotsLeft} spots left</span>
                    </div>
                  </div>

                  <Button
                    variant={isRsvpd ? 'secondary' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => meetup.id && toggleRsvp(meetup.id, isRsvpd)}
                    disabled={!meetup.id || (spotsLeft === 0 && !isRsvpd)}
                  >
                    {isRsvpd ? 'Cancel RSVP' : spotsLeft === 0 ? 'Full' : 'RSVP'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
