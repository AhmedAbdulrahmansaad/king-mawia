import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader } from './ui/card';
import { Loader2 } from 'lucide-react';

// Table Loading Skeleton
export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" dir="rtl">
      {/* Table Header */}
      <div className="flex gap-4 p-4 bg-gray-100 rounded-lg">
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border animate-pulse">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

// Card Loading Skeleton
export function CardLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// List Loading Skeleton
export function ListLoadingSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3" dir="rtl">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border animate-pulse">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Full Page Loading
export function PageLoading({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4" dir="rtl">
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-xl">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      </div>
      <p className="text-lg text-green-700 animate-pulse">{message}</p>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

// Inline Loading (for buttons, etc.)
export function InlineLoading({ text = 'جاري المعالجة...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-green-600" dir="rtl">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}

// Empty State
export function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center" dir="rtl">
      <div className="p-6 bg-gray-100 rounded-full">
        <Icon className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="text-xl text-gray-700">{title}</h3>
      {description && <p className="text-gray-500">{description}</p>}
    </div>
  );
}

// Success State
export function SuccessState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4" dir="rtl">
      <div className="p-4 bg-green-100 rounded-full">
        <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-xl text-green-700">{message}</p>
    </div>
  );
}

// Error State
export function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center" dir="rtl">
      <div className="p-6 bg-red-100 rounded-full">
        <svg className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="text-xl text-red-700">حدث خطأ</h3>
      <p className="text-gray-600 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
