'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Award, CheckCircle2, Calendar, Hash, User, Loader2, XCircle } from 'lucide-react';
import type { Certificate } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyCertificatePage() {
  const { id } = useParams();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from('certificates')
      .select('*, skill:skills(*), profile:profiles(*)')
      .eq('verification_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCert(data as Certificate);
        else setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Certificate Not Found</h2>
        <p className="text-muted-foreground mb-6">
          No certificate with this verification ID exists or it may have been revoked.
        </p>
        <Button asChild><Link href="/">Return Home</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Certificate Verification</h1>
        <p className="text-muted-foreground mt-1">Powered by SkillBarter</p>
      </div>

      <Card className="overflow-hidden border-2 border-green-200 dark:border-green-800">
        {/* Valid banner */}
        <div className="bg-green-500 text-white px-5 py-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Verified & Authentic Certificate</span>
        </div>

        {/* Cert header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-white text-center">
          <Award className="h-16 w-16 mx-auto mb-3 opacity-90" />
          <div className="text-xs font-bold tracking-widest opacity-80 mb-2">SKILLBARTER CERTIFICATE</div>
          <h2 className="text-3xl font-bold mb-1">{(cert as any)?.skill?.name}</h2>
          <p className="text-white/80">Competency Certification</p>
        </div>

        <CardContent className="p-6 space-y-5">
          <div>
            <p className="text-sm text-muted-foreground text-center">This certifies that</p>
            <p className="text-xl font-bold text-center mt-1">{(cert as any)?.profile?.full_name}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Score</p>
              <p className="font-bold text-green-600 text-lg">{cert?.score}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pass Threshold</p>
              <p className="font-semibold">70%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Issued On</p>
              <p className="font-semibold">
                {cert?.issued_at ? format(new Date(cert.issued_at), 'PPP') : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge className="bg-green-500/10 text-green-600 border-0">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Valid
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="bg-muted/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Verification ID</p>
            <p className="font-mono text-sm font-medium break-all">{cert?.verification_id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
