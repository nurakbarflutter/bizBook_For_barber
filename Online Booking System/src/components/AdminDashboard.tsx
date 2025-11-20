import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AdminBookings } from './AdminBookings';
import { AdminServices } from './AdminServices';
import { AdminSchedule } from './AdminSchedule';
import { AdminStats } from './AdminStats';
import { AdminBlackouts } from './AdminBlackouts';
import { AdminMarketplace } from './AdminMarketplace';
import { AdminMasters } from './AdminMasters';
import { AdminFinance } from './AdminFinance';
import { QuickSetup } from './QuickSetup';
import { LogOut, Calendar, Briefcase, Clock, BarChart3, XCircle, ShoppingBag, Users, Wallet } from 'lucide-react';
import { adminStorage } from '../utils/local-storage';
import { api } from '../utils/api';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('bookings');
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [checkingServices, setCheckingServices] = useState(true);

  useEffect(() => {
    checkIfServicesExist();
  }, []);

  const checkIfServicesExist = async () => {
    try {
      const data = await api.adminGetServices(token);
      if (!data.services || data.services.length === 0) {
        setShowQuickSetup(true);
      }
    } catch (err) {
      console.error('Failed to check services:', err);
    } finally {
      setCheckingServices(false);
    }
  };

  const handleLogout = () => {
    adminStorage.logout();
    onLogout();
  };

  const handleQuickSetupComplete = () => {
    setShowQuickSetup(false);
    setActiveTab('services');
  };

  const handleQuickSetupSkip = () => {
    setShowQuickSetup(false);
  };

  if (checkingServices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (showQuickSetup) {
    return (
      <QuickSetup
        token={token}
        onComplete={handleQuickSetupComplete}
        onSkip={handleQuickSetupSkip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-white mb-1">BizBook — Админ-панель</h1>
              <p className="text-sm text-zinc-400">Управление записями и услугами</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:grid-cols-8 md:grid-cols-4 grid-cols-2 max-w-6xl bg-zinc-800/50 border border-zinc-700">
            <TabsTrigger 
              value="bookings" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Записи</span>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Услуги</span>
            </TabsTrigger>
            <TabsTrigger 
              value="masters" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Мастера</span>
            </TabsTrigger>
            <TabsTrigger 
              value="finance" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Финансы</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Расписание</span>
            </TabsTrigger>
            <TabsTrigger 
              value="blackouts" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Блокировки</span>
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Маркетплейс</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Статистика</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <AdminBookings token={token} />
          </TabsContent>

          <TabsContent value="services">
            <AdminServices token={token} />
          </TabsContent>

          <TabsContent value="masters">
            <AdminMasters token={token} />
          </TabsContent>

          <TabsContent value="finance">
            <AdminFinance token={token} />
          </TabsContent>

          <TabsContent value="schedule">
            <AdminSchedule token={token} />
          </TabsContent>

          <TabsContent value="blackouts">
            <AdminBlackouts token={token} />
          </TabsContent>

          <TabsContent value="marketplace">
            <AdminMarketplace token={token} />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats token={token} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">Made in <span className="text-amber-500">BizBook</span></p>
        </div>
      </footer>
    </div>
  );
}