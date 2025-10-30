import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Camera, FileText } from "lucide-react";
import Tesseract from "tesseract.js";

interface AddTransactionDialogProps {
  categories: Array<{ id: string; name: string; icon: string }>;
  onSuccess: () => void;
}

export function AddTransactionDialog({ categories, onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleOCRScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    toast({ title: "Scanning receipt...", description: "Please wait while we extract information" });

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m)
      });

      // Simple parsing logic - extract numbers that look like amounts
      const amounts = text.match(/[\d,]+\.?\d{0,2}/g);
      const largestAmount = amounts?.map(a => parseFloat(a.replace(/,/g, ''))).sort((a, b) => b - a)[0];
      
      if (largestAmount) {
        setAmount(largestAmount.toString());
      }

      // Try to extract merchant/title from first few lines
      const lines = text.split('\n').filter(l => l.trim());
      if (lines[0]) {
        setTitle(lines[0].substring(0, 50));
      }

      toast({ 
        title: "Receipt scanned!", 
        description: "Please verify and adjust the details" 
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({ 
        title: "Scan failed", 
        description: "Please enter details manually",
        variant: "destructive" 
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !amount || !categoryId) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        title,
        amount: parseFloat(amount),
        category_id: categoryId,
        type,
        description,
        date,
        source: 'manual'
      });

      if (error) throw error;

      // Check spending alerts
      await supabase.functions.invoke('check-spending-alerts');

      toast({ title: "Transaction added!", description: "Your transaction has been recorded" });
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategoryId("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <FileText className="mr-2 h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ocr">
              <Camera className="mr-2 h-4 w-4" />
              Scan Receipt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grocery shopping" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes" rows={2} />
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-4">
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Upload a receipt image to auto-fill details</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleOCRScan}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={ocrLoading}>
                {ocrLoading ? "Scanning..." : "Upload Receipt"}
              </Button>
            </div>

            {(title || amount) && (
              <div className="space-y-4">
                <p className="text-sm font-medium">Scanned Details (verify and adjust):</p>
                
                <div className="space-y-2">
                  <Label htmlFor="title-ocr">Title *</Label>
                  <Input id="title-ocr" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount-ocr">Amount (₹) *</Label>
                  <Input id="amount-ocr" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type-ocr">Type *</Label>
                  <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-ocr">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-ocr">Date *</Label>
                  <Input id="date-ocr" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}