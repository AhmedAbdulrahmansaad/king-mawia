import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { MessageCircle, Send, FileText, Download, User, DollarSign, Receipt } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface WhatsAppIntegrationProps {
  customerName?: string;
  customerPhone?: string;
  message?: string;
  type?: 'invoice' | 'reminder' | 'statement' | 'custom';
}

export function WhatsAppIntegration({
  customerName = '',
  customerPhone = '',
  message = '',
  type = 'custom',
}: WhatsAppIntegrationProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: customerPhone,
    name: customerName,
    message: message || getDefaultMessage(type, customerName),
  });

  function getDefaultMessage(type: string, name: string) {
    const templates = {
      invoice: `السلام عليكم ${name || 'عزيزي العميل'},\n\nنشكرك على تعاملك مع ملك الماوية.\nإليك فاتورة المشتريات الخاصة بك.\n\nمع تحياتنا،\nفريق ملك الماوية`,
      reminder: `السلام عليكم ${name || 'عزيزي العميل'},\n\nتذكير ودي بالمبلغ المستحق عليك.\nنرجو منك التواصل معنا لترتيب الدفع.\n\nشكراً لتفهمك،\nملك الماوية`,
      statement: `السلام عليكم ${name || 'عزيزي العميل'},\n\nإليك كشف حساب معاملاتك معنا.\nإذا كان لديك أي استفسار، نرجو التواصل.\n\nمع تحياتنا،\nملك الماوية`,
      custom: `السلام عليكم ${name || 'عزيزي العميل'},\n\n`,
    };
    return templates[type as keyof typeof templates] || templates.custom;
  }

  function formatPhoneNumber(phone: string) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add Yemen country code if not present
    if (!cleaned.startsWith('967')) {
      if (cleaned.startsWith('0')) {
        cleaned = '967' + cleaned.slice(1);
      } else {
        cleaned = '967' + cleaned;
      }
    }
    
    return cleaned;
  }

  function sendWhatsApp() {
    if (!formData.phone) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }

    if (!formData.message) {
      toast.error('الرجاء إدخال الرسالة');
      return;
    }

    const formattedPhone = formatPhoneNumber(formData.phone);
    const encodedMessage = encodeURIComponent(formData.message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
    
    toast.success('تم فتح واتساب');
    setDialogOpen(false);
  }

  function sendToMultiple(phones: string[], customMessage?: string) {
    if (phones.length === 0) {
      toast.error('لا توجد أرقام للإرسال');
      return;
    }

    const messageToSend = customMessage || formData.message;
    const encodedMessage = encodeURIComponent(messageToSend);

    phones.forEach((phone, index) => {
      setTimeout(() => {
        const formattedPhone = formatPhoneNumber(phone);
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      }, index * 1000); // Delay 1 second between each
    });

    toast.success(`سيتم إرسال ${phones.length} رسالة`);
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
          >
            <MessageCircle className="h-4 w-4 ml-2" />
            إرسال عبر واتساب
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              إرسال رسالة واتساب
            </DialogTitle>
            <DialogDescription>
              إرسال الرسالة عبر واتساب إلى الأرقام المحددة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="مثال: 771234567 أو 00967771234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                سيتم إضافة كود الدولة (967+) تلقائياً إذا لم يكن موجوداً
              </p>
            </div>

            <div>
              <Label htmlFor="name">اسم العميل (اختياري)</Label>
              <Input
                id="name"
                placeholder="اسم العميل"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                rows={8}
                placeholder="اكتب رسالتك هنا..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Quick Templates */}
            <div className="border-t pt-3">
              <Label className="text-xs text-gray-500 mb-2 block">قوالب سريعة:</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      message: getDefaultMessage('invoice', formData.name),
                    })
                  }
                >
                  <FileText className="h-3 w-3 ml-1" />
                  فاتورة
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      message: getDefaultMessage('reminder', formData.name),
                    })
                  }
                >
                  <DollarSign className="h-3 w-3 ml-1" />
                  تذكير دفع
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      message: getDefaultMessage('statement', formData.name),
                    })
                  }
                >
                  <Receipt className="h-3 w-3 ml-1" />
                  كشف حساب
                </Button>
              </div>
            </div>

            <Button onClick={sendWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 ml-2" />
              إرسال عبر واتساب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick send button component for use in tables/lists
export function QuickWhatsAppButton({
  phone,
  customerName,
  message,
}: {
  phone: string;
  customerName?: string;
  message?: string;
}) {
  function quickSend() {
    if (!phone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }

    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.startsWith('967') ? formattedPhone : '967' + formattedPhone;
    
    const defaultMessage = message || `السلام عليكم ${customerName || 'عزيزي العميل'},\n\nتواصل معك فريق ملك الماوية`;
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    toast.success('تم فتح واتساب');
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={quickSend}
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
}