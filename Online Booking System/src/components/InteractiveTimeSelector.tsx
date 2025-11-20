import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../utils/api';
import { generateMockTimeSlots } from '../utils/mock-data';

interface InteractiveTimeSelectorProps {
  service: any;
  master?: any;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}

export function InteractiveTimeSelector({
  service,
  master,
  onSelect,
  onBack
}: InteractiveTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    if (selectedDate) {
      loadSlots();
    }
  }, [selectedDate]);

  const loadSlots = async () => {
    if (!selectedDate || !service) return;
    
    setLoadingSlots(true);
    setSelectedTime(null);
    setUsingMockData(false);
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await Promise.race([
        api.getSlots(service.id, dateStr),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      // Handle different response formats
      let slots = [];
      if (Array.isArray(response)) {
        slots = response;
      } else if (response && typeof response === 'object') {
        // Try common property names
        slots = response.slots || response.times || response.available || [];
      }
      
      // If no slots from API, use mock data for demonstration
      if (!Array.isArray(slots) || slots.length === 0) {
        console.warn('No slots from API, using mock data for demonstration');
        slots = generateMockTimeSlots(selectedDate);
        setUsingMockData(true);
      }
      
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error: any) {
      console.error('Error loading slots:', error);
      // Use mock data as fallback
      console.warn('Using mock slots due to error');
      const mockSlots = generateMockTimeSlots(selectedDate);
      setAvailableSlots(mockSlots);
      setUsingMockData(true);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      onSelect(dateStr, selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
            <h2 className="text-4xl text-white mb-3">Выберите дату и время</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <p className="text-amber-500 tracking-wider uppercase text-sm">
                {service?.name}
                {master && ` • ${master.name}`}
              </p>
              <div className="h-px w-12 bg-amber-500" />
            </div>
            
            {usingMockData && (
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2 text-sm text-blue-400">
                <AlertCircle className="w-4 h-4" />
                <span>Демо-режим: показаны примерные слоты времени</span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Date Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl text-white">Выберите дату</h3>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dates.map((date, index) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isTodayDate = isToday(date);
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      relative aspect-square rounded-xl p-2 transition-all duration-300
                      ${isSelected
                        ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30'
                        : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-700/50'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-xs opacity-70 mb-1">
                        {getDayName(date)}
                      </span>
                      <span className={isSelected ? 'font-bold' : ''}>
                        {date.getDate()}
                      </span>
                    </div>
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Time Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl text-white">Выберите время</h3>
            </div>

            {!selectedDate ? (
              <div className="flex items-center justify-center h-64 text-zinc-500">
                Сначала выберите дату
              </div>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <Clock className="w-12 h-12 text-zinc-600 mb-3" />
                <p className="text-zinc-500 mb-2">На эту дату пока нет расписания</p>
                <p className="text-zinc-600 text-sm">Администратор должен настроить рабочие часы</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Morning */}
                <div>
                  <p className="text-zinc-400 text-sm mb-2">Утро</p>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots
                      .filter(slot => {
                        const hour = parseInt(slot.split(':')[0]);
                        return hour >= 9 && hour < 12;
                      })
                      .map((slot, index) => (
                        <TimeSlotButton
                          key={slot}
                          time={slot}
                          isSelected={selectedTime === slot}
                          onClick={() => handleTimeSelect(slot)}
                          delay={index * 0.03}
                        />
                      ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div>
                  <p className="text-zinc-400 text-sm mb-2">День</p>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots
                      .filter(slot => {
                        const hour = parseInt(slot.split(':')[0]);
                        return hour >= 12 && hour < 17;
                      })
                      .map((slot, index) => (
                        <TimeSlotButton
                          key={slot}
                          time={slot}
                          isSelected={selectedTime === slot}
                          onClick={() => handleTimeSelect(slot)}
                          delay={index * 0.03}
                        />
                      ))}
                  </div>
                </div>

                {/* Evening */}
                <div>
                  <p className="text-zinc-400 text-sm mb-2">Вечер</p>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots
                      .filter(slot => {
                        const hour = parseInt(slot.split(':')[0]);
                        return hour >= 17;
                      })
                      .map((slot, index) => (
                        <TimeSlotButton
                          key={slot}
                          time={slot}
                          isSelected={selectedTime === slot}
                          onClick={() => handleTimeSelect(slot)}
                          delay={index * 0.03}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Confirm Button */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 text-center"
            >
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 mb-4 inline-block">
                <p className="text-zinc-400 text-sm mb-2">Вы выбрали:</p>
                <p className="text-white text-xl">
                  {selectedDate.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long',
                    weekday: 'long'
                  })}
                  {' в '}
                  {selectedTime}
                </p>
              </div>
              
              <Button
                onClick={handleConfirm}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-900 px-8 py-6 text-lg rounded-xl"
              >
                Продолжить к оформлению
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TimeSlotButton({
  time,
  isSelected,
  onClick,
  delay
}: {
  time: string;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        py-3 px-2 rounded-lg transition-all duration-300
        ${isSelected
          ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30'
          : 'bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900 hover:text-white border border-zinc-700/50'
        }
      `}
    >
      {time}
    </motion.button>
  );
}
