import { useState } from 'react';
import { motion } from 'motion/react';
import { BookingPathSelector } from './BookingPathSelector';
import { ServiceSelector } from './ServiceSelector';
import { MasterSelector } from './MasterSelector';
import { InteractiveTimeSelector } from './InteractiveTimeSelector';
import { BookingForm } from './BookingForm';
import { CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

type BookingPath = 'service' | 'master' | null;
type BookingStep = 'path' | 'service' | 'master' | 'time' | 'form';

interface ClientBookingProps {
  onMarketplace?: () => void;
}

export function ClientBooking({ onMarketplace }: ClientBookingProps) {
  const [bookingPath, setBookingPath] = useState<BookingPath>(null);
  const [step, setStep] = useState<BookingStep>('path');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedMaster, setSelectedMaster] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handlePathSelect = (path: BookingPath) => {
    setBookingPath(path);
    if (path === 'service') {
      setStep('service');
    } else {
      setStep('master');
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    if (bookingPath === 'service') {
      // After service, select master
      setStep('master');
    } else {
      // After master path, go to time
      setStep('time');
    }
  };

  const handleMasterSelect = (master: any) => {
    setSelectedMaster(master);
    if (bookingPath === 'master') {
      // After master, select service
      setStep('service');
    } else {
      // After service path, go to time
      setStep('time');
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep('form');
  };

  const handleBookingSubmit = () => {
    setBookingConfirmed(true);
  };

  const handleReset = () => {
    setBookingPath(null);
    setStep('path');
    setSelectedService(null);
    setSelectedMaster(null);
    setSelectedDate('');
    setSelectedTime('');
    setBookingConfirmed(false);
  };

  const handleBackFromService = () => {
    if (bookingPath === 'service') {
      setStep('path');
      setBookingPath(null);
    } else {
      setStep('master');
    }
  };

  const handleBackFromMaster = () => {
    if (bookingPath === 'master') {
      setStep('path');
      setBookingPath(null);
    } else {
      setStep('service');
    }
  };

  const handleBackFromTime = () => {
    if (bookingPath === 'service') {
      setStep('master');
    } else {
      setStep('service');
    }
  };

  const handleBackFromForm = () => {
    setStep('time');
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-amber-500" />
            </motion.div>
          </div>
          <h2 className="text-3xl text-white mb-4">Заявка отправлена!</h2>
          <p className="text-zinc-400 mb-8">
            Спасибо за вашу заявку. Мы свяжемся с вами в ближайшее время для подтверждения записи.
          </p>
          <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-6 mb-8 text-left">
            <div className="mb-4">
              <p className="text-zinc-500 text-sm mb-1">Услуга:</p>
              <p className="text-white">{selectedService?.name}</p>
            </div>
            {selectedMaster && (
              <div className="mb-4">
                <p className="text-zinc-500 text-sm mb-1">Мастер:</p>
                <p className="text-white">{selectedMaster.name}</p>
              </div>
            )}
            <div>
              <p className="text-zinc-500 text-sm mb-1">Дата и время:</p>
              <p className="text-amber-500">
                {new Date(selectedDate).toLocaleDateString('ru-RU')} в {selectedTime}
              </p>
            </div>
          </div>
          <Button
            onClick={handleReset}
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 py-6 rounded-xl"
          >
            Создать новую запись
          </Button>
        </motion.div>
      </div>
    );
  }

  if (step === 'path') {
    return (
      <>
        <BookingPathSelector onSelectPath={handlePathSelect} onMarketplace={onMarketplace} />
        <footer className="fixed bottom-0 left-0 right-0 py-4 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
          </div>
        </footer>
      </>
    );
  }

  if (step === 'service') {
    return (
      <>
        <ServiceSelector
          onSelect={handleServiceSelect}
          onBack={handleBackFromService}
        />
        <footer className="fixed bottom-0 left-0 right-0 py-4 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
          </div>
        </footer>
      </>
    );
  }

  if (step === 'master') {
    return (
      <>
        <MasterSelector
          onSelect={handleMasterSelect}
          onBack={handleBackFromMaster}
        />
        <footer className="fixed bottom-0 left-0 right-0 py-4 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
          </div>
        </footer>
      </>
    );
  }

  if (step === 'time' && selectedService) {
    return (
      <>
        <InteractiveTimeSelector
          service={selectedService}
          master={selectedMaster}
          onSelect={handleDateTimeSelect}
          onBack={handleBackFromTime}
        />
        <footer className="fixed bottom-0 left-0 right-0 py-4 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
          </div>
        </footer>
      </>
    );
  }

  if (step === 'form') {
    return (
      <>
        <BookingForm
          service={selectedService}
          date={selectedDate}
          time={selectedTime}
          onSubmit={handleBookingSubmit}
          onBack={handleBackFromForm}
        />
        <footer className="fixed bottom-0 left-0 right-0 py-4 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
          </div>
        </footer>
      </>
    );
  }

  return null;
}