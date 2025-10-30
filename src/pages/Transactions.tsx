import { useState, useEffect } from "react";
import { TransactionItem } from "@/components/TransactionItem";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "You need to be logged in", variant: "destructive" });
        return;
      }

      const [transactionsRes, categoriesRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(*)')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setTransactions(transactionsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transactions (All amounts in ₹ INR)</p>
        </div>
        <AddTransactionDialog categories={categories} onSuccess={fetchData} />
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
        {loading ? (
          <p className="text-center text-muted-foreground">Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground">No transactions found. Add your first transaction!</p>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={{
                ...transaction,
                category: transaction.categories?.name || 'Uncategorized'
              }}
              onEdit={() => console.log('Edit', transaction.id)}
              onDelete={async () => {
                await supabase.from('transactions').delete().eq('id', transaction.id);
                fetchData();
                toast({ title: "Deleted", description: "Transaction deleted successfully" });
              }}
            />
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
        <h3 className="font-semibold mb-2">📱 SMS Auto-Classification (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground">
          To enable automatic SMS reading and classification on your Android device, you'll need to install the native mobile version using Capacitor. 
          This feature will automatically detect transaction SMSs from banks and create transactions for you!
        </p>
      </div>
    </div>
  );
}
