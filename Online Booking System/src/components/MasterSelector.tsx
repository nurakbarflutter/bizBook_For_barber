import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Award, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { fetchMasters } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Master {
  id: string;
  name: string;
  specialty?: string;
  rating?: number;
  experience?: string;
}

interface MasterSelectorProps {
  onSelect: (master: Master) => void;
  onBack: () => void;
}

export function MasterSelector({ onSelect, onBack }: MasterSelectorProps) {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const data = await fetchMasters();
      setMasters(data || []);
    } catch (error) {
      console.error('Error loading masters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (master: Master) => {
    setSelectedId(master.id);
    setTimeout(() => {
      onSelect(master);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Загрузка мастеров...</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-4xl text-white mb-3">Выберите мастера</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <p className="text-amber-500 tracking-wider uppercase text-sm">Наша команда профессионалов</p>
              <div className="h-px w-12 bg-amber-500" />
            </div>
          </motion.div>
        </div>

        {masters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-zinc-400 mb-4">Мастера пока не добавлены</p>
            <p className="text-zinc-500 text-sm">Администратор может добавить мастеров в панели управления</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {masters.map((master, index) => (
                <motion.div
                  key={master.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  <button
                    onClick={() => handleSelect(master)}
                    className={`w-full bg-zinc-800/50 backdrop-blur-sm border rounded-2xl overflow-hidden text-left transition-all duration-300 ${
                      selectedId === master.id
                        ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'border-zinc-700/50 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Master Image */}
                    <div className="relative h-64 overflow-hidden bg-zinc-900">
                      <ImageWithFallback
                        src={`https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=600&fit=crop&q=80`}
                        alt={master.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                      
                      {/* Award Badge */}
                      {master.rating && master.rating >= 4.5 && (
                        <div className="absolute top-4 right-4 bg-amber-500 text-zinc-900 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                          <Award className="w-4 h-4" />
                          <span>TOP</span>
                        </div>
                      )}
                    </div>

                    {/* Master Info */}
                    <div className="p-6">
                      <h3 className="text-xl text-white mb-2">{master.name}</h3>
                      
                      {master.specialty && (
                        <p className="text-amber-500 text-sm mb-3">{master.specialty}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {master.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-white">{master.rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {master.experience && (
                          <span className="text-zinc-400 text-sm">{master.experience}</span>
                        )}
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 border-2 border-amber-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
