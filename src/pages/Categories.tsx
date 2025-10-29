import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";

const categories = [
  { id: "1", name: "Food & Dining", type: "expense", color: "hsl(var(--chart-1))", count: 45 },
  { id: "2", name: "Transport", type: "expense", color: "hsl(var(--chart-2))", count: 23 },
  { id: "3", name: "Entertainment", type: "expense", color: "hsl(var(--chart-3))", count: 18 },
  { id: "4", name: "Bills & Utilities", type: "expense", color: "hsl(var(--chart-4))", count: 12 },
  { id: "5", name: "Salary", type: "income", color: "hsl(var(--success))", count: 2 },
  { id: "6", name: "Freelance", type: "income", color: "hsl(var(--success))", count: 8 },
  { id: "7", name: "Shopping", type: "expense", color: "hsl(var(--chart-5))", count: 32 },
  { id: "8", name: "Healthcare", type: "expense", color: "hsl(var(--warning))", count: 7 },
];

export default function Categories() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">Organize your transactions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} transactions
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={category.type === "income" ? "default" : "secondary"}>
                  {category.type}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
