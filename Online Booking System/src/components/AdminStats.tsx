import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AdminStatsProps {
  token: string;
}

export function AdminStats({ token }: AdminStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get stats for last 30 days
      const from = new Date();
      from.setDate(from.getDate() - 30);
      
      const data = await api.getStats(token, {
        from: from.toISOString().split('T')[0]
      });
      
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка статистики...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Нет данных для отображения</div>;
  }

  // Prepare chart data
  const chartData = Object.entries(stats.byDay || {})
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      Записи: count
    }))
    .slice(-14); // Last 14 days

  return (
    <div className="space-y-6">
      <h2>Статистика записей</h2>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Всего записей</CardTitle>
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Подтверждено</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.confirmed}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% от всех
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Ожидает</CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">
              Требуют подтверждения
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Отменено</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.cancelled}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0}% от всех
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Популярные услуги
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topServices && stats.topServices.length > 0 ? (
            <div className="space-y-4">
              {stats.topServices.map((service: any, index: number) => (
                <div key={service.service_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                      {index + 1}
                    </div>
                    <span>{service.service_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden w-24">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${(service.count / stats.topServices[0].count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {service.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Нет данных</p>
          )}
        </CardContent>
      </Card>

      {/* Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Записи за последние 14 дней</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Записи" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">Нет данных для отображения</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
