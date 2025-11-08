import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile?.spending_alerts_enabled) {
      return new Response(JSON.stringify({ message: 'Alerts disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current month spending by category
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    // Group by category and check limits
    const categorySpending = new Map<string, { spent: number; limit: number; name: string }>();
    
    transactions?.forEach((t: any) => {
      if (t.categories) {
        const categoryId = t.category_id;
        const existing = categorySpending.get(categoryId) || { 
          spent: 0, 
          limit: t.categories.monthly_limit || 0,
          name: t.categories.name 
        };
        existing.spent += Number(t.amount);
        categorySpending.set(categoryId, existing);
      }
    });

    // Find categories exceeding 80% of limit
    const alerts: string[] = [];
    categorySpending.forEach((data) => {
      if (data.limit > 0) {
        const percentage = (data.spent / data.limit) * 100;
        if (percentage >= 80) {
          alerts.push(`${data.name}: ₹${data.spent.toFixed(2)} / ₹${data.limit.toFixed(2)} (${percentage.toFixed(0)}%)`);
        }
      }
    });

    // Log alerts (email functionality can be added later with Resend integration)
    if (alerts.length > 0) {
      console.log('Spending alerts for user:', user.id);
      alerts.forEach(alert => console.log(alert));
    }

    return new Response(JSON.stringify({ 
      alerts,
      message: alerts.length > 0 ? 'Alerts sent' : 'No alerts' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-spending-alerts:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});