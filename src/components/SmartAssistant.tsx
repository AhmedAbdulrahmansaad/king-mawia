/**
 * المساعد الذكي المتقدم - نظام ملك المavia
 * 
 * الميزات:
 * ✓ تحليل الصور (رفع صورة من الدفتر)
 * ✓ أوامر نصية ذكية
 * ✓ استخراج بيانات المبيعات تلقائياً
 * ✓ تقارير يومية وشهرية
 * ✓ إدارة الديون
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  Camera,
  FileText,
  BarChart3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Badge } from './ui/badge';
import { getAuthToken } from '../utils/api';

interface SmartAssistantProps {
  user: any;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
}

export function SmartAssistant({ user }: SmartAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 مرحباً! أنا المساعد الذكي لنظام ملك الماوية.\n\n⚠️ **تنبيه هام:**\nلاستخدام المساعد الذكي، تحتاج إلى:\n\n1️⃣ **إضافة OpenAI API Key:**\n   • اذهب إلى: https://platform.openai.com/api-keys\n   • أنشئ مفتاح API جديد\n   • أضفه في إعدادات Supabase (متغير OPENAI_API_KEY)\n\n2️⃣ **تفعيل الدفع في OpenAI:**\n   • اذهب إلى: https://platform.openai.com/settings/organization/billing\n   • أضف بطاقة ائتمان\n   • أضف رصيد ($5 كافي للبداية)\n\n💡 **البدائل:**\n   • استخدم نظام المبيعات العادي (بدون AI)\n   • أدخل البيانات يدوياً من صفحة المبيعات\n   • استخدم التقارير المدمجة\n\nكيف يمكنني مساعدتك؟',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('تم اختيار الصورة. اكتب تعليماتك أو اضغط إرسال');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) {
      toast.error('اكتب رسالة أو اختر صورة');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input || 'تحليل صورة',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى');
      }
      
      let requestBody: any = {
        mode: selectedImage ? 'image' : 'text',
        text: input || 'حلل هذه الصورة واستخرج بيانات المبيعات',
      };

      if (selectedImage) {
        requestBody.imageBase64 = selectedImage;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-06efd250/assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل الاتصال بالمساعد الذكي');
      }

      let assistantContent = '';
      
      if (data.success) {
        if (selectedImage) {
          // Image analysis response
          assistantContent = `✅ تم تحليل الصورة بنجاح!\n\n`;
          
          if (data.extracted?.items?.length > 0) {
            assistantContent += `📦 تم استخراج ${data.insertedCount} عملية مبيعات:\n\n`;
            
            data.extracted.items.forEach((item: any, index: number) => {
              assistantContent += `${index + 1}. ${item.type}\n`;
              assistantContent += `   الكمية: ${item.quantity}\n`;
              assistantContent += `   السعر: ${item.unit_price.toLocaleString('ar-YE')} ريال\n`;
              assistantContent += `   الإجمالي: ${item.total.toLocaleString('ar-YE')} ريال\n`;
              if (item.customerName) {
                assistantContent += `   الزبون: ${item.customerName}\n`;
              }
              assistantContent += `\n`;
            });

            if (data.extracted.summary) {
              assistantContent += `\n💰 الإجمالي الكلي: ${data.extracted.summary.total_sales.toLocaleString('ar-YE')} ريال يمني\n`;
            }
          } else {
            assistantContent += `⚠️ لم يتم العثور على بيانات مبيعات في الصورة.\n`;
          }
        } else if (data.result) {
          // Command response
          if (data.result.total !== undefined) {
            assistantContent = `${data.message}\n\n`;
            assistantContent += `💰 الإجمالي: ${data.result.total.toLocaleString('ar-YE')} ريال يمني\n`;
            assistantContent += `📊 عدد العمليات: ${data.result.count || data.result.items?.length || 0}\n`;
          } else {
            assistantContent = data.message || 'تم تنفيذ الأمر بنجاح';
          }
        } else if (data.reply) {
          // Text response
          assistantContent = data.reply;
        } else {
          assistantContent = '✅ تم تنفيذ الطلب بنجاح';
        }
      } else {
        throw new Error(data.error || 'حدث خطأ غير متوقع');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        data: data,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (selectedImage) {
        removeImage();
        toast.success('✅ تم حفظ البيانات بنجاح!');
      }

      setTimeout(scrollToBottom, 100);

    } catch (error: any) {
      console.error('Assistant error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ عذراً، حدث خطأ: ${error.message}\n\nتأكد من:\n- الاتصال بالإنترنت\n- صلاحيات الوصول\n- جودة الصورة`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('فشل معالجة الطلب');
    } finally {
      setLoading(false);
    }
  };

  const quickCommands = [
    {
      label: '📊 تقرير اليوم',
      action: () => setInput('أعطني تقرير مبيعات اليوم'),
    },
    {
      label: '📅 تقرير الشهر',
      action: () => setInput('أعطني تقرير مبيعات هذا الشهر'),
    },
    {
      label: '💰 إجمالي الديون',
      action: () => setInput('كم إجمالي الديون المستحقة؟'),
    },
    {
      label: '🎯 أفضل المنتجات',
      action: () => setInput('ما هي أفضل المنتجات مبيعاً؟'),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full border-2 border-green-200">
        <CardHeader className="border-b bg-gradient-to-l from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                المساعد الذكي
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  AI
                </Badge>
              </CardTitle>
              <CardDescription>
                مدعوم بتقنية GPT-4 Vision - تحليل ذكي للصور والنصوص
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-gradient-to-l from-green-600 to-emerald-600 text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-gray-500' : 'text-green-100'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ar-YE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-l from-green-600 to-emerald-600 text-white rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">جاري التحليل...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Commands */}
          <div className="border-t p-3 bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">أوامر سريعة:</p>
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((cmd, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={cmd.action}
                  disabled={loading}
                  className="text-xs h-7 hover:bg-green-50 hover:border-green-300"
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="border-t p-4 bg-blue-50">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="معاينة"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-blue-300"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">صورة جاهزة للتحليل</p>
                  <p className="text-xs text-blue-700 mt-1">
                    اكتب تعليمات إضافية أو اضغط إرسال مباشرة
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="shrink-0 hover:bg-blue-50 hover:border-blue-300"
                title="رفع صورة"
              >
                <Camera className="h-5 w-5" />
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={selectedImage ? "تعليمات إضافية (اختياري)..." : "اكتب سؤالك أو أمرك هنا..."}
                disabled={loading}
                className="flex-1"
              />

              <Button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !selectedImage)}
                className="shrink-0 bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>تحليل صور</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>استخراج تقارير</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>إدارة ذكة</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}