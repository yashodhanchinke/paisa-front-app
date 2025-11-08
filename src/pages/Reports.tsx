import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, DollarSign, Target, Loader2, History, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatINR } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Reports() {
  const [insights, setInsights] = useState<string>("");
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const analyzeFinances = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch user's actual transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transError) throw transError;

      if (!transactions || transactions.length === 0) {
        toast.error("No transactions found. Add some transactions first!");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-finances', {
        body: { transactions }
      });

      if (error) {
        console.error('Error invoking function:', error);
        toast.error(error.message || 'Failed to generate insights');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInsights(data.insights);
      setSummary(data.summary);

      // Save to history
      await supabase.from('ai_insights').insert({
        user_id: user.id,
        insights: data.insights,
        summary: data.summary
      });

      fetchHistory();
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Error analyzing finances:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  // Email functionality - requires Resend API setup

  const loadHistoryItem = (item: any) => {
    setInsights(item.insights);
    setSummary(item.summary);
    toast.success('Previous insights loaded!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Financial Insights & Reports</h1>
        <p className="text-muted-foreground">AI-powered analysis of your spending behavior (₹ INR)</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Financial Analysis
          </CardTitle>
          <CardDescription>
            Get personalized savings suggestions based on your transaction patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={analyzeFinances}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <h3 className="text-2xl font-bold text-success">{formatINR(summary.totalIncome)}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <h3 className="text-2xl font-bold text-destructive">{formatINR(summary.totalExpenses)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Savings Rate</p>
                  <h3 className="text-2xl font-bold text-primary">{summary.savingsRate}%</h3>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Financial Report</CardTitle>
            <CardDescription>AI-generated insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-foreground">{insights}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {summary?.categoryBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>Where your money is going</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summary.categoryBreakdown)
                .sort((a: any, b: any) => b[1] - a[1])
                .map(([category, amount]: [string, any]) => {
                  const percentage = ((amount / summary.totalExpenses) * 100).toFixed(1);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">
                          {formatINR(amount)} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingHistory && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Insights History
            </CardTitle>
            <CardDescription>View your previous AI-generated insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item, index) => (
                <AccordionItem key={item.id} value={`item-${index}`}>
                  <AccordionTrigger>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="whitespace-pre-wrap text-sm">{item.insights.substring(0, 200)}...</div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => loadHistoryItem(item)}
                      >
                        Load Full Report
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}