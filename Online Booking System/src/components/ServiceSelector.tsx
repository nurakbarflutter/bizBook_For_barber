import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../utils/api';
import { Clock, Scissors, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface ServiceSelectorProps {
  onSelect: (service: any) => void;
  onBack?: () => void;
}

export function ServiceSelector({ onSelect, onBack }: ServiceSelectorProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data.services || []);
    } catch (err: any) {
      console.error('Failed to load services:', err);
      setError(err.message || 'Не удалось загрузить услуги');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (service: any) => {
    setSelectedId(service.id);
    setTimeout(() => {
      onSelect(service);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Загрузка услуг...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center text-zinc-400">
          Услуги пока не добавлены. Пожалуйста, вернитесь позже.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {onBack && (
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-zinc-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl text-white mb-3">Выберите услугу</h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-amber-500" />
            <p className="text-amber-500 tracking-wider uppercase text-sm">Наши услуги</p>
            <div className="h-px w-12 bg-amber-500" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(service)}
              className={`
                group relative bg-zinc-800/50 backdrop-blur-sm border rounded-2xl p-6 text-left overflow-hidden transition-all duration-300
                ${selectedId === service.id
                  ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'border-zinc-700/50 hover:border-amber-500/50'
                }
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300">
                    <Scissors className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-white">{service.price} с</div>
                  </div>
                </div>

                <h3 className="text-xl text-white mb-3">{service.name}</h3>
                
                {service.description && (
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center text-zinc-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{service.duration_min} минут</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}