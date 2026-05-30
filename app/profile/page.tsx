'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Star, Award, Calendar, Coins, CheckCircle2, Loader2, Save, Plus, X } from 'lucide-react';
import type { Skill, UserSkill } from '@/lib/types';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    availability: 'flexible',
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      availability: profile.availability || 'flexible',
    });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('skills').select('*').eq('is_active', true).order('name'),
      supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', user.id),
    ]).then(([s, us]) => {
      setAllSkills(s.data || []);
      setUserSkills((us.data || []) as UserSkill[]);
    });
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const completion = calculateCompletion();
    const { error } = await supabase
      .from('profiles')
      .update({ ...form, profile_completion: completion, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) {
      toast.error('Failed to save profile');
    } else {
      await refreshProfile();
      toast.success('Profile saved successfully');
    }
    setSaving(false);
  }

  async function addSkill(skillId: string, type: 'known' | 'wanted') {
    if (!user) return;
    const { error } = await supabase.from('user_skills').insert({
      user_id: user.id,
      skill_id: skillId,
      type,
    });
    if (!error) {
      const { data } = await supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', user.id);
      setUserSkills((data || []) as UserSkill[]);
    }
  }

  async function removeSkill(id: string) {
    await supabase.from('user_skills').delete().eq('id', id);
    setUserSkills(userSkills.filter((s) => s.id !== id));
  }

  function calculateCompletion() {
    let score = 20;
    if (form.full_name) score += 20;
    if (form.bio) score += 20;
    if (form.location) score += 20;
    if (userSkills.filter((s) => s.type === 'known').length > 0) score += 10;
    if (userSkills.filter((s) => s.type === 'wanted').length > 0) score += 10;
    return Math.min(score, 100);
  }

  const knownSkills = userSkills.filter((s) => s.type === 'known');
  const wantedSkills = userSkills.filter((s) => s.type === 'wanted');
  const usedSkillIds = new Set(userSkills.map((s) => s.skill_id));
  const availableSkills = allSkills.filter((s) => !usedSkillIds.has(s.id));

  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (!profile) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </Button>
      </div>

      {/* Profile completion */}
      <Card className="border-primary/20 bg-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-semibold text-primary">{calculateCompletion()}%</span>
          </div>
          <Progress value={calculateCompletion()} className="h-2" />
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Basic Info</TabsTrigger>
          <TabsTrigger value="skills">Skills ({userSkills.length})</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{profile.full_name}</p>
                  <Badge variant="outline" className="capitalize mt-1">{profile.role}</Badge>
                  {profile.is_verified && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. Lagos, Nigeria"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea
                  placeholder="Tell others about yourself, your experience, and what you love to teach or learn..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Availability</Label>
                <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="evenings">Evenings</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4 space-y-4">
          {/* Skills I Know */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Skills I Can Teach ({knownSkills.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {knownSkills.map((us) => (
                  <Badge key={us.id} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                    <span>{(us.skill as any)?.name}</span>
                    <button onClick={() => removeSkill(us.id)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(v) => addSkill(v, 'known')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="+ Add a skill you know" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Skills I Want */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Skills I Want to Learn ({wantedSkills.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {wantedSkills.map((us) => (
                  <Badge key={us.id} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 border-primary/30 text-primary">
                    <span>{(us.skill as any)?.name}</span>
                    <button onClick={() => removeSkill(us.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(v) => addSkill(v, 'wanted')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="+ Add a skill you want to learn" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Skill Credits', value: profile.skill_credits, icon: Coins, color: 'text-amber-500' },
              { label: 'Rating', value: profile.rating_avg?.toFixed(1) || '0.0', icon: Star, color: 'text-orange-500' },
              { label: 'Reviews', value: profile.rating_count || 0, icon: User, color: 'text-blue-500' },
              { label: 'Completion', value: `${profile.profile_completion}%`, icon: CheckCircle2, color: 'text-green-500' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-5 text-center">
                    <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
