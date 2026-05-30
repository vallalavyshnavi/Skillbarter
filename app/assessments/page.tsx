'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Target,
  Trophy,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { Assessment, AssessmentAttempt } from '@/lib/types';

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('assessments').select('*, skill:skills(*)').eq('is_active', true),
      supabase
        .from('assessment_attempts')
        .select('*, assessment:assessments(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]).then(([a, att]) => {
      setAssessments((a.data || []) as Assessment[]);
      setAttempts((att.data || []) as AssessmentAttempt[]);
      setLoading(false);
    });
  }, [user]);

  function getAttemptForAssessment(assessmentId: string) {
    return attempts.find((a) => a.assessment_id === assessmentId);
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
      <div>
        <h1 className="text-2xl font-bold">Skill Assessments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prove your skills and earn verified certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available', value: assessments.length, icon: ClipboardList, color: 'text-blue-500' },
          { label: 'Attempted', value: attempts.length, icon: Target, color: 'text-orange-500' },
          { label: 'Passed', value: attempts.filter((a) => a.passed).length, icon: Trophy, color: 'text-green-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No assessments available yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => {
            const attempt = getAttemptForAssessment(assessment.id);
            const hasPassed = attempt?.passed;
            const hasAttempted = !!attempt;

            return (
              <Card key={assessment.id} className="card-hover flex flex-col">
                <CardContent className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    {hasPassed ? (
                      <Badge className="bg-green-500/10 text-green-600 border-0">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Passed
                      </Badge>
                    ) : hasAttempted ? (
                      <Badge variant="outline" className="text-red-500 border-red-200">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Failed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Started</Badge>
                    )}
                  </div>

                  <h3 className="font-semibold mb-1">{assessment.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {(assessment as any).skill?.name}
                  </p>

                  {assessment.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {assessment.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {assessment.time_limit_minutes} mins
                      </span>
                      <span>{assessment.question_count} questions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pass score: {assessment.pass_score}%</span>
                      {attempt && (
                        <span className="font-medium">
                          My score: {attempt.score}%
                        </span>
                      )}
                    </div>
                    {attempt && (
                      <Progress value={attempt.score} className="h-1.5" />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="px-5 pb-5 pt-0">
                  <Button
                    size="sm"
                    variant={hasPassed ? 'secondary' : 'default'}
                    className="w-full"
                    asChild
                  >
                    <Link href={`/assessments/${assessment.id}`}>
                      {hasPassed ? 'View Certificate' : hasAttempted ? 'Retake' : 'Start Assessment'}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
