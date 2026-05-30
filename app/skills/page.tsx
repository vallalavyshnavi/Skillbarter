'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Star,
  Coins,
  MapPin,
  Code2,
  Palette,
  Megaphone,
  Globe,
  ChefHat,
  Wrench,
  Briefcase,
  Music,
  Loader2,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { Skill, Profile, UserSkill } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Teacher {
  profile: Profile;
  skills: string[];
  matchScore: number;
}

const categories = [
  { value: 'all', label: 'All Categories', icon: Sparkles },
  { value: 'programming', label: 'Programming', icon: Code2 },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'marketing', label: 'Marketing', icon: Megaphone },
  { value: 'languages', label: 'Languages', icon: Globe },
  { value: 'cooking', label: 'Cooking', icon: ChefHat },
  { value: 'crafts', label: 'Crafts', icon: Wrench },
  { value: 'business', label: 'Business', icon: Briefcase },
  { value: 'music', label: 'Music', icon: Music },
];

const catColors: Record<string, string> = {
  programming: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  design: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  marketing: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  languages: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  cooking: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
  crafts: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
  business: 'bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400',
  music: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  other: 'bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-400',
};

export default function SkillsPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const initCat = searchParams.get('category') || 'all';

  const [skills, setSkills] = useState<Skill[]>([]);
  const [teachers, setTeachers] = useState<{ profile: Profile; skillNames: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initCat);
  const [view, setView] = useState<'skills' | 'teachers'>('skills');

  useEffect(() => {
    async function load() {
      const [skillsRes, teachersRes] = await Promise.all([
        supabase.from('skills').select('*').eq('is_active', true).order('name'),
        supabase
          .from('profiles')
          .select('*, user_skills(*, skill:skills(*))')
          .eq('role', 'teacher')
          .limit(20),
      ]);

      setSkills(skillsRes.data || []);

      const teacherData = (teachersRes.data || []).map((t: any) => ({
        profile: t,
        skillNames: (t.user_skills || [])
          .filter((us: any) => us.type === 'known')
          .map((us: any) => us.skill?.name)
          .filter(Boolean),
      }));
      setTeachers(teacherData);
      setLoading(false);
    }
    load();
  }, []);

  const filteredSkills = skills.filter((s) => {
    const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'all' || s.category === category;
    return matchesQuery && matchesCat;
  });

  const filteredTeachers = teachers.filter((t) => {
    const matchesQuery = !query ||
      t.profile.full_name.toLowerCase().includes(query.toLowerCase()) ||
      t.skillNames.some((s) => s.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Skills Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {skills.length} skills · {teachers.length} expert teachers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'skills' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('skills')}
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Skills
          </Button>
          <Button
            variant={view === 'teachers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('teachers')}
          >
            <Users className="mr-1.5 h-3.5 w-3.5" /> Teachers
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={view === 'skills' ? 'Search skills...' : 'Search teachers or skills...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {view === 'skills' && (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Category pills */}
      {view === 'skills' && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                  category === cat.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : view === 'skills' ? (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
          </p>
          {filteredSkills.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No skills found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => {
                const catColor = catColors[skill.category] || catColors.other;
                const teacherCount = teachers.filter((t) =>
                  t.skillNames.includes(skill.name)
                ).length;
                return (
                  <Card key={skill.id} className="card-hover group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold', catColor)}>
                          {skill.name.charAt(0)}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {skill.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1.5">{skill.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{skill.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {teacherCount} teacher{teacherCount !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          1 credit/hr
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="px-5 pb-5 pt-0">
                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/sessions/book?skill=${skill.id}`}>
                          Book a Session
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''}
          </p>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No teachers found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map(({ profile: teacher, skillNames }) => {
                const initials = teacher.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                const matchScore = Math.floor(70 + Math.random() * 26);
                return (
                  <Card key={teacher.id} className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={teacher.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">{teacher.full_name}</h3>
                            <Badge className="bg-green-500/10 text-green-600 border-0 text-xs ml-1">
                              {matchScore}% match
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-muted-foreground">
                              {teacher.rating_avg?.toFixed(1) || '5.0'} ({teacher.rating_count || 0})
                            </span>
                          </div>
                          {teacher.location && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{teacher.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {teacher.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{teacher.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-4">
                        {skillNames.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {skillNames.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{skillNames.length - 3}</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          1 credit/hr
                        </span>
                        <span className="capitalize">{teacher.availability}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="px-5 pb-5 pt-0">
                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/sessions/book?teacher=${teacher.id}`}>
                          Book Session
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
