import { Scissors, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface BookingPathSelectorProps {
  onSelectPath: (path: 'service' | 'master') => void;
  onMarketplace?: () => void;
}

export function BookingPathSelector({ onSelectPath, onMarketplace }: BookingPathSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl text-white mb-4">BarberTime</h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-amber-500" />
            <p className="text-amber-500 tracking-wider uppercase text-sm">Premium Barbershop</p>
            <div className="h-px w-12 bg-amber-500" />
          </div>
          <p className="text-zinc-400 text-lg">Выберите способ бронирования</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Service Path */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPath('service')}
            className="group relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8 md:p-12 text-left overflow-hidden hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors duration-300">
                <Scissors className="w-8 h-8 text-amber-500" />
              </div>
              
              <h3 className="text-2xl md:text-3xl text-white mb-3">Выбрать услугу</h3>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Начните с выбора нужной услуги, а затем выберите свободного мастера и удобное время
              </p>
              
              <div className="flex items-center text-amber-500 group-hover:translate-x-2 transition-transform duration-300">
                <span className="mr-2">Выбрать услугу</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Master Path */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPath('master')}
            className="group relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8 md:p-12 text-left overflow-hidden hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors duration-300">
                <Users className="w-8 h-8 text-amber-500" />
              </div>
              
              <h3 className="text-2xl md:text-3xl text-white mb-3">Выбрать мастера</h3>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Выберите любимого мастера, затем определитесь с услугой и найдите свободное время
              </p>
              
              <div className="flex items-center text-amber-500 group-hover:translate-x-2 transition-transform duration-300">
                <span className="mr-2">Выбрать мастера</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 space-y-6"
        >
          <p className="text-zinc-500 text-sm">
            Без регистрации • Быстрое бронирование • Мгновенное подтверждение
          </p>
          
          {onMarketplace && (
            <div>
              <div className="h-px w-full bg-zinc-800 mb-6" />
              <button
                onClick={onMarketplace}
                className="group inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Перейти в магазин косметики</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
