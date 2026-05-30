'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import type { Assessment, AssessmentQuestion } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

type Stage = 'loading' | 'intro' | 'in_progress' | 'submitted' | 'result';

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('loading');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [certId, setCertId] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const [aRes, qRes] = await Promise.all([
        supabase.from('assessments').select('*, skill:skills(*)').eq('id', id).maybeSingle(),
        supabase.from('assessment_questions').select('*').eq('assessment_id', id),
      ]);
      if (aRes.data) {
        setAssessment(aRes.data as Assessment);
        setTimeLeft((aRes.data as Assessment).time_limit_minutes * 60);
      }
      setQuestions(qRes.data || []);
      setStage('intro');
    }
    load();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [id]);

  function startAssessment() {
    setStage('in_progress');
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          submitAssessment();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  async function submitAssessment() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage('submitted');

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const finalScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const hasPassed = finalScore >= (assessment?.pass_score || 70);

    setScore(finalScore);
    setPassed(hasPassed);

    if (!user) return;

    const { data: attemptData } = await (supabase as any)
      .from('assessment_attempts')
      .insert({
        user_id: user.id,
        assessment_id: id as string,
        score: finalScore,
        passed: hasPassed,
        answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (hasPassed) {
      const { data: certData } = await (supabase as any)
        .from('certificates')
        .insert({
          user_id: user.id,
          skill_id: (assessment as any).skill?.id,
          assessment_attempt_id: attemptData?.id,
          score: finalScore,
        })
        .select()
        .single();

      if (certData) setCertId(certData.verification_id);

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Certificate Earned!',
        message: `You passed the ${assessment?.title} assessment with ${finalScore}% and earned a certificate.`,
        type: 'certificate',
      });
    }

    setStage('result');
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0;

  if (stage === 'loading') {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (stage === 'intro' && assessment) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assessments"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
            <p className="text-muted-foreground mb-6">{assessment.description}</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Questions', value: assessment.question_count },
                { label: 'Time Limit', value: `${assessment.time_limit_minutes} min` },
                { label: 'Pass Score', value: `${assessment.pass_score}%` },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-muted/50">
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <Alert className="text-left mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Once started, the timer cannot be paused. Make sure you have {assessment.time_limit_minutes} minutes available.
              </AlertDescription>
            </Alert>
            <Button className="w-full h-11" onClick={startAssessment} disabled={questions.length === 0}>
              {questions.length === 0 ? 'Questions Loading...' : 'Start Assessment'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'in_progress' && questions.length > 0) {
    const q = questions[currentQ];
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
          <div className={`flex items-center gap-2 text-sm font-semibold ${timeLeft < 60 ? 'text-destructive' : 'text-foreground'}`}>
            <Clock className="h-4 w-4" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <Progress value={progress} className="h-2" />

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-5">{q.question}</h2>
            <RadioGroup
              value={answers[q.id] || ''}
              onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}
              className="space-y-3"
            >
              {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                const text = q[`option_${opt}` as keyof AssessmentQuestion] as string;
                return (
                  <div
                    key={opt}
                    className={`flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                      answers[q.id] === opt ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  >
                    <RadioGroupItem value={opt} id={`opt-${opt}`} />
                    <Label htmlFor={`opt-${opt}`} className="cursor-pointer flex-1">{text}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button className="flex-1" onClick={() => setCurrentQ(currentQ + 1)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={submitAssessment}>
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'submitted') {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Evaluating your answers...</p>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5 ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {passed
                ? <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                : <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              }
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Not quite there yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {passed
                ? `You passed with ${score}%! Your certificate has been issued.`
                : `You scored ${score}%. The passing score is ${assessment?.pass_score}%. Keep learning and try again!`
              }
            </p>

            <div className="mb-6">
              <div className="text-4xl font-bold mb-1" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
                {score}%
              </div>
              <Progress value={score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">Pass score: {assessment?.pass_score}%</p>
            </div>

            {passed && certId && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-6">
                <Award className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Certificate Issued!</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {certId}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/assessments">All Assessments</Link>
              </Button>
              {passed ? (
                <Button className="flex-1" asChild>
                  <Link href="/certificates">View Certificate</Link>
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => { setAnswers({}); setCurrentQ(0); startAssessment(); }}>
                  Retake
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
