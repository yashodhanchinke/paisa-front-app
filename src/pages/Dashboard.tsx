import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { TransactionItem } from "@/components/TransactionItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;

      setTransactions(transactionsData || []);

      // Calculate stats
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (allTransactions) {
        const income = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        
        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          totalBalance: income - expenses,
          savings: income - expenses
        });

        // Calculate monthly data (last 6 months)
        const monthsData: any = {};
        allTransactions.forEach(t => {
          const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
          if (!monthsData[month]) {
            monthsData[month] = { name: month, income: 0, expense: 0 };
          }
          if (t.type === 'income') {
            monthsData[month].income += Number(t.amount);
          } else {
            monthsData[month].expense += Number(t.amount);
          }
        });
        setMonthlyData(Object.values(monthsData).slice(-6));

        // Calculate category breakdown
        const categoryBreakdown: any = {};
        allTransactions.filter(t => t.type === 'expense').forEach(t => {
          const category = t.category_id || 'Uncategorized';
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Number(t.amount);
        });

        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);

        const categoryDataArray = Object.entries(categoryBreakdown).map(([catId, value]: [string, any]) => {
          const cat = categories?.find(c => c.id === catId);
          return {
            name: cat?.name || 'Uncategorized',
            value: value
          };
        }).sort((a, b) => b.value - a.value).slice(0, 4);

        setCategoryData(categoryDataArray);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview (All amounts in ₹ INR)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatINR(stats.totalBalance)}
          icon={Wallet}
          trend="Current balance"
        />
        <StatCard
          title="Total Income"
          value={formatINR(stats.totalIncome)}
          icon={TrendingUp}
          trend="All time income"
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={formatINR(stats.totalExpenses)}
          icon={TrendingDown}
          trend="All time expenses"
          variant="destructive"
        />
        <StatCard
          title="Savings"
          value={formatINR(stats.savings)}
          icon={PiggyBank}
          trend="Total savings"
          variant="warning"
        />
      </div>

      {monthlyData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatINR(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatINR(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet. Start by adding your first transaction!</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={{
                    ...transaction,
                    category: transaction.categories?.name || 'Uncategorized'
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}