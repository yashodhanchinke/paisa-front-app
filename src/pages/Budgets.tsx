import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, AlertTriangle } from "lucide-react";

const budgets = [
  {
    id: "1",
    category: "Food & Dining",
    spent: 450,
    limit: 600,
    period: "Monthly",
  },
  {
    id: "2",
    category: "Transport",
    spent: 220,
    limit: 250,
    period: "Monthly",
  },
  {
    id: "3",
    category: "Entertainment",
    spent: 180,
    limit: 150,
    period: "Monthly",
  },
  {
    id: "4",
    category: "Shopping",
    spent: 320,
    limit: 400,
    period: "Monthly",
  },
];

export default function Budgets() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage > 80 && percentage <= 100;

          return (
            <Card key={budget.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{budget.category}</CardTitle>
                  {isOverBudget ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Over Budget
                    </Badge>
                  ) : isNearLimit ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Near Limit
                    </Badge>
                  ) : (
                    <Badge>On Track</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-semibold">${budget.spent.toFixed(2)}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${
                      isOverBudget
                        ? "[&>*]:bg-destructive"
                        : isNearLimit
                        ? "[&>*]:bg-warning"
                        : "[&>*]:bg-success"
                    }`}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget Limit</span>
                    <span className="font-semibold">${budget.limit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">{budget.period}</span>
                    <span
                      className={`text-sm font-medium ${
                        isOverBudget
                          ? "text-destructive"
                          : isNearLimit
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {percentage.toFixed(1)}% used
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
