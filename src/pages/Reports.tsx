import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, DollarSign, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Sample transactions for demo
const sampleTransactions = [
  { id: "1", title: "Grocery Shopping", amount: -125.50, category: "Food", date: "2024-01-15", type: "expense" },
  { id: "2", title: "Salary", amount: 3500.00, category: "Income", date: "2024-01-14", type: "income" },
  { id: "3", title: "Gas Station", amount: -45.00, category: "Transport", date: "2024-01-13", type: "expense" },
  { id: "4", title: "Netflix", amount: -15.99, category: "Entertainment", date: "2024-01-12", type: "expense" },
  { id: "5", title: "Restaurant", amount: -65.00, category: "Food", date: "2024-01-11", type: "expense" },
  { id: "6", title: "Uber", amount: -23.50, category: "Transport", date: "2024-01-10", type: "expense" },
  { id: "7", title: "Coffee Shop", amount: -12.00, category: "Food", date: "2024-01-09", type: "expense" },
  { id: "8", title: "Freelance", amount: 850.00, category: "Income", date: "2024-01-08", type: "income" },
  { id: "9", title: "Gym Membership", amount: -50.00, category: "Health", date: "2024-01-07", type: "expense" },
  { id: "10", title: "Shopping", amount: -180.00, category: "Shopping", date: "2024-01-06", type: "expense" },
];

export default function Reports() {
  const [insights, setInsights] = useState<string>("");
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeFinances = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-finances', {
        body: { transactions: sampleTransactions }
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
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Error analyzing finances:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Financial Insights & Reports</h1>
        <p className="text-muted-foreground">AI-powered analysis of your spending behavior</p>
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
        <CardContent>
          <Button
            onClick={analyzeFinances}
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto"
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
        </CardContent>
      </Card>

      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <h3 className="text-2xl font-bold text-success">${summary.totalIncome.toFixed(2)}</h3>
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
                  <h3 className="text-2xl font-bold text-destructive">${summary.totalExpenses.toFixed(2)}</h3>
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
                          ${amount.toFixed(2)} ({percentage}%)
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
    </div>
  );
}
