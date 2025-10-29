import { useState } from "react";
import { TransactionItem } from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Plus } from "lucide-react";

const transactions = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: -125.50,
    category: "Food",
    date: "2024-01-15",
    type: "expense" as const,
    description: "Weekly groceries at Whole Foods"
  },
  {
    id: "2",
    title: "Salary",
    amount: 3500.00,
    category: "Income",
    date: "2024-01-14",
    type: "income" as const,
    description: "Monthly salary deposit"
  },
  {
    id: "3",
    title: "Gas Station",
    amount: -45.00,
    category: "Transport",
    date: "2024-01-13",
    type: "expense" as const,
  },
  {
    id: "4",
    title: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    date: "2024-01-12",
    type: "expense" as const,
  },
  {
    id: "5",
    title: "Freelance Project",
    amount: 850.00,
    category: "Income",
    date: "2024-01-11",
    type: "income" as const,
    description: "Web design project payment"
  },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transactions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
