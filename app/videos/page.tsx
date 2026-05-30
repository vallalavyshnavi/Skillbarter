'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Eye, Clock, Loader2, Video } from 'lucide-react';
import type { Video as VideoType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function VideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('videos')
      .select('*, skill:skills(*), uploader:profiles!uploader_id(*)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVideos((data || []) as VideoType[]);
        setLoading(false);
      });
  }, []);

  const filtered = videos.filter(
    (v) =>
      !query ||
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      (v.description || '').toLowerCase().includes(query.toLowerCase())
  );

  const placeholder = [
    { title: 'Introduction to Python Programming', category: 'Programming', views: 1240, duration: '45 min', thumb: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'React Hooks Deep Dive', category: 'Programming', views: 890, duration: '62 min', thumb: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'UI/UX Design Fundamentals', category: 'Design', views: 650, duration: '38 min', thumb: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Digital Marketing Strategy', category: 'Marketing', views: 420, duration: '51 min', thumb: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Spanish for Beginners', category: 'Languages', views: 780, duration: '30 min', thumb: 'https://images.pexels.com/photos/159760/school-book-classroom-library-159760.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Financial Literacy Basics', category: 'Business', views: 560, duration: '42 min', thumb: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video Learning Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Watch recorded sessions from expert teachers</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search videos..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {videos.length === 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {placeholder.map((v, i) => (
                <Card key={i} className="card-hover overflow-hidden cursor-pointer group">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary ml-0.5" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0 text-xs">{v.duration}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-xs mb-2">{v.category}</Badge>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{v.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {v.views.toLocaleString()} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {videos.length > 0 && filtered.map((v) => (
            <Card key={v.id} className="card-hover overflow-hidden cursor-pointer group">
              <CardContent className="p-4">
                <h3 className="font-semibold">{v.title}</h3>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
