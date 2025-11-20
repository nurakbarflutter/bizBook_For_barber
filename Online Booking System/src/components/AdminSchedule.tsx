import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';

interface AdminScheduleProps {
  token: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Воскресенье' },
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
];

export function AdminSchedule({ token }: AdminScheduleProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await api.getSchedule(token);
      
      // Initialize with default values if empty
      if (data.rules.length === 0) {
        const defaultRules = WEEKDAYS.map(day => ({
          weekday: day.value,
          open_time: '09:00',
          close_time: '18:00',
          break_from: '13:00',
          break_to: '14:00',
          is_working: day.value !== 0 // All days except Sunday
        }));
        setRules(defaultRules);
      } else {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
      toast.error('Не удалось загрузить расписание');
    } finally {
      setLoading(false);
    }
  };

  const updateRule = (weekday: number, field: string, value: any) => {
    setRules(prevRules => {
      const existing = prevRules.find(r => r.weekday === weekday);
      if (existing) {
        return prevRules.map(r => 
          r.weekday === weekday ? { ...r, [field]: value } : r
        );
      } else {
        return [...prevRules, { 
          weekday, 
          is_working: false,
          open_time: '09:00',
          close_time: '18:00',
          break_from: '',
          break_to: '',
          [field]: value 
        }];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Filter out non-working days and clean up break times
      const cleanRules = rules
        .filter(r => r.is_working)
        .map(r => ({
          ...r,
          break_from: r.break_from || null,
          break_to: r.break_to || null
        }));

      await api.updateSchedule(token, cleanRules);
      toast.success('Расписание сохранено');
    } catch (err) {
      console.error('Failed to save schedule:', err);
      toast.error('Не удалось сохранить расписание');
    } finally {
      setSaving(false);
    }
  };

  const getRule = (weekday: number) => {
    return rules.find(r => r.weekday === weekday) || {
      weekday,
      is_working: false,
      open_time: '09:00',
      close_time: '18:00',
      break_from: '',
      break_to: ''
    };
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка расписания...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Рабочее расписание</h2>
          <p className="text-sm text-gray-600 mt-1">
            Настройте время работы для каждого дня недели
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </div>

      <div className="space-y-4">
        {WEEKDAYS.map(day => {
          const rule = getRule(day.value);
          return (
            <Card key={day.value}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{day.label}</CardTitle>
                  <Switch
                    checked={rule.is_working}
                    onCheckedChange={(checked) => updateRule(day.value, 'is_working', checked)}
                  />
                </div>
              </CardHeader>
              {rule.is_working && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`open-${day.value}`}>Время открытия</Label>
                      <Input
                        id={`open-${day.value}`}
                        type="time"
                        value={rule.open_time}
                        onChange={(e) => updateRule(day.value, 'open_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`close-${day.value}`}>Время закрытия</Label>
                      <Input
                        id={`close-${day.value}`}
                        type="time"
                        value={rule.close_time}
                        onChange={(e) => updateRule(day.value, 'close_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`break-from-${day.value}`}>Начало перерыва (необязательно)</Label>
                      <Input
                        id={`break-from-${day.value}`}
                        type="time"
                        value={rule.break_from || ''}
                        onChange={(e) => updateRule(day.value, 'break_from', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`break-to-${day.value}`}>Конец перерыва (необязательно)</Label>
                      <Input
                        id={`break-to-${day.value}`}
                        type="time"
                        value={rule.break_to || ''}
                        onChange={(e) => updateRule(day.value, 'break_to', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Сохранение...' : 'Сохранить расписание'}
        </Button>
      </div>
    </div>
  );
}
