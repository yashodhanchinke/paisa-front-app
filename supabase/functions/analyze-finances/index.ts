import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions } = await req.json();
    console.log('Analyzing finances for transactions:', transactions?.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare transaction summary for AI analysis
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    const categoryBreakdown = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const prompt = `Analyze this financial data and provide personalized savings suggestions:

Income: $${totalIncome.toFixed(2)}
Expenses: $${totalExpenses.toFixed(2)}
Net Savings: $${(totalIncome - totalExpenses).toFixed(2)}

Expense Breakdown by Category:
${Object.entries(categoryBreakdown).map(([cat, amount]) => `- ${cat}: $${(amount as number).toFixed(2)}`).join('\n')}

Please provide:
1. A brief financial health assessment (2-3 sentences)
2. Top 3-5 specific, actionable savings suggestions based on the spending patterns
3. One predicted outcome if they implement your suggestions (e.g., "You could save $X per month")

Keep the tone friendly and encouraging. Format your response with clear sections.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly financial advisor helping users save money and improve their financial health. Provide practical, specific advice based on their spending patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    console.log('Successfully generated financial insights');

    return new Response(
      JSON.stringify({
        insights,
        summary: {
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
          categoryBreakdown
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-finances function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
