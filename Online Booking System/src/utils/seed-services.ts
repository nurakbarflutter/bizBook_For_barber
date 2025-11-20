// Helper script to seed barbershop services
// This can be used by administrators to quickly add all services

import { BARBERSHOP_SERVICES } from './mock-data';
import { api } from './api';

export async function seedServices(token: string) {
  const results = {
    success: [] as string[],
    errors: [] as { service: string; error: string }[]
  };

  for (const service of BARBERSHOP_SERVICES) {
    try {
      await api.createService(token, {
        name: service.name,
        description: service.description,
        duration_min: service.duration_min,
        price: service.price,
        active: true
      });

      results.success.push(service.name);
    } catch (error: any) {
      results.errors.push({
        service: service.name,
        error: error.message
      });
    }
  }

  return results;
}

// Instructions for manual addition via admin panel:
export const SERVICE_INSTRUCTIONS = `
Инструкция по добавлению услуг барбершопа:

1. Войдите в админ-панель
2. Перейдите в раздел "Услуги"
3. Нажмите "Добавить услугу"
4. Добавьте следующие услуги:

${BARBERSHOP_SERVICES.map((s, i) => `
${i + 1}. ${s.name}
   Описание: ${s.description}
   Длительность: ${s.duration_min} минут
   Цена: ${s.price} ₽
`).join('\n')}

Или используйте функцию seedServices() для автоматического добавления всех услуг.
`;
