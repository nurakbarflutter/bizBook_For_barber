import { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, User, Phone, MessageSquare } from 'lucide-react';

interface BookingFormProps {
  service: any;
  date: string;
  time: string;
  onSubmit: () => void;
  onBack: () => void;
}

export function BookingForm({ service, date, time, onSubmit, onBack }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phone validation and formatting
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format as +996(XXX)-XX-XX-XX
    if (digitsOnly.length === 0) return '';
    if (digitsOnly.length <= 3) return `+996`;
    if (digitsOnly.length <= 6) return `+996(${digitsOnly.slice(3)})`;
    if (digitsOnly.length <= 8) return `+996(${digitsOnly.slice(3, 6)})-${digitsOnly.slice(6)}`;
    if (digitsOnly.length <= 10) return `+996(${digitsOnly.slice(3, 6)})-${digitsOnly.slice(6, 8)}-${digitsOnly.slice(8)}`;
    return `+996(${digitsOnly.slice(3, 6)})-${digitsOnly.slice(6, 8)}-${digitsOnly.slice(8, 10)}-${digitsOnly.slice(10, 12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it's a valid Kyrgyz phone number (12 digits starting with 996)
    return digitsOnly.length === 12 && digitsOnly.startsWith('996');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      setError('Пожалуйста, заполните обязательные поля');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await api.createBooking({
        service_id: service.id,
        date,
        time,
        customer_name: name.trim(),
        phone: phone.trim(),
        note: note.trim()
      });

      onSubmit();
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Не удалось создать запись. Попробуйте другое время.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl text-white mb-3">Контактные данные</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <p className="text-amber-500 tracking-wider uppercase text-sm">Последний шаг</p>
              <div className="h-px w-12 bg-amber-500" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 mb-8"
        >
          <p className="text-zinc-400 text-sm mb-3">Выбранная услуга:</p>
          <p className="text-white text-lg mb-3">{service.name}</p>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-zinc-700" />
          </div>
          <p className="text-amber-500 mt-3">
            {new Date(date).toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} в {time}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-zinc-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Ваше имя *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                required
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-zinc-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Телефон *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+996(XXX)-XX-XX-XX"
                required
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>

            <div>
              <Label htmlFor="note" className="text-zinc-300 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Комментарий (необязательно)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Дополнительные пожелания или информация"
                rows={3}
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 py-6 text-lg rounded-xl"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}