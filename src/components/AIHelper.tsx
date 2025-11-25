import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Lightbulb, Mic, Camera, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export function AIHelper() {
  const examples = [
    {
      category: 'تسجيل المبيعات',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      commands: [
        'سجل أحمد معه حبة طوفان بي 50 الف',
        'بيع محمد 3 حبات حسين بسعر 20000',
        'سجل علي نص حبة القحطاني بي 30 الف معلق',
      ]
    },
    {
      category: 'تسجيل الديون',
      icon: MessageSquare,
      color: 'from-red-500 to-rose-500',
      commands: [
        'دين على أحمد 50 الف ريال',
        'سجل دين على محمد بمبلغ 80000',
      ]
    },
    {
      category: 'الاستعلامات',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      commands: [
        'كم إجمالي المبيعات؟',
        'عرض مبيعات اليوم',
        'عرض الديون المعلقة',
      ]
    },
    {
      category: 'الأوامر الصوتية',
      icon: Mic,
      color: 'from-purple-500 to-pink-500',
      commands: [
        'اضغط زر الميكروفون 🎤',
        'تحدث بوضوح',
        'سيتم التعرف على صوتك تلقائياً',
      ]
    },
    {
      category: 'تحليل الصور',
      icon: Camera,
      color: 'from-orange-500 to-yellow-500',
      commands: [
        'اضغط زر الكاميرا 📷',
        'ارفع صورة دفتر مبيعات',
        'سيتم تحليل الصورة واستخراج البيانات',
      ]
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
          <Lightbulb className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">دليل المساعد الذكي</h3>
          <p className="text-sm text-muted-foreground">
            أمثلة على كيفية استخدام المساعد الذكي المتطور
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((example, index) => {
          const Icon = example.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${example.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-sm">{example.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {example.commands.map((cmd, i) => (
                      <li key={i} className="text-xs p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <code className="text-gray-700">{cmd}</code>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-purple-900 mb-2">💡 نصيحة ذهبية</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                المساعد الذكي متاح في <strong>جميع الصفحات</strong>! 
                فقط اضغط على الزر الدائري البنفسجي <span className="inline-block w-4 h-4 bg-purple-600 rounded-full"></span> أسفل اليسار، 
                واكتب أو تحدث بما تريد. المساعد يفهم سياق الصفحة الحالية ويقدم لك المساعدة المناسبة! 
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
