import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, Mic, MicOff, Send, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UniversalAIProps {
  user: any;
  onAction?: (action: string, data: any) => void;
}

export function UniversalAI({ user, onAction }: UniversalAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        content: `مرحباً ${user.name}! 👋\n\nأنا المساعد الذكي الشامل لنظام ملك الماوية.\n\nيمكنني مساعدتك في أي شيء تحتاجه. فقط اسألني أو أخبرني ماذا تريد 😊`,
        timestamp: new Date()
      }]);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-SA';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        toast.success('✅ تم التعرف على الصوت');
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('❌ خطأ في التعرف على الصوت');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    const userMessage = message.trim();
    setMessage('');
    
    setChatHistory(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    }]);
    
    setIsProcessing(true);

    try {
      // Call Gemini AI
      const response = await callGeminiAI(userMessage);
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error('❌ حدث خطأ في معالجة طلبك');
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const callGeminiAI = async (userMessage: string): Promise<string> => {
    try {
      // Try Gemini first
      const geminiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';
      
      if (geminiKey) {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `أنت مساعد ذكي لنظام إدارة مبيعات القات "ملك المavia" في اليمن.

المستخدم: ${user.name} (${user.role})

السياق: أنت تساعد في:
- تسجيل المبيعات والديون
- البحث في البيانات
- إنشاء التقارير
- تحليل الأرقام
- الإجابة على الأسئلة
- أي مهمة أخرى

المنتجات المتاحة: طوفان، طلب خاص، حسين، طلب عمنا، القحطاني، عبيده، رقم واحد

تعليمات:
1. كن ودوداً ومفيداً
2. استخدم اللغة العربية
3. إذا طلب تسجيل بيع أو دين، استخرج البيانات بتنسيق JSON
4. إذا سأل سؤالاً، أجب بشكل واضح ومفصل
5. إذا لم تفهم، اطلب التوضيح

استفسار المستخدم: ${userMessage}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.candidates[0].content.parts[0].text;
          
          // Check if response contains action
          await processAIResponse(aiResponse, userMessage);
          
          return aiResponse;
        }
      }

      // Fallback to OpenAI
      const openaiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_OPENAI_API_KEY : '';
      
      if (openaiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `أنت مساعد ذكي لنظام إدارة مبيعات القات "ملك المavia" في اليمن. المستخدم: ${user.name} (${user.role}). ساعد في كل شيء بشكل ذكي وودود.`
              },
              {
                role: 'user',
                content: userMessage
              }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices[0].message.content;
          
          await processAIResponse(aiResponse, userMessage);
          
          return aiResponse;
        }
      }

      // Local fallback
      return await processLocalAI(userMessage);
      
    } catch (error) {
      console.error('AI call error:', error);
      return await processLocalAI(userMessage);
    }
  };

  const processAIResponse = async (aiResponse: string, userMessage: string) => {
    // Check if AI response contains action instructions
    const lowerResponse = aiResponse.toLowerCase();
    const lowerMessage = userMessage.toLowerCase();

    // Parse sale command
    if ((lowerMessage.includes('سجل') || lowerMessage.includes('بيع')) && 
        (lowerResponse.includes('json') || lowerResponse.includes('{'))) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch && onAction) {
          const data = JSON.parse(jsonMatch[0]);
          onAction('createSale', data);
        }
      } catch (e) {
        console.error('Failed to parse sale data:', e);
      }
    }

    // Parse debt command
    if (lowerMessage.includes('دين') && 
        (lowerResponse.includes('json') || lowerResponse.includes('{'))) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch && onAction) {
          const data = JSON.parse(jsonMatch[0]);
          onAction('createDebt', data);
        }
      } catch (e) {
        console.error('Failed to parse debt data:', e);
      }
    }
  };

  const processLocalAI = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Sale commands - Enhanced patterns
    if (lowerMessage.includes('سجل') || lowerMessage.includes('بيع') || lowerMessage.includes('معه') || lowerMessage.includes('معاه')) {
      // Extract customer name - multiple patterns
      let customerName = 'زبون';
      const customerPatterns = [
        /سجل\s+(\S+)\s+معه/,
        /سجل\s+(\S+)\s+معاه/,
        /للزبون\s+(\S+)/,
        /زبون\s+(\S+)/,
        /اسمه\s+(\S+)/,
        /(\S+)\s+معه/,
        /(\S+)\s+معاه/
      ];
      
      for (const pattern of customerPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          customerName = match[1];
          break;
        }
      }

      // Extract product name
      const productMatch = userMessage.match(/(طوفان|طلب خاص|حسين|طلب عمنا|القحطاني|عبيده|رقم واحد)/);
      
      // Extract quantity - Enhanced patterns
      let quantity = 1;
      const quantityPatterns = [
        { pattern: /نص|نصف/, value: 0.5, text: 'نص حبة' },
        { pattern: /ربع/, value: 0.25, text: 'ربع حبة' },
        { pattern: /ثلثين/, value: 0.67, text: 'ثلثين حبة' },
        { pattern: /ثلث/, value: 0.33, text: 'ثلث حبة' },
        { pattern: /حبة\s*واحدة|حبة\s*وحدة|٠\s*حبة|0\s*حبة/, value: 1, text: '1 حبة' },
        { pattern: /حبتين|حبتان|٢\s*حبات|2\s*حبات/, value: 2, text: '2 حبات' },
        { pattern: /ثلاث\s*حبات|٣\s*حبات|3\s*حبات/, value: 3, text: '3 حبات' },
        { pattern: /اربع\s*حبات|أربع\s*حبات|٤\s*حبات|4\s*حبات/, value: 4, text: '4 حبات' },
        { pattern: /خمس\s*حبات|٥\s*حبات|5\s*حبات/, value: 5, text: '5 حبات' },
        { pattern: /(\d+\.?\d*)\s*حبة/, value: 0, text: '' }
      ];

      let quantityText = '1 حبة';
      for (const qp of quantityPatterns) {
        const match = userMessage.match(qp.pattern);
        if (match) {
          if (qp.value === 0) {
            quantity = parseFloat(match[1]);
            quantityText = `${quantity} ${quantity === 1 ? 'حبة' : 'حبات'}`;
          } else {
            quantity = qp.value;
            quantityText = qp.text;
          }
          break;
        }
      }

      // Extract price - Enhanced patterns
      let price = 0;
      const pricePatterns = [
        /بي\s*(\d+)\s*الف/,
        /بـ\s*(\d+)\s*الف/,
        /ب\s*(\d+)\s*الف/,
        /بسعر\s*(\d+)\s*الف/,
        /(\d+)\s*الف\s*ريال/,
        /بي\s*(\d+)/,
        /بسعر\s*(\d+)/,
        /سعر\s*(\d+)/,
        /(\d{4,})\s*ريال/
      ];

      for (const pattern of pricePatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          price = parseFloat(match[1]);
          // If price is in thousands (الف)
          if (pattern.toString().includes('الف')) {
            price = price * 1000;
          }
          break;
        }
      }

      // Check if all required data is available
      if (productMatch && price > 0 && onAction) {
        const paymentStatus = (userMessage.includes('معلق') || 
                             userMessage.includes('آجل') || 
                             userMessage.includes('دين') ||
                             userMessage.includes('عليه')) ? 'pending' : 'paid';

        const saleData = {
          productName: productMatch[1],
          quantity: quantity.toString(),
          price: price.toString(),
          customerName: customerName,
          paymentStatus: paymentStatus,
          notes: 'تسجيل عبر المساعد الذكي'
        };

        onAction('createSale', saleData);
        
        const total = quantity * price;
        return `✅ تم تسجيل البيع بنجاح!\\n\\n👤 الزبون: ${customerName}\\n📦 المنتج: ${saleData.productName}\\n📊 الكمية: ${quantityText}\\n💵 السعر للحبة: ${price.toLocaleString('ar-YE')} ريال يمني\\n💰 الإجمالي: ${total.toLocaleString('ar-YE')} ريال يمني\\n✔️ الحالة: ${paymentStatus === 'paid' ? '💵 مدفوع نقداً' : '💳 دين عليه'}\\n\\n🎉 تم الحفظ في قاعدة البيانات!`;
      }

      // If missing data, ask for it
      let missing = [];
      if (!productMatch) missing.push('نوع القات');
      if (price === 0) missing.push('السعر');

      return `لم أتمكن من فهم كل التفاصيل. ينقصني:\\n${missing.map(m => '• ' + m).join('\\n')}\\n\\n📝 أمثلة صحيحة:\\n• "سجل أحمد معه حبة طوفان بي خمسين الف"\\n• "سجل محمد 3 حبات حسين بسعر 20000 ريال"\\n• "بيع علي نص حبة القحطاني بي 30 الف معلق"\\n• "سجل سعيد حبتين طلب خاص بسعر 45000"`;
    }

    // Debt commands - Enhanced
    if (lowerMessage.includes('دين') || lowerMessage.includes('على') && lowerMessage.includes('ريال')) {
      const customerPatterns = [
        /دين\s+على\s+(\S+)/,
        /دين\s+من\s+(\S+)/,
        /على\s+(\S+)\s+دين/,
        /(\S+)\s+عليه\s+دين/,
        /للزبون\s+(\S+)/
      ];

      let customerName = '';
      for (const pattern of customerPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          customerName = match[1];
          break;
        }
      }

      const amountPatterns = [
        /(\d+)\s*الف\s*ريال/,
        /بمبلغ\s*(\d+)\s*الف/,
        /مبلغ\s*(\d+)\s*الف/,
        /بي\s*(\d+)\s*الف/,
        /(\d{4,})\s*ريال/
      ];

      let amount = 0;
      for (const pattern of amountPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          amount = parseFloat(match[1]);
          if (pattern.toString().includes('الف')) {
            amount = amount * 1000;
          }
          break;
        }
      }

      if (customerName && amount > 0 && onAction) {
        const debtData = {
          customerName: customerName,
          amount: amount.toString(),
          notes: 'تسجيل عبر المساعد الذكي'
        };

        onAction('createDebt', debtData);
        
        return `✅ تم تسجيل الدين بنجاح!\\n\\n👤 الزبون: ${customerName}\\n💰 المبلغ: ${amount.toLocaleString('ar-YE')} ريال يمني\\n📝 الملاحظات: ${debtData.notes}\\n\\n🎉 تم الحفظ في قاعدة البيانات!`;
      }

      return 'لم أتمكن من فهم تفاصيل الدين. استخدم صيغة مثل:\\n• "دين على محمد 50 الف ريال"\\n• "سجل دين على أحمد بمبلغ 100000 ريال"';
    }

    // General help
    if (lowerMessage.includes('مساعدة') || lowerMessage.includes('كيف') || lowerMessage.includes('ساعدني')) {
      return `🤖 أنا المساعد الذكي الشامل لنظام ملك المavia!\\n\\nأستطيع مساعدتك في:\\n\\n📝 تسجيل المبيعات:\\n• "سجل أحمد معه حبة طوفان بي خمسين الف"\\n• "يع محمد 3 حبات حسين بسعر 20000"\\n• "سجل علي نص حبة القحطاني بي 30 الف معلق"\\n\\n💰 تسجيل الديون:\\n• "دين على أحمد 50 الف ريال"\\n• "سجل دين على محمد بمبلغ 80000"\\n\\n📷 تحليل الصور:\\n• ارفع صورة دفتر وسأحللها\\n\\n🎤 الأوامر الصوتية:\\n• اضغط زر الميكروفون\\n\\n📊 معلومات:\\n• "كم إجمالي المبيعات؟"\\n• "عرض تقرير اليوم"\\n\\nفقط أخبرني ماذا تحتاج! 😊`;
    }

    // Stats query
    if (lowerMessage.includes('كم') || lowerMessage.includes('إجمالي') || lowerMessage.includes('تقرير')) {
      return `📊 للاطلاع على الإحصائيات والتقارير:\\n\\n🏠 الصفحة الرئيسية:\\n• إحصائيات شاملة\\n• أداء المبيعات\\n• ملخص الديون\\n\\n📈 صفحة التقارير:\\n• تقارير مفصلة\\n• رسوم بيانية\\n• تحليلات متقدمة\\n\\n📋 كشوفات الزبائن:\\n• ديون كل زبون\\n• تاريخ الدفعات\\n• تنزيل PDF\\n\\nانتقل لأي صفحة وسأكون معك دائماً! 💬`;
    }

    // Customer query
    if (lowerMessage.includes('زبون') || lowerMessage.includes('عميل')) {
      return `👥 إدارة الزبائن:\\n\\n📋 كشوفات الزبائن:\\n• اذهب لصفحة "كشوفات الزبائن"\\n• ابحث عن الزبون المطلوب\\n• شاهد تفاصيل ديونه\\n• نزّل تقرير PDF أو Excel\\n\\n📝 تسجيل معاملات جديدة:\\n• سجل بيع جديد من صفحة "المبيعات"\\n• سجل دين من صفحة "الديون"\\n• أو اطلب مني مباشرة!\\n\\nماذا تريد أن تفعل بالتحديد؟`;
    }

    // Products query
    if (lowerMessage.includes('منتج') || lowerMessage.includes('قات') || lowerMessage.includes('نوع') || lowerMessage.includes('أنواع')) {
      return `📦 أنواع القات المتاحة:\\n\\n1. 🌟 طوفان - ممتاز\\n2. 👑 طلب خاص - فاخر\\n3. ✨ حسين - جيد\\n4. 💎 طلب عمنا - ممتاز\\n5. 🏆 القحطاني - فاخر\\n6. ⭐ عبيده - جيد\\n7. 🥇 رقم واحد - فاخر\\n\\nلإدارة المنتجات:\\n• اذهب لصفحة "إدارة المنتجات"\\n• أضف صور للمنتجات\\n• تتبع المخزون\\n\\nهل تريد تسجيل بيع لأحد هذه الأنواع؟`;
    }

    // Print/Notebook query
    if (lowerMessage.includes('طباعة') || lowerMessage.includes('دفتر')) {
      return `📖 دفاتر الطباعة:\\n\\nاذهب لصفحة "دفتر الطباعة" ستجد:\\n\\n💵 دفتر النقد (أخضر):\\n• للمبيعات المدفوعة\\n• 18 سطر لكل صفحة\\n\\n💳 دفتر الديون (أحمر):\\n• للمبيعات المعلقة\\n• تسجيل أسماء المدينين\\n\\n📷 بعد الطباعة:\\n1. اكتب المبيعات يدوياً\\n2. صور الصفحة\\n3. ارفعها لي هنا\\n4. سأحللها تلقائياً!\\n\\nجربها الآن! 🚀`;
    }

    // Default response
    return `مرحباً! 👋\\n\\nفهمت استفسارك: "${userMessage}"\\n\\nيمكنني مساعدتك في:\\n\\n✅ تسجيل المبيعات\\n   مثال: "سجل أحمد معه حبة طوفان بي 50 الف"\\n\\n✅ تسجيل الديون\\n   مثال: "دين على محمد 80 الف"\\n\\n✅ البحث والتقارير\\n✅ تحليل الصور\\n✅ أي شيء آخر!\\n\\nيرجى توضيح ماذا تريد، أو اسأل "كيف يمكنك مساعدتي؟"\\n\\nأنا هنا لخدمتك! 😊`;
  };

  const handleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast.error('❌ المتصفح لا يدعم التعرف الصوتي. جرب Chrome أو Edge.');
      return;
    }

    if (!isRecording) {
      try {
        setIsRecording(true);
        recognitionRef.current.start();
        toast.info('🎤 يتم التسجيل... تحدث بوضوح');
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error('❌ فشل بدء التسجيل');
        setIsRecording(false);
      }
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('❌ يرجى رفع ملف صورة فقط');
      return;
    }

    setIsAnalyzing(true);
    toast.info('📷 جاري تحليل الصورة...');
    
    setChatHistory(prev => [...prev, { 
      role: 'user', 
      content: '📷 قمت برفع صورة سجل',
      timestamp: new Date()
    }]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        try {
          // Try Gemini Vision
          const geminiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';
          
          if (geminiKey) {
            const imageData = base64Image.split(',')[1];
            
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=' + geminiKey, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    {
                      text: 'قم بتحليل هذه الصورة لسجل مبيعات القات وأستخرج البيانات: اسم المنتج، الكمية، السعر، الزبون، حالة الدفع. أرسل النتيجة بصيغة JSON إذا أمكن.'
                    },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: imageData
                      }
                    }
                  ]
                }]
              })
            });

            if (response.ok) {
              const data = await response.json();
              const result = data.candidates[0].content.parts[0].text;
              
              setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: `✅ تم تحليل الصورة بنجاح!\n\n${result}`,
                timestamp: new Date()
              }]);
              
              toast.success('✅ تم تحليل الصورة');
              setIsAnalyzing(false);
              return;
            }
          }

          // Fallback to OpenAI Vision
          const openaiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_OPENAI_API_KEY : '';
          
          if (openaiKey) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'قم بتحليل هذه الصورة لسجل مبيعات القات وأستخرج: المنتج، الكمية، السعر، الزبون، حالة الدفع.'
                    },
                    {
                      type: 'image_url',
                      image_url: { url: base64Image }
                    }
                  ]
                }],
                max_tokens: 1000
              })
            });

            if (response.ok) {
              const data = await response.json();
              const result = data.choices[0].message.content;
              
              setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: `✅ تم تحليل الصورة!\n\n${result}`,
                timestamp: new Date()
              }]);
              
              toast.success('✅ تم تحليل الصورة');
              setIsAnalyzing(false);
              return;
            }
          }

          // No API available
          throw new Error('No vision API configured');
          
        } catch (error: any) {
          // Not a real error, just missing API key
          if (error.message === 'No vision API configured') {
            console.warn('Vision API not configured - API key needed');
          } else {
            console.error('Vision API error:', error);
          }
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: `📷 لم أتمكن من تحليل الصورة تلقائياً.\n\nلاستخدام هذه الميزة:\n1. أضف مفتاح Gemini AI أو OpenAI\n2. راجع ملف /HOW_TO_ADD_GEMINI_KEY.md\n\nيمكنك حالاً إدخال البيانات يدوياً.`,
            timestamp: new Date()
          }]);
          toast.error('❌ فشل تحليل الصورة');
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('File error:', error);
      toast.error('❌ فشل معالجة الملف');
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-2xl"
        >
          <Sparkles className="h-8 w-8" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
    >
      <Card className="shadow-2xl border-2 border-pink-200">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold">المساعد الذكي</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-0">
          {/* Chat Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatHistory.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap text-sm ${
                    msg.role === 'user'
                      ? 'bg-green-100 text-green-900 rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {(isProcessing || isAnalyzing) && (
              <div className="flex justify-end">
                <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  <span className="text-xs text-gray-600">
                    {isAnalyzing ? 'جاري التحليل...' : 'جاري التفكير...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2 mb-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب أي شيء... سأساعدك 😊"
                className="flex-1 min-h-[60px] resize-none text-sm"
                disabled={isProcessing || isAnalyzing}
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!message.trim() || isProcessing || isAnalyzing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="ml-2 h-4 w-4" />
                إرسال
              </Button>

              <Button
                size="sm"
                onClick={handleVoiceRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                className={isRecording ? 'animate-pulse' : ''}
                disabled={isProcessing || isAnalyzing}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isProcessing || isAnalyzing}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}