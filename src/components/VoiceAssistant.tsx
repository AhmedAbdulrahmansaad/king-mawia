import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Upload, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { apiRequest, uploadImage } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface VoiceCommand {
  action: 'sale' | 'debt' | 'query';
  product?: string;
  quantity?: number;
  price?: number;
  customer?: string;
  paymentType?: 'نقدي' | 'دَين';
  rawText: string;
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [command, setCommand] = useState<VoiceCommand | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-SA';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('⚠️ الرجاء السماح بالوصول للميكروفون من إعدادات المتصفح!', {
            description: 'اضغط على أيقونة القفل بجانب عنوان الموقع وسمح بالميكروفون',
            duration: 6000,
          });
        } else if (event.error === 'no-speech') {
          toast.error('لم يتم اكتشاف صوت. تحدث بوضوح وحاول مرة أخرى.');
        } else {
          toast.error('خطأ في التعرف على الصوت. حاول مرة أخرى.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('❌ التعرف على الصوت غير مدعوم في هذا المتصفح. استخدم Chrome أو Edge.', {
        duration: 5000,
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success('🎤 جاهز للاستماع... تحدث الآن');
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        toast.error('⚠️ فشل تشغيل الميكروفون. تأكد من منح الإذن في المتصفح!', {
          description: 'اضغط على أيقونة القفل 🔒 في شريط العنوان واختر "السماح" للميكروفون',
          duration: 8000,
        });
      }
    }
  };

  const parseVoiceCommand = async (text: string): Promise<VoiceCommand | null> => {
    // Send to AI for parsing
    try {
      const response = await apiRequest('/parse-voice-command', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      return response.command;
    } catch (error) {
      console.error('Failed to parse command:', error);
      return null;
    }
  };

  const handleProcessCommand = async () => {
    if (!transcript) return;

    setProcessing(true);
    try {
      const parsedCommand = await parseVoiceCommand(transcript);
      
      if (!parsedCommand) {
        toast.error('لم أفهم الأمر. حاول مرة أخرى بطريقة أوضح.');
        setProcessing(false);
        return;
      }

      setCommand(parsedCommand);

      // Execute command based on action
      if (parsedCommand.action === 'sale') {
        await executeSaleCommand(parsedCommand);
      } else if (parsedCommand.action === 'debt') {
        await executeDebtCommand(parsedCommand);
      } else if (parsedCommand.action === 'query') {
        await executeQueryCommand(parsedCommand);
      }

      toast.success('✅ تم تنفيذ الأمر بنجاح!');
    } catch (error) {
      console.error('Command execution failed:', error);
      toast.error('فشل تنفيذ الأمر. حاول مرة أخرى.');
    } finally {
      setProcessing(false);
    }
  };

  const executeSaleCommand = async (cmd: VoiceCommand) => {
    const saleData = {
      product_name: cmd.product,
      quantity: cmd.quantity,
      price: cmd.price,
      total_amount: (cmd.quantity || 0) * (cmd.price || 0),
      payment_type: cmd.paymentType || 'نقدي',
      customer_name: cmd.customer || 'زبون عام',
      date: new Date().toISOString(),
    };

    await apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });

    // Create backup
    await createBackup('sale', saleData);
  };

  const executeDebtCommand = async (cmd: VoiceCommand) => {
    const debtData = {
      customer_name: cmd.customer,
      product_name: cmd.product,
      amount: cmd.price,
      date: new Date().toISOString(),
    };

    await apiRequest('/debts', {
      method: 'POST',
      body: JSON.stringify(debtData),
    });

    await createBackup('debt', debtData);
  };

  const executeQueryCommand = async (cmd: VoiceCommand) => {
    // Query data based on command
    const response = await apiRequest('/query', {
      method: 'POST',
      body: JSON.stringify({ query: cmd.rawText }),
    });
    
    // Speak the response
    speakResponse(response.answer);
  };

  const createBackup = async (type: string, data: any) => {
    await apiRequest('/backup', {
      method: 'POST',
      body: JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString(),
      }),
    });
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setProcessing(true);
    try {
      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          // Upload and analyze image
          const uploadResponse = await uploadImage(file);
          const analysisResponse = await apiRequest('/analyze-record', {
            method: 'POST',
            body: JSON.stringify({ imageUrl: uploadResponse.url }),
          });

          // Automatically save sales and debts
          const result = analysisResponse.result;
          
          // Save sales
          for (const sale of result.sales) {
            await apiRequest('/sales', {
              method: 'POST',
              body: JSON.stringify({
                ...sale,
                date: new Date().toISOString(),
              }),
            });
          }

          // Save debts
          for (const debt of result.debts) {
            await apiRequest('/debts', {
              method: 'POST',
              body: JSON.stringify({
                ...debt,
                date: new Date().toISOString(),
              }),
            });
          }

          await createBackup('image_analysis', result);
          toast.success(`✅ تم تحليل وحفظ البيانات من ${file.name}`);
        }
      }

      setSelectedFiles([]);
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('فشل رفع الملفات. حاول مرة أخرى.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Microphone Permission Alert */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-800 mb-2">🎤 تنبيه: إذن الميكروفون مطلوب</h4>
              <p className="text-sm text-blue-700 mb-2">
                عند الضغط على زر الميكروفون لأول مرة، سيطلب منك المتصفح السماح بالوصول للميكروفون:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>اضغط على زر <strong>"السماح"</strong> أو <strong>"Allow"</strong> في النافذة المنبثقة</li>
                <li>إذا رفضت بالخطأ، اضغط على أيقونة القفل 🔒 بجانب عنوان الموقع</li>
                <li>اختر "إعدادات الموقع" ثم غير إعداد الميكروفون إلى "السماح"</li>
                <li>أعد تحميل الصفحة وحاول مرة أخرى</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎤 المساعد الصوتي الذكي
            {isListening && (
              <Badge className="animate-pulse bg-red-500">
                جاري الاستماع...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Input */}
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={toggleListening}
              size="lg"
              className={`w-32 h-32 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {isListening ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>

            {transcript && (
              <div className="w-full">
                <Card className="bg-white border-2 border-purple-300">
                  <CardContent className="pt-6">
                    <p className="text-lg">{transcript}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {transcript && !processing && (
              <Button
                onClick={handleProcessCommand}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Send className="h-5 w-5 ml-2" />
                تنفيذ الأمر
              </Button>
            )}

            {processing && (
              <div className="flex items-center gap-2 text-purple-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>جاري التنفيذ...</span>
              </div>
            )}

            {command && !processing && (
              <Card className="w-full bg-green-50 border-2 border-green-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-green-800 mb-2">تم التنفيذ بنجاح!</h4>
                      <div className="space-y-1 text-sm">
                        {command.product && <p>المنتج: {command.product}</p>}
                        {command.quantity && <p>الكمية: {command.quantity}</p>}
                        {command.price && <p>السعر: {command.price} ريال</p>}
                        {command.customer && <p>الزبون: {command.customer}</p>}
                        {command.paymentType && <p>نوع الدفع: {command.paymentType}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* File Upload */}
          <div className="border-t-2 border-purple-200 pt-4">
            <h4 className="font-bold mb-3">📁 رفع ملفات وصور</h4>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                id="files-upload"
                className="hidden"
                accept="image/*,.pdf,.xlsx,.docx"
                multiple
                onChange={handleFileSelect}
              />
              <label htmlFor="files-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('files-upload')?.click()}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  اختر ملفات للرفع
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline">{(file.size / 1024).toFixed(0)} KB</Badge>
                    </div>
                  ))}
                  <Button
                    onClick={handleFileUpload}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري التحليل والحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 ml-2" />
                        تحليل وحفظ تلقائياً
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              أمثلة على الأوامر الصوتية:
            </h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• "سجل بيع طوفان 5 كيلو بـ 5000 ريال نقدي"</li>
              <li>• "سجل دَين على محمد حسين 3000 ريال طلب خاص"</li>
              <li>• "كم إجمالي مبيعات اليوم؟"</li>
              <li>• "اعرض ديون الزبائن"</li>
              <li>• "كم رصيد أحمد علي؟"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}