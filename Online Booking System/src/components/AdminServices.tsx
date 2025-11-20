import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { seedServices } from '../utils/seed-services';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Plus, Pencil, Trash2, Clock, DollarSign, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AdminServicesProps {
  token: string;
}

export function AdminServices({ token }: AdminServicesProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_min: '',
    price: '',
    active: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetServices(token);
      setServices(data.services);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_min: service.duration_min.toString(),
        price: service.price.toString(),
        active: service.active
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration_min: '',
        price: '',
        active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        duration_min: parseInt(formData.duration_min),
        price: parseFloat(formData.price),
        active: formData.active
      };

      if (editingService) {
        await api.updateService(token, editingService.id, data);
      } else {
        await api.createService(token, data);
      }

      setDialogOpen(false);
      loadServices();
    } catch (err) {
      console.error('Failed to save service:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;

    try {
      await api.deleteService(token, id);
      loadServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  const handleSeedServices = async () => {
    if (!confirm('Добавить все стандартные услуги барбершопа? Это добавит 10 услуг.')) return;

    try {
      setSeeding(true);
      const results = await seedServices(token);
      
      if (results.success.length > 0) {
        toast.success(`Успешно добавлено услуг: ${results.success.length}`);
      }
      
      if (results.errors.length > 0) {
        toast.error(`Ошибок при добавлении: ${results.errors.length}`);
        console.error('Seed errors:', results.errors);
      }
      
      loadServices();
    } catch (err) {
      console.error('Failed to seed services:', err);
      toast.error('Не удалось добавить услуги');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка услуг...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Управление услугами</h2>
        <div className="flex gap-2">
          {services.length === 0 && (
            <Button 
              onClick={handleSeedServices} 
              disabled={seeding}
              variant="outline"
              className="bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              {seeding ? 'Добавление...' : 'Добавить все услуги'}
            </Button>
          )}
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить услугу
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500 mb-4">Услуги еще не добавлены</p>
            <div className="flex justify-center gap-2">
              <Button onClick={handleSeedServices} disabled={seeding} variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                {seeding ? 'Добавление...' : 'Добавить все услуги барбершопа'}
              </Button>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить вручную
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {service.name}
                      {!service.active && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Неактивна
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(service)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_min} минут</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{service.price} с</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Редактировать услугу' : 'Новая услуга'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название услуги</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Классическая стрижка"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Мужская стрижка ножницами с укладкой"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="duration">Длительность (минут)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration_min}
                onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                placeholder="60"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Цена (сом)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1000"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Услуга активна</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {editingService ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}