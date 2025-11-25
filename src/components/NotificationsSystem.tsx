import { useEffect, useState } from 'react';
import { Bell, X, AlertCircle, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { getDebts } from '../utils/api';

interface Notification {
  id: string;
  type: 'debt' | 'payment' | 'milestone' | 'warning';
  title: string;
  message: string;
  amount?: number;
  customerName?: string;
  daysOverdue?: number;
  createdAt: Date;
  read: boolean;
}

interface NotificationsSystemProps {
  user: any;
}

export function NotificationsSystem({ user }: NotificationsSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkForNotifications();
    
    // Check for new notifications every 5 minutes
    const interval = setInterval(checkForNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  async function checkForNotifications() {
    try {
      const { debts } = await getDebts();
      
      // Check for overdue debts
      const overdueDebts = debts.filter((debt: any) => {
        if (debt.status === 'paid') return false;
        
        if (debt.dueDate) {
          const dueDate = new Date(debt.dueDate);
          const today = new Date();
          return dueDate < today;
        }
        
        // Check if debt is older than 30 days
        const createdDate = new Date(debt.createdAt);
        const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 30;
      });

      // Create notifications for overdue debts
      const newNotifications: Notification[] = overdueDebts.map((debt: any) => {
        const createdDate = new Date(debt.createdAt);
        const daysOverdue = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: `debt-${debt.id}`,
          type: 'debt',
          title: 'دين متأخر',
          message: `العميل ${debt.customerName} لديه دين متأخر`,
          amount: debt.remainingAmount || debt.amount,
          customerName: debt.customerName,
          daysOverdue,
          createdAt: new Date(),
          read: false,
        };
      });

      // Check for high-value sales today
      const today = new Date().toISOString().split('T')[0];
      // This would be from getSales() but we'll keep it simple

      // Add milestone notifications
      if (debts.length > 0) {
        const totalDebts = debts.reduce((sum: number, debt: any) => 
          sum + (debt.remainingAmount || debt.amount || 0), 0
        );

        if (totalDebts > 100000) {
          newNotifications.push({
            id: 'milestone-high-debts',
            type: 'warning',
            title: 'تنبيه: ديون عالية',
            message: `إجمالي الديون: ${totalDebts.toLocaleString('ar-YE')} ريال`,
            amount: totalDebts,
            createdAt: new Date(),
            read: false,
          });
        }
      }

      // Merge with existing notifications (avoid duplicates)
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const trulyNew = newNotifications.filter(n => !existingIds.has(n.id));
        
        // Show toast for new notifications
        if (trulyNew.length > 0) {
          toast.warning(`لديك ${trulyNew.length} إشعار جديد`, {
            description: 'افتح لوحة الإشعارات للتفاصيل',
          });
        }
        
        return [...trulyNew, ...prev];
      });
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  function markAsRead(id: string) {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function deleteNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function getNotificationIcon(type: Notification['type']) {
    switch (type) {
      case 'debt':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'milestone':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <Calendar className="h-5 w-5 text-orange-500" />;
    }
  }

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPanel(!showPanel)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h2 className="text-lg font-bold">الإشعارات</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPanel(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-white text-xs hover:bg-white/20"
                  >
                    وضع علامة مقروء على الكل
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد إشعارات</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          notification.read
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200 shadow-sm'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  {notification.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              {notification.amount && (
                                <p className="text-sm font-bold text-red-600">
                                  {notification.amount.toLocaleString('ar-YE')} ريال
                                </p>
                              )}
                              {notification.daysOverdue && (
                                <p className="text-xs text-orange-600 mt-1">
                                  متأخر {notification.daysOverdue} يوم
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.createdAt.toLocaleTimeString('ar-YE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
