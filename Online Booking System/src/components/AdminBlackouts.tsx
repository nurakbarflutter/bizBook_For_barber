import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface AdminBlackoutsProps {
  token: string;
}

export function AdminBlackouts({ token }: AdminBlackoutsProps) {
  const [blackouts, setBlackouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_at: '',
    end_at: '',
    reason: ''
  });

  useEffect(() => {
    loadBlackouts();
  }, []);

  const loadBlackouts = async () => {
    try {
      setLoading(true);
      const data = await api.getBlackouts(token);
      setBlackouts(data.blackouts);
    } catch (err) {
      console.error('Failed to load blackouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = () => {
    setFormData({
      start_at: '',
      end_at: '',
      reason: ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.createBlackout(token, {
        start_at: formData.start_at + 'T00:00:00',
        end_at: formData.end_at + 'T23:59:59',
        reason: formData.reason
      });

      setDialogOpen(false);
      loadBlackouts();
    } catch (err) {
      console.error('Failed to create blackout:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту блокировку?')) return;

    try {
      await api.deleteBlackout(token, id);
      loadBlackouts();
    } catch (err) {
      console.error('Failed to delete blackout:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка блокировок...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Блокировки дат</h2>
          <p className="text-sm text-gray-600 mt-1">
            Закройте запись на праздники, ремонт или другие периоды
          </p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить блокировку
        </Button>
      </div>

      {blackouts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500 mb-4">Блокировки не настроены</p>
            <div className="flex justify-center">
              <Button onClick={openDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первую блокировку
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blackouts.map((blackout) => {
            const startDate = new Date(blackout.start_at);
            const endDate = new Date(blackout.end_at);
            return (
              <Card key={blackout.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{blackout.reason || 'Без причины'}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {startDate.toLocaleDateString('ru-RU')} — {endDate.toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(blackout.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая блокировка</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="start">Дата начала</Label>
              <Input
                id="start"
                type="date"
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end">Дата окончания</Label>
              <Input
                id="end"
                type="date"
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                required
                min={formData.start_at}
              />
            </div>

            <div>
              <Label htmlFor="reason">Причина (необязательно)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Праздники, ремонт..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Создать</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
