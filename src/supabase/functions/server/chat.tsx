// AI Chat Handler for Qat Sales Assistant
export async function handleChatMessage(message: string, context: any) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Validate API key format
  if (!openaiKey.startsWith('sk-')) {
    throw new Error('مفتاح OpenAI API غير صحيح. يجب أن يبدأ المفتاح بـ sk-');
  }

  // Prepare context data
  const contextInfo = `
بيانات السياق:
- عدد المنتجات: ${context.products?.length || 0}
- عدد المبيعات: ${context.sales?.length || 0}
- عدد الديون: ${context.debts?.length || 0}
- إجمالي المبيعات: ${context.totalSales || 0} ريال
- إجمالي الديون: ${context.totalDebts || 0} ريال

المنتجات المتاحة: ${context.products?.map((p: any) => p.name).join('، ') || 'لا توجد منتجات'}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `أنت مساعد ذكي متخصص في نظام ملك الماوية لإدارة تجارة القات.

مهامك:
1. مساعدة المدير في إدارة المبيعات والديون
2. تحليل البيانات وتقديم رؤى وإحصاءات
3. الإجابة على الأسئلة حول العملاء والمنتجات
4. تقديم توصيات لتحسين الأداء
5. إنشاء تقارير مخصصة عند الطلب
6. حساب الأرباح والخسائر
7. تتبع الديون والمدفوعات

قواعد مهمة:
- تحدث بالعربية فقط
- كن دقيقاً في الأرقام والحسابات
- قدم إجابات واضحة ومباشرة
- استخدم الإيموجي لجعل الردود أكثر وضوحاً
- إذا طلب المدير تقرير أو تحليل، قدم بيانات مفصلة

${contextInfo}
`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI Chat API error:', error);
    throw new Error('فشل في الحصول على رد من المساعد الذكي');
  }

  const result = await response.json();
  return result.choices[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك';
}