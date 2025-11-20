import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';

interface DateTimeSelectorProps {
  service: any;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}

export function DateTimeSelector({ service, onSelect, onBack }: DateTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadSlots = async (date: Date) => {
    try {
      setLoading(true);
      setSelectedTime('');
      const dateStr = date.toISOString().split('T')[0];
      const data = await api.getSlots(service.id, dateStr);
      setSlots(data.slots);
    } catch (err) {
      console.error('Failed to load slots:', err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      onSelect(dateStr, selectedTime);
    }
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2>Выберите дату и время</h2>
          <p className="text-sm text-gray-600">{service.name} ({service.duration_min} мин)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-4">Выберите дату</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today || date > maxDate;
            }}
            className="rounded-md border"
          />
        </div>

        <div>
          <h3 className="mb-4">Доступное время</h3>
          {!selectedDate && (
            <p className="text-gray-500 text-sm">Сначала выберите дату</p>
          )}
          {selectedDate && loading && (
            <p className="text-gray-500 text-sm">Загрузка доступных слотов...</p>
          )}
          {selectedDate && !loading && slots.length === 0 && (
            <p className="text-gray-500 text-sm">На выбранную дату нет доступных слотов</p>
          )}
          {selectedDate && !loading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {slots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? 'default' : 'outline'}
                  onClick={() => setSelectedTime(slot)}
                  className="w-full"
                >
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleContinue} size="lg">
            Продолжить
          </Button>
        </div>
      )}
    </div>
  );
}
