import { useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LockKeyhole } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await api.login(email, password);
      
      if (response.access_token) {
        onLogin(response.access_token);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await api.signup(email, password, name);
      
      if (response.access_token) {
        onLogin(response.access_token);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <LockKeyhole className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <h1 className="text-center mb-2 text-white">Панель администратора</h1>
        <p className="text-center text-zinc-400 mb-8">BizBook Management</p>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-800/50 border border-zinc-700">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              Вход
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-900 text-zinc-400"
            >
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-zinc-300">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="text-zinc-300">Пароль</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900" 
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className="text-zinc-300">Имя</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="signup-email" className="text-zinc-300">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="signup-password" className="text-zinc-300">Пароль</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900" 
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}