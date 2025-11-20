import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { UserPlus, Edit2, Trash2, Phone, Mail, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/api';

interface Master {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AdminMastersProps {
  token: string;
}

export function AdminMasters({ token }: AdminMastersProps) {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    avatar: '',
    phone: '',
    email: '',
    is_active: true,
  });

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const data = await api.getMasters(token);
      setMasters(data.masters || []);
    } catch (error) {
      console.error('Error loading masters:', error);
      toast.error('Не удалось загрузить список мастеров');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.specialization) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      if (editingMaster) {
        await api.updateMaster(token, editingMaster.id, formData);
        toast.success('Мастер обновлен');
      } else {
        await api.createMaster(token, formData);
        toast.success('Мастер добавлен');
      }
      
      setShowDialog(false);
      resetForm();
      loadMasters();
    } catch (error) {
      console.error('Error saving master:', error);
      toast.error('Не удалось сохранить мастера');
    }
  };

  const handleEdit = (master: Master) => {
    setEditingMaster(master);
    setFormData({
      name: master.name,
      specialization: master.specialization,
      avatar: master.avatar,
      phone: master.phone,
      email: master.email,
      is_active: master.is_active,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого мастера?')) {
      return;
    }

    try {
      await api.deleteMaster(token, id);
      toast.success('Мастер удален');
      loadMasters();
    } catch (error) {
      console.error('Error deleting master:', error);
      toast.error('Не удалось удалить мастера');
    }
  };

  const toggleActive = async (master: Master) => {
    try {
      await api.updateMaster(token, master.id, { ...master, is_active: !master.is_active });
      toast.success(master.is_active ? 'Мастер деактивирован' : 'Мастер активирован');
      loadMasters();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('Не удалось обновить статус');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      avatar: '',
      phone: '',
      email: '',
      is_active: true,
    });
    setEditingMaster(null);
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
          <h2 className="text-zinc-100">Мастера</h2>
          <p className="text-zinc-400 mt-1">Управление командой барбершопа</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-zinc-900"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Добавить мастера
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {masters.map((master) => (
          <Card key={master.id} className="bg-zinc-800/50 border-zinc-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {master.avatar ? (
                    <img
                      src={master.avatar}
                      alt={master.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-500">
                      <span className="text-amber-500">
                        {master.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-zinc-100 text-base">{master.name}</CardTitle>
                    <CardDescription className="text-amber-500 text-sm">
                      {master.specialization}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={master.is_active ? 'default' : 'secondary'}
                  className={
                    master.is_active
                      ? 'bg-green-500/20 text-green-400 border-green-500'
                      : 'bg-zinc-700 text-zinc-400'
                  }
                >
                  {master.is_active ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {master.phone && (
                <div className="flex items-center text-sm text-zinc-400">
                  <Phone className="w-4 h-4 mr-2" />
                  {master.phone}
                </div>
              )}
              {master.email && (
                <div className="flex items-center text-sm text-zinc-400">
                  <Mail className="w-4 h-4 mr-2" />
                  {master.email}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(master)}
                  className="flex-1 border-zinc-700 hover:bg-zinc-700"
                >
                  {master.is_active ? (
                    <UserX className="w-4 h-4 mr-1" />
                  ) : (
                    <UserCheck className="w-4 h-4 mr-1" />
                  )}
                  {master.is_active ? 'Деактивировать' : 'Активировать'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(master)}
                  className="border-zinc-700 hover:bg-zinc-700"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(master.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {masters.length === 0 && (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              Пока нет мастеров. Добавьте первого мастера.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {editingMaster ? 'Редактировать мастера' : 'Добавить мастера'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Имя <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван Иванов"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-zinc-300">
                Специализация <span className="text-red-400">*</span>
              </Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Барбер"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">
                Телефон
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+996 XXX XXX XXX"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="master@barbershop.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-zinc-300">
                URL аватара
              </Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-800"
              />
              <Label htmlFor="is_active" className="text-zinc-300">
                Активный мастер
              </Label>
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
                {editingMaster ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}