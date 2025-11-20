import { useState, useEffect } from 'react';
import { ClientBooking } from './components/ClientBooking';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Marketplace } from './components/Marketplace';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { LockKeyhole, ShoppingBag } from 'lucide-react';
import { adminStorage } from './utils/local-storage';

export default function App() {
  const [view, setView] = useState<'client' | 'admin' | 'marketplace'>('client');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const session = adminStorage.getSession();
      if (session?.token) {
        setAdminToken(session.token);
        setView('admin');
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setView('admin');
  };

  const handleLogout = () => {
    setAdminToken(null);
    setView('client');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (view === 'admin' && adminToken) {
    return (
      <>
        <AdminDashboard token={adminToken} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  if (view === 'admin') {
    return (
      <>
        <AdminLogin onLogin={handleAdminLogin} />
        <Toaster />
      </>
    );
  }

  if (view === 'marketplace') {
    return (
      <>
        <Marketplace onBack={() => setView('client')} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="absolute top-6 right-6 z-50 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setView('marketplace')}
            className="bg-zinc-800/80 backdrop-blur-sm border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-amber-500 shadow-lg transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Магазин
          </Button>
          <Button
            variant="outline"
            onClick={() => setView('admin')}
            className="bg-zinc-800/80 backdrop-blur-sm border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-amber-500 shadow-lg transition-all duration-300"
          >
            <LockKeyhole className="w-4 h-4 mr-2" />
            Админ-панель
          </Button>
        </div>
        <ClientBooking onMarketplace={() => setView('marketplace')} />
      </div>
      <Toaster />
    </>
  );
}