import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar, Phone, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AdminBookingsProps {
  token: string;
}

export function AdminBookings({ token }: AdminBookingsProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [action, setAction] = useState<'confirm' | 'cancel'>('confirm');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsData, servicesData] = await Promise.all([
        api.getBookings(token, filter === 'all' ? {} : { status: filter }),
        api.adminGetServices(token)
      ]);
      setBookings(bookingsData.bookings);
      setServices(servicesData.services);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Неизвестная услуга';
  };

  const handleAction = async () => {
    if (!selectedBooking) return;

    try {
      await api.updateBooking(token, selectedBooking.id, {
        status: action === 'confirm' ? 'confirmed' : 'cancelled',
        cancel_reason: action === 'cancel' ? cancelReason : undefined
      });
      setActionDialog(false);
      setSelectedBooking(null);
      setCancelReason('');
      loadData();
    } catch (err) {
      console.error('Failed to update booking:', err);
    }
  };

  const openActionDialog = (booking: any, actionType: 'confirm' | 'cancel') => {
    setSelectedBooking(booking);
    setAction(actionType);
    setActionDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: AlertCircle, label: 'Ожидает' },
      confirmed: { variant: 'default', icon: CheckCircle, label: 'Подтверждено' },
      cancelled: { variant: 'destructive', icon: XCircle, label: 'Отменено' }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка записей...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl">Записи клиентов</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
            <SelectItem value="all">Все записи</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
            <SelectItem value="confirmed">Подтверждённые</SelectItem>
            <SelectItem value="cancelled">Отменённые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {bookings.length === 0 ? (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="py-12">
            <p className="text-center text-zinc-400">Нет записей для отображения</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const bookingDate = new Date(booking.date + 'T' + booking.time);
            return (
              <Card key={booking.id} className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">{getServiceName(booking.service_id)}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {bookingDate.toLocaleDateString('ru-RU')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <User className="w-4 h-4 text-zinc-500" />
                      <span>{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone className="w-4 h-4 text-zinc-500" />
                      <span>{booking.phone}</span>
                    </div>
                    {booking.note && (
                      <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3 text-sm">
                        <p className="text-zinc-400 mb-1">Комментарий:</p>
                        <p className="text-white">{booking.note}</p>
                      </div>
                    )}
                    {booking.cancel_reason && (
                      <div className="bg-red-500/10 border border-red-500/50 rounded p-3 text-sm">
                        <p className="text-red-400 mb-1">Причина отмены:</p>
                        <p className="text-red-300">{booking.cancel_reason}</p>
                      </div>
                    )}
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openActionDialog(booking, 'confirm')}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-900"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Подтвердить
                      </Button>
                      <Button
                        onClick={() => openActionDialog(booking, 'cancel')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Отменить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'confirm' ? 'Подтвердить запись?' : 'Отменить запись?'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded p-4">
                <p className="text-sm text-zinc-400 mb-1">Клиент:</p>
                <p className="text-white mb-2">{selectedBooking.customer_name}</p>
                <p className="text-sm text-zinc-400 mb-1">Услуга:</p>
                <p className="text-white">{getServiceName(selectedBooking.service_id)}</p>
              </div>

              {action === 'cancel' && (
                <div>
                  <Label htmlFor="cancel-reason" className="text-zinc-300">Причина отмены (необязательно)</Label>
                  <Textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Укажите причину отмены..."
                    rows={3}
                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog(false)}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleAction}
              variant={action === 'confirm' ? 'default' : 'destructive'}
              className={action === 'confirm' ? 'bg-amber-500 hover:bg-amber-600 text-zinc-900' : ''}
            >
              {action === 'confirm' ? 'Подтвердить' : 'Отменить запись'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}