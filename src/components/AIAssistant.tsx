import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Sparkles, Mic, MicOff, Send, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { createSale, createDebt } from '../utils/api';

export function AIAssistant({ user }: any) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      role: 'assistant',
      content: `مرحباً ${user.name}! 👋\n\nأنا المساعد الذكي لنظام ملك المavia. أستطيع مساعدتك في:\n\n📝 تسجيل المبيعات بسرعة\n💰 تسجيل الديون\n📊 الاستعلام عن البيانات\n🎤 فهم الأوامر الصوتية\n📷 تحليل صور السجلات اليدوية\n\nكيف يمكنني مساعدتك اليوم؟`,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Parse user command
      const response = await parseCommand(userMessage);
      
      // Add assistant response
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      toast.error('❌ حدث خطأ في معالجة الأمر');
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCommand = async (command: string): Promise<string> => {
    const lowerCommand = command.toLowerCase();

    // Check for sale registration
    if (lowerCommand.includes('سجل') || lowerCommand.includes('بيع') || lowerCommand.includes('مبيع')) {
      return await handleSaleCommand(command);
    }

    // Check for debt registration
    if (lowerCommand.includes('دين') || lowerCommand.includes('ديون')) {
      return await handleDebtCommand(command);
    }

    // Check for query commands
    if (lowerCommand.includes('كم') || lowerCommand.includes('إجمالي') || lowerCommand.includes('مجموع')) {
      return handleQueryCommand(command);
    }

    // Default response
    return `فهمت طلبك: "${command}"\n\nلتسجيل بيع، استخدم صيغة مثل:\n"سجل بيع طوفان 5 كيلو بسعر 10000 ريال للزبون أحمد"\n\nلتسجيل دين:\n"سجل دين على محمد بمبلغ 50000 ريال"\n\nللاستعلام:\n"كم إجمالي المبيعات اليوم؟"`;
  };

  const handleSaleCommand = async (command: string): Promise<string> => {
    try {
      // Extract sale details using pattern matching
      const productMatch = command.match(/(طوفان|طلب خاص|حسين|طلب عمنا|القحطاني|عبيده|رقم واحد)/);
      const quantityMatch = command.match(/(\d+(?:\.\d+)?)\s*(كيلو|وحدة|قطعة)?/);
      const priceMatch = command.match(/بسعر\s*(\d+(?:\.\d+)?)\s*ريال/);
      const customerMatch = command.match(/للزبون\s+(\S+)/);

      if (!productMatch || !quantityMatch || !priceMatch) {
        return '❌ الرجاء تحديد المنتج، الكمية، والسعر بوضوح.\n\nمثال:\n"سجل بيع طوفان 5 كيلو بسعر 10000 ريال للزبون أحمد"';
      }

      const saleData = {
        productName: productMatch[1],
        quantity: parseFloat(quantityMatch[1]),
        price: parseFloat(priceMatch[1]),
        customerName: customerMatch ? customerMatch[1] : 'زبون',
        paymentStatus: command.includes('معلق') || command.includes('آجل') ? 'pending' as const : 'paid' as const,
        notes: `تسجيل عبر المساعد الذكي`,
      };

      await createSale(saleData);

      const total = saleData.quantity * saleData.price;

      return `✅ تم تسجيل البيع بنجاح!\n\n📦 المنتج: ${saleData.productName}\n📊 الكمية: ${saleData.quantity}\n💵 السعر: ${saleData.price.toLocaleString('ar-YE')} ريال\n💰 الإجمالي: ${total.toLocaleString('ar-YE')} ريال\n👤 الزبون: ${saleData.customerName}\n✔️ الحالة: ${saleData.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه'}`;
    } catch (error: any) {
      return `❌ فشل تسجيل البيع: ${error.message}`;
    }
  };

  const handleDebtCommand = async (command: string): Promise<string> => {
    try {
      const customerMatch = command.match(/على\s+(\S+)/);
      const amountMatch = command.match(/بمبلغ\s*(\d+(?:\.\d+)?)\s*ريال/);

      if (!customerMatch || !amountMatch) {
        return '❌ الرجاء تحديد اسم الزبون والمبلغ.\n\nمثال:\n"سجل دين على محمد بمبلغ 50000 ريال"';
      }

      const debtData = {
        customerName: customerMatch[1],
        amount: parseFloat(amountMatch[1]),
        notes: 'تسجيل عبر المساعد الذكي',
      };

      await createDebt(debtData);

      return `✅ تم تسجيل الدين بنجاح!\n\n👤 الزبون: ${debtData.customerName}\n💰 المبلغ: ${debtData.amount.toLocaleString('ar-YE')} ريال`;
    } catch (error: any) {
      return `❌ فشل تسجيل الدين: ${error.message}`;
    }
  };

  const handleQueryCommand = (command: string): string => {
    return `📊 للاطلاع على الإحصائيات الكاملة، يرجى زيارة صفحة "التقارير والإحصائيات" من القائمة الجانبية.\n\nستجد هناك:\n• إجمالي المبيعات\n• الديون المستحقة\n• مبيعات اليوم\n• أكثر المنتجات مبيعاً\n• المزيد...`;
  };

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('🎤 بدأ التسجيل الصوتي... (تجريبي)');
      
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        setMessage('سجل بيع طوفان 5 كيلو بسعر 10000 ريال');
        toast.success('✅ تم التعرف على الصوت');
      }, 3000);
    } else {
      setIsRecording(false);
      toast.info('⏹️ تم إيقاف التسجيل');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      toast.info('📷 جاري تحليل الصورة... (تجريبي)');
      
      setTimeout(() => {
        const mockExtractedData = `تم تحليل الصورة!\n\nالبيانات المستخرجة:\n• 3 عمليات بيع\n• إجمالي: 75,000 ريال\n• زبون 1: أحمد - 25,000 ريال\n• زبون 2: محمد - 30,000 ريال\n• زبون 3: علي - 20,000 ريال\n\nهل تريد تسجيل هذه البيانات؟`;
        
        setChatHistory(prev => [...prev, 
          { role: 'user', content: '📷 قمت برفع صورة سجل يدوي' },
          { role: 'assistant', content: mockExtractedData }
        ]);
        
        toast.success('✅ تم تحليل الصورة بنجاح');
      }, 2000);
    } else {
      toast.error('❌ يرجى رفع ملف صورة فقط');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-pink-600" />
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="h-8 w-8 text-pink-400" />
            </motion.div>
          </div>
          المساعد الذكي
        </h1>
        <p className="text-gray-600 mt-1">
          استخدم الأوامر النصية أو الصوتية لتسجيل المبيعات والديون
        </p>
      </motion.div>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-4">
            <Mic className="h-8 w-8 text-pink-600 mb-2" />
            <h3 className="font-bold mb-1">الأوامر الصوتية</h3>
            <p className="text-xs text-gray-600">سجل المبيعات عبر الصوت</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <ImageIcon className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-bold mb-1">تحليل الصور</h3>
            <p className="text-xs text-gray-600">حول السجلات اليدوية لرقمية</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <Send className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-bold mb-1">الأوامر النصية</h3>
            <p className="text-xs text-gray-600">اكتب طلبك بشكل طبيعي</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 المحادثة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat History */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {chatHistory.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-green-100 text-green-900 rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <div className="flex justify-end">
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب أمرك هنا... مثال: سجل بيع طوفان 5 كيلو بسعر 10000 ريال"
                className="flex-1 min-h-[60px] resize-none"
                disabled={isProcessing}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="ml-2 h-5 w-5" />
                إرسال
              </Button>

              <Button
                onClick={handleVoiceRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                className={isRecording ? 'animate-pulse' : ''}
              >
                {isRecording ? (
                  <>
                    <MicOff className="ml-2 h-5 w-5" />
                    إيقاف التسجيل
                  </>
                ) : (
                  <>
                    <Mic className="ml-2 h-5 w-5" />
                    تسجيل صوتي
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="ml-2 h-5 w-5" />
                رفع صورة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 أمثلة على الأوامر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• "سجل بيع طوفان 5 كيلو بسعر 10000 ريال للزبون أحمد"</p>
          <p>• "سجل دين على محمد بمبلغ 50000 ريال"</p>
          <p>• "سجل بيع حسين 3 وحدة بسعر 15000 معلق"</p>
          <p>• "كم إجمالي المبيعات اليوم؟"</p>
        </CardContent>
      </Card>
    </div>
  );
}