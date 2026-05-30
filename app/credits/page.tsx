'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Gift,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import type { SkillCreditTransaction } from '@/lib/types';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const typeConfig = {
  earned: { label: 'Earned', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', arrow: ArrowUpRight },
  spent: { label: 'Spent', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', arrow: ArrowDownRight },
  bonus: { label: 'Bonus', icon: Gift, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', arrow: ArrowUpRight },
  refund: { label: 'Refund', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', arrow: ArrowUpRight },
};

export default function CreditsPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<SkillCreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('skill_credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTransactions(data || []);
        setLoading(false);
      });
  }, [user]);

  const totalEarned = transactions.filter((t) => ['earned', 'bonus', 'refund'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === 'spent').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Build chart data from last 7 transactions
  const chartData = transactions
    .slice(0, 14)
    .reverse()
    .map((t, i) => ({
      name: format(new Date(t.created_at), 'MMM d'),
      balance: t.balance_after,
    }));

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skill Credits</h1>
        <p className="text-sm text-muted-foreground mt-1">Your currency for learning and teaching</p>
      </div>

      {/* Balance card */}
      <Card className="bg-gradient-to-br from-primary to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Current Balance</p>
              <div className="flex items-center gap-2 mt-1">
                <Coins className="h-8 w-8" />
                <span className="text-5xl font-bold">{profile?.skill_credits || 0}</span>
              </div>
              <p className="text-white/70 text-sm mt-2">Skill Credits</p>
            </div>
            <div className="text-right space-y-3">
              <div>
                <p className="text-white/70 text-xs">Total Earned</p>
                <p className="text-xl font-semibold text-green-300">+{totalEarned}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs">Total Spent</p>
                <p className="text-xl font-semibold text-red-300">-{totalSpent}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How credits work */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3 text-sm">How Credits Work</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { text: '1 hour teaching = 1 credit earned', color: 'text-green-600' },
              { text: '1 hour learning = 1 credit spent', color: 'text-red-600' },
              { text: 'New users get 5 bonus credits', color: 'text-blue-600' },
              { text: 'Session cancelled = full refund', color: 'text-amber-600' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 ${item.color}`}>
                <Coins className="h-4 w-4 flex-shrink-0" />
                <span className="text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Balance History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#balanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Transaction history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx, i) => {
                const config = typeConfig[tx.type];
                const Icon = config.icon;
                const Arrow = config.arrow;
                const isPositive = tx.type !== 'spent';
                return (
                  <div key={tx.id}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center gap-3 py-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'PPp')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-0.5 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          <Arrow className="h-3.5 w-3.5" />
                          {isPositive ? '+' : '-'}{Math.abs(tx.amount)}
                        </div>
                        <p className="text-xs text-muted-foreground">bal: {tx.balance_after}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
