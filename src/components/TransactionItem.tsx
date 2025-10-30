import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/currency";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  description?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{transaction.title}</h4>
              <Badge variant={isIncome ? "default" : "destructive"} className="text-xs">
                {transaction.category}
              </Badge>
            </div>
            {transaction.description && (
              <p className="text-sm text-muted-foreground mb-2">{transaction.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{transaction.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-xl font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
              {formatAmount(transaction.amount, transaction.type)}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit?.(transaction.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(transaction.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
