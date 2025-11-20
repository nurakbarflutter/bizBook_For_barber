import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, TrendingUp, TrendingDown, Wallet, Edit2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/api';
import { projectId } from '../utils/supabase/info';

interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, { income: number; expense: number }>;
}

interface AdminFinanceProps {
  token: string;
}

const INCOME_CATEGORIES = [
  'Услуги',
  'Товары',
  'Чаевые',
  'Прочее',
];

const EXPENSE_CATEGORIES = [
  'Аренда',
  'Зарплата',
  'Коммунальные услуги',
  'Закупка товаров',
  'Инструменты',
  'Реклама',
  'Прочее',
];

export function AdminFinance({ token }: AdminFinanceProps) {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadRecords();
      loadSummary();
    }
  }, [dateFrom, dateTo, filterType]);

  const loadRecords = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9af35e1f/admin/finance?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось загрузить записи');
      }

      const data = await response.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Не удалось загрузить финансовые записи');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9af35e1f/admin/finance/summary?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось загрузить сводку');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.date) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const url = editingRecord
        ? `https://${projectId}.supabase.co/functions/v1/make-server-9af35e1f/admin/finance/${editingRecord.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-9af35e1f/admin/finance`;

      const response = await fetch(url, {
        method: editingRecord ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить запись');
      }

      toast.success(editingRecord ? 'Запись обновлена' : 'Запись добавлена');
      setShowDialog(false);
      resetForm();
      loadRecords();
      loadSummary();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Не удалось сохранить запись');
    }
  };

  const handleEdit = (record: FinanceRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      amount: record.amount.toString(),
      category: record.category,
      description: record.description,
      date: record.date,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9af35e1f/admin/finance/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось удалить запись');
      }

      toast.success('Запись удалена');
      loadRecords();
      loadSummary();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Не удалось удалить запись');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingRecord(null);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} с`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-zinc-100">Финансы</h2>
          <p className="text-zinc-400 mt-1">Учет доходов и расходов</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-zinc-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить запись
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-400 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Доходы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-zinc-100">{formatCurrency(summary.totalIncome)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-400 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2" />
                Расходы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-zinc-100">{formatCurrency(summary.totalExpense)}</div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-amber-500/20 to-amber-600/10 border-amber-500/30' : 'from-zinc-700/20 to-zinc-800/10 border-zinc-700/30'}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm flex items-center ${summary.balance >= 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                <Wallet className="w-4 h-4 mr-2" />
                Баланс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl ${summary.balance >= 0 ? 'text-zinc-100' : 'text-red-400'}`}>
                {formatCurrency(summary.balance)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Filter */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="dateFrom" className="text-zinc-300">
                <Calendar className="w-4 h-4 inline mr-2" />
                С даты
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="dateTo" className="text-zinc-300">
                По дату
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-zinc-300">Тип</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="income">Доходы</SelectItem>
                  <SelectItem value="expense">Расходы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Нет записей за выбранный период</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.type === 'income'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {record.type === 'income' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-zinc-100">{record.category}</div>
                      {record.description && (
                        <div className="text-sm text-zinc-400">{record.description}</div>
                      )}
                      <div className="text-xs text-zinc-500 mt-1">
                        {new Date(record.date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`text-lg ${
                        record.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {record.type === 'income' ? '+' : '-'}
                      {formatCurrency(record.amount)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        className="border-zinc-700 hover:bg-zinc-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {editingRecord ? 'Редактировать запись' : 'Добавить запись'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense', category: '' })}
            >
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger value="income" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  Доход
                </TabsTrigger>
                <TabsTrigger value="expense" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                  Расход
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-300">
                Сумма (сом) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-zinc-300">
                Категория <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                    (cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-300">
                Дата <span className="text-red-400">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">
                Описание
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                Отмена
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-zinc-900">
                {editingRecord ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}