import { StatCard } from "@/components/StatCard";
import { TransactionItem } from "@/components/TransactionItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 2000, expense: 9800 },
  { name: "Apr", income: 2780, expense: 3908 },
  { name: "May", income: 1890, expense: 4800 },
  { name: "Jun", income: 2390, expense: 3800 },
];

const categoryData = [
  { name: "Food", value: 400 },
  { name: "Transport", value: 300 },
  { name: "Entertainment", value: 200 },
  { name: "Bills", value: 278 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const recentTransactions = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: -125.50,
    category: "Food",
    date: "2024-01-15",
    type: "expense" as const,
    description: "Weekly groceries"
  },
  {
    id: "2",
    title: "Salary",
    amount: 3500.00,
    category: "Income",
    date: "2024-01-14",
    type: "income" as const,
  },
  {
    id: "3",
    title: "Gas Station",
    amount: -45.00,
    category: "Transport",
    date: "2024-01-13",
    type: "expense" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value="$12,450.00"
          icon={Wallet}
          trend="+12% from last month"
        />
        <StatCard
          title="Total Income"
          value="$8,240.00"
          icon={TrendingUp}
          trend="+5% from last month"
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value="$4,890.00"
          icon={TrendingDown}
          trend="-2% from last month"
          variant="destructive"
        />
        <StatCard
          title="Savings"
          value="$3,350.00"
          icon={PiggyBank}
          trend="+18% from last month"
          variant="warning"
        />
      </div>

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
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
