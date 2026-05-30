'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Play,
  Zap,
  Users,
  Award,
  Briefcase,
  Coins,
  TrendingUp,
  Shield,
  BookOpen,
  Calendar,
  Star,
  CheckCircle2,
  Target,
  Sparkles,
  Globe,
  Code2,
  Palette,
  Megaphone,
  ChefHat,
  Wrench,
  Music,
  Heart,
  BarChart3,
  Layers,
  Clock,
  Wallet,
  Gift,
  Send,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animated counter hook
function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Stat component
function StatItem({ value, label, suffix = '+', start }: { value: number; label: string; suffix?: string; start: boolean }) {
  const count = useCountUp(value, 2000, start);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// Feature card
function FeatureCard({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: string }) {
  return (
    <Card className="card-hover h-full">
      <CardContent className="p-6">
        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4', color)}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

// How it works step
function StepCard({ number, title, description, icon: Icon }: { number: string; title: string; description: string; icon: any }) {
  return (
    <div className="relative flex flex-col items-center text-center p-6">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
        <Icon className="h-8 w-8 text-primary" />
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {number}
        </div>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Skill category
function SkillCategory({ name, count, icon: Icon, color }: { name: string; count: number; icon: any; color: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all hover:scale-105', color)}>
      <Icon className="h-8 w-8 mb-2" />
      <span className="font-semibold text-sm">{name}</span>
      <span className="text-xs opacity-70">{count} skills</span>
    </div>
  );
}

// Main landing page
export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const categories = [
    { name: 'Programming', count: 45, icon: Code2, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { name: 'Design', count: 32, icon: Palette, color: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400' },
    { name: 'Marketing', count: 28, icon: Megaphone, color: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
    { name: 'Languages', count: 41, icon: Globe, color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
    { name: 'Cooking', count: 18, icon: ChefHat, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
    { name: 'Crafts', count: 26, icon: Wrench, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400' },
    { name: 'Music', count: 22, icon: Music, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
    { name: 'Business', count: 35, icon: Briefcase, color: 'bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400' },
  ];

  const features = [
    { icon: Sparkles, title: 'AI Matchmaking', description: 'Smart algorithm matches you with the perfect teacher or learner based on skills, location, and availability.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { icon: Shield, title: 'Verified Certificates', description: 'Employer-trusted certificates with QR verification codes, issued after passing skill assessments.', color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
    { icon: Coins, title: 'Skill Credit Economy', description: 'Fair, ledger-based credit system. Teach 1 hour, earn 1 credit. Spend credits to learn anything.', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
    { icon: Users, title: 'Community Meetups', description: 'Offline meetup events for hands-on learning. Cooking, crafts, repairs, and more in your community.', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
    { icon: BarChart3, title: 'Progress Tracking', description: 'Track your learning journey with detailed analytics, skill milestones, and achievement badges.', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
    { icon: Wallet, title: 'No Money Needed', description: 'Exchange skills, not money. Our credit system makes quality education accessible to everyone.', color: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400' },
  ];

  const steps = [
    { number: '1', title: 'Create Profile', description: 'Sign up and tell us about your skills and interests', icon: Users },
    { number: '2', title: 'Teach Skills', description: 'Share what you know and earn skill credits', icon: BookOpen },
    { number: '3', title: 'Earn Credits', description: '1 hour teaching = 1 skill credit earned', icon: Coins },
    { number: '4', title: 'Learn New Skills', description: 'Spend credits to learn from expert peers', icon: TrendingUp },
    { number: '5', title: 'Take Assessments', description: 'Prove your knowledge with structured tests', icon: Target },
    { number: '6', title: 'Get Certified', description: 'Earn verified certificates for your skills', icon: Award },
    { number: '7', title: 'Land Jobs', description: 'Connect with employers seeking your talents', icon: Briefcase },
  ];

  const impacts = [
    { label: 'Youth Employed', value: 1200, icon: Briefcase, color: 'text-green-500' },
    { label: 'Skills Taught', value: 15000, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Certifications Issued', value: 3500, icon: Award, color: 'text-amber-500' },
    { label: 'Credits Exchanged', value: 45000, icon: Coins, color: 'text-purple-500' },
    { label: 'Sessions Completed', value: 8500, icon: Calendar, color: 'text-teal-500' },
    { label: 'Hours Learned', value: 25000, icon: Clock, color: 'text-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-bold">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">SkillBarter</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#skills', label: 'Skills' },
                { href: '#impact', label: 'Impact' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/auth/signup">Get Started <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col gap-3">
                {[
                  { href: '#features', label: 'Features' },
                  { href: '#how-it-works', label: 'How It Works' },
                  { href: '#skills', label: 'Skills' },
                  { href: '#impact', label: 'Impact' },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-green-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl section-padding py-20 md:py-28 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-primary/10 text-primary border-0 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered Skill Exchange Platform
            </Badge>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Learn Skills.{' '}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Teach Skills.
              </span>
              <br />
              Earn Opportunities.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              SkillBarter connects passionate learners with skilled teachers through a fair credit economy.
              Teach what you know, earn credits, learn something new, get certified, and land your dream job.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-semibold" asChild>
                <Link href="/auth/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base" asChild>
                <Link href="/skills">
                  <Play className="mr-2 h-5 w-5" /> Explore Skills
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-3">
                {[
                  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
                  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
                  'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
                  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
                  'https://images.pexels.com/photos/1154496/pexels-photo-1154496.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
                ].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-10 w-10 rounded-full border-3 border-background object-cover ring-2 ring-background" />
                ))}
              </div>
              <div className="text-left">
                <span className="font-semibold text-foreground">10,000+</span> active learners
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline"><span className="font-semibold text-foreground">4.9</span> rating</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1400"
                alt="People collaborating and learning together"
                className="w-full aspect-[16/7] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

              {/* Floating cards */}
              <div className="absolute top-6 left-6 glass rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Session Complete!</div>
                    <div className="text-xs text-muted-foreground">+1 Skill Credit Earned</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6 glass rounded-2xl p-4 shadow-xl animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">AI Match Found</div>
                    <div className="text-xs text-muted-foreground">96% Compatibility</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-3 shadow-xl">
                <div className="flex items-center gap-4 text-foreground text-sm font-medium">
                  <span className="flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" /> Certificate Issued</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-green-500" /> Job Applied</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="flex items-center gap-2"><Coins className="h-4 w-4 text-blue-500" /> 5 Credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl section-padding py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatItem value={10000} label="Active Learners" start={statsVisible} />
            <StatItem value={2500} label="Expert Teachers" start={statsVisible} />
            <StatItem value={300} label="Skills Available" start={statsVisible} />
            <StatItem value={1200} label="Jobs Placed" start={statsVisible} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-muted-foreground text-lg">
              SkillBarter is more than a learning platform — it's a complete career acceleration ecosystem.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <FeatureCard key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              From Skills to Jobs in 7 Steps
            </h2>
            <p className="text-muted-foreground text-lg">
              A complete pathway from raw talent to verified professional
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start Your Journey <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Matchmaking Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">AI-Powered Matching</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Smart Matches for Faster Learning
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our AI analyzes your skills, availability, location, and learning preferences to find you the perfect teacher or learner.
                No more endless searching — get matched in seconds.
              </p>

              <div className="space-y-4">
                {[
                  'Skill compatibility scoring',
                  'Location-based matching',
                  'Availability synchronization',
                  'Learning style alignment',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Match Visualization */}
            <div className="relative">
              <Card className="p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Your Top Matches</h3>
                  <Badge className="bg-green-500/10 text-green-600 border-0">Live</Badge>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Amara Diallo', skill: 'Python Programming', score: 96, location: 'Lagos', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                    { name: 'Kwame Asante', skill: 'UI/UX Design', score: 89, location: 'Accra', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                    { name: 'Fatima Al-Hassan', skill: 'Digital Marketing', score: 84, location: 'Abuja', avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                  ].map((match, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <img src={match.avatar} alt={match.name} className="h-12 w-12 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{match.name}</span>
                          <span className={cn('text-sm font-bold', match.score >= 90 ? 'text-green-600' : 'text-primary')}>
                            {match.score}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{match.skill} • {match.location}</p>
                        <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${match.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Floating label */}
              <div className="absolute -top-3 -right-3 glass rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Categories */}
      <section id="skills" className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4">Skill Categories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learn Anything, Teach Everything
            </h2>
            <p className="text-muted-foreground text-lg">
              300+ skills across 8 categories — there's something for everyone.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <SkillCategory key={cat.name} {...cat} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href="/skills">Browse All Skills <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Skill Credit System Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Credit Card Visual */}
            <div className="relative order-2 lg:order-1">
              <Card className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/70">SkillBarter</p>
                        <p className="font-semibold">Skill Credits</p>
                      </div>
                    </div>
                    <Gift className="h-8 w-8 text-white/40" />
                  </div>

                  <div className="mb-8">
                    <p className="text-xs text-white/70 mb-1">Available Balance</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">25</span>
                      <span className="text-xl text-white/70">credits</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-xs text-white/70">Earned</p>
                      <p className="font-semibold text-green-300">+32</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-xs text-white/70">Spent</p>
                      <p className="font-semibold text-red-300">-17</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/60">
                    <span>Member since 2024</span>
                    <span>Verified User</span>
                  </div>
                </CardContent>
              </Card>

              {/* Decorative elements */}
              <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 rounded-2xl bg-primary/20 blur-xl" />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <Badge variant="outline" className="mb-4">Skill Credit System</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Exchange Skills, Not Money
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our fair, ledger-based credit system makes quality education accessible to everyone.
                Teach what you know to earn credits, then spend them to learn what you want.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: TrendingUp, title: 'Earn Credits', desc: '1 hour teaching = 1 credit' },
                  { icon: BookOpen, title: 'Spend Credits', desc: '1 hour learning = 1 credit' },
                  { icon: Gift, title: 'Bonus Credits', desc: '5 free credits on signup' },
                  { icon: Shield, title: 'Fair Exchange', desc: 'Ledger-based accounting' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button size="lg" asChild>
                <Link href="/auth/signup">Get 5 Free Credits <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Dashboard */}
      <section id="impact" className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Real Impact</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Changing Lives, One Skill at a Time
            </h2>
            <p className="text-muted-foreground text-lg">
              Our community is making a real difference in youth employment across Africa.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {impacts.map((impact) => {
              const Icon = impact.icon;
              const count = useCountUp(impact.value, 2000, statsVisible);
              return (
                <Card key={impact.label} className="card-hover">
                  <CardContent className="p-6 text-center">
                    <Icon className={cn('h-8 w-8 mx-auto mb-3', impact.color)} />
                    <div className="text-2xl md:text-3xl font-bold">
                      {statsVisible ? count.toLocaleString() : '0'}+
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{impact.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Testimonial */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <img
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop"
                    alt="Amara Diallo"
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-background"
                  />
                </div>
                <p className="text-lg md:text-xl italic mb-6 leading-relaxed">
                  "SkillBarter helped me land my first developer job. I taught French while learning Python —
                  the credit system is genius. Within 6 months, I went from unemployed to certified and hired!"
                </p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">Amara Diallo</p>
                  <p className="text-sm text-muted-foreground">Software Developer, Lagos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl section-padding">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-blue-600 p-10 md:p-16 text-white text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white blur-3xl" />
            </div>

            <div className="relative">
              <Badge className="bg-white/20 text-white border-0 mb-6">Start Free Today</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Transform Your Skills?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join 10,000+ learners and teachers already using SkillBarter.
                Get 5 free credits when you sign up.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-12 px-8" asChild>
                  <Link href="/auth/signup">Create Free Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/30 text-white hover:bg-white/10" asChild>
                  <Link href="/skills">Browse Skills</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl section-padding py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-bold mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg">SkillBarter</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Empowering youth through peer-to-peer skill exchange and verified certifications.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Platform',
                links: [
                  { label: 'Browse Skills', href: '/skills' },
                  { label: 'Find Teachers', href: '/skills' },
                  { label: 'Job Board', href: '/jobs' },
                  { label: 'Meetups', href: '/meetups' },
                ],
              },
              {
                title: 'Learn',
                links: [
                  { label: 'Video Library', href: '/videos' },
                  { label: 'Assessments', href: '/assessments' },
                  { label: 'Certificates', href: '/certificates' },
                  { label: 'Skill Credits', href: '/credits' },
                ],
              },
              {
                title: 'Community',
                links: [
                  { label: 'Success Stories', href: '/' },
                  { label: 'Blog', href: '/' },
                  { label: 'Events', href: '/meetups' },
                  { label: 'Partners', href: '/' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '/' },
                  { label: 'Careers', href: '/' },
                  { label: 'Contact', href: '/' },
                  { label: 'Privacy', href: '/' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-border">
            <div>
              <h4 className="font-semibold mb-1">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">Get the latest news and updates from SkillBarter.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button className="h-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© 2026 SkillBarter. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/" className="hover:text-foreground transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
