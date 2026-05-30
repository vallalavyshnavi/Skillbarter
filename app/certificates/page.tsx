'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  CheckCircle2,
  Calendar,
  Hash,
  Download,
  ExternalLink,
  Loader2,
  Share2,
} from 'lucide-react';
import type { Certificate } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CertificatesPage() {
  const { user, profile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('certificates')
      .select('*, skill:skills(*)')
      .eq('user_id', user.id)
      .eq('is_valid', true)
      .order('issued_at', { ascending: false })
      .then(({ data }) => {
        setCertificates((data || []) as Certificate[]);
        setLoading(false);
      });
  }, [user]);

  function copyVerificationLink(verificationId: string) {
    const url = `${window.location.origin}/certificate/verify/${verificationId}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied to clipboard');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {certificates.length} verified certificate{certificates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/assessments">Take Assessment</Link>
        </Button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Take skill assessments to earn verified certificates that employers trust.
          </p>
          <Button asChild>
            <Link href="/assessments">Browse Assessments</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden border-amber-200/60 dark:border-amber-800/60">
              {/* Certificate header */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white relative">
                <div className="absolute top-3 right-3 opacity-20">
                  <Award className="h-16 w-16" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-3 opacity-90">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  SKILLBARTER CERTIFIED
                </div>
                <h3 className="text-xl font-bold leading-tight">{cert.skill?.name}</h3>
                <p className="text-white/80 text-sm mt-1 truncate">
                  {profile?.full_name}
                </p>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assessment Score</span>
                  <span className="text-lg font-bold text-green-600">{cert.score}%</span>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Issued: {format(new Date(cert.issued_at), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-mono truncate">{cert.verification_id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => copyVerificationLink(cert.verification_id)}
                  >
                    <Share2 className="mr-1.5 h-3 w-3" /> Share
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" asChild>
                    <Link href={`/certificate/verify/${cert.verification_id}`}>
                      <ExternalLink className="mr-1.5 h-3 w-3" /> Verify
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
