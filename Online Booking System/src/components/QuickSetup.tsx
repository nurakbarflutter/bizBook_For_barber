import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, CheckCircle2, Scissors, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { seedServices } from '../utils/seed-services';
import { BARBERSHOP_SERVICES } from '../utils/mock-data';
import { toast } from 'sonner@2.0.3';

interface QuickSetupProps {
  token: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function QuickSetup({ token, onComplete, onSkip }: QuickSetupProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleQuickSetup = async () => {
    try {
      setLoading(true);
      const results = await seedServices(token);
      
      if (results.success.length > 0) {
        toast.success(`Успешно добавлено услуг: ${results.success.length}`);
        setCompleted(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
      
      if (results.errors.length > 0) {
        toast.error(`Ошибок при добавлении: ${results.errors.length}`);
        console.error('Setup errors:', results.errors);
      }
    } catch (err) {
      console.error('Failed to setup:', err);
      toast.error('Не удалось добавить услуги');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl w-full"
      >
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Zap className="w-10 h-10 text-zinc-900" />
            </motion.div>
            <CardTitle className="text-3xl text-white mb-2">
              Быстрая настройка барбершопа
            </CardTitle>
            <p className="text-zinc-400">
              Добавьте все стандартные услуги одним кликом
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {!completed ? (
              <>
                <div className="bg-zinc-900/50 rounded-xl p-6 space-y-4">
                  <h3 className="text-white flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-amber-500" />
                    Будет добавлено {BARBERSHOP_SERVICES.length} услуг:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {BARBERSHOP_SERVICES.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white text-sm">{service.name}</h4>
                          <span className="text-amber-500 text-sm">{service.price} с</span>
                        </div>
                        <p className="text-zinc-500 text-xs mb-2 line-clamp-1">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.duration_min} мин
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleQuickSetup}
                    disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-900 h-14"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-900 mr-2" />
                        Добавление услуг...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Добавить все услуги
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-zinc-400 hover:text-white"
                  >
                    Пропустить, я добавлю позже
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h3 className="text-2xl text-white mb-2">Готово!</h3>
                <p className="text-zinc-400">
                  Все услуги успешно добавлены. Перенаправление...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}