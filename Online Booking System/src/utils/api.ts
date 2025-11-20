import { 
  servicesStorage, 
  bookingsStorage, 
  scheduleStorage, 
  blackoutsStorage, 
  productsStorage,
  adminStorage,
  initializeDefaultData,
  Service,
  Booking
} from './local-storage';
import { generateMockTimeSlots } from './mock-data';
import { projectId, publicAnonKey } from './supabase/info';

// Initialize default data on first load
initializeDefaultData();

// Helper to make Supabase API calls
const supabaseApi = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-9af35e1f${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Public endpoints
  async getServices() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const services = servicesStorage.getAll();
      return { services };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { services: [] };
    }
  },

  async getSlots(serviceId: string, date: string) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      const service = servicesStorage.getAll().find(s => s.id === serviceId);
      if (!service) {
        return { slots: [] };
      }

      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();
      
      // Check schedule
      const schedule = scheduleStorage.getAll();
      const daySchedule = schedule.find(s => s.day_of_week === dayOfWeek && s.is_active);
      
      if (!daySchedule) {
        return { slots: [] };
      }

      // Check blackouts
      const blackouts = blackoutsStorage.getAll();
      const hasBlackout = blackouts.some(b => b.date === date);
      
      if (hasBlackout) {
        return { slots: [] };
      }

      // Generate time slots based on schedule
      const slots: string[] = [];
      const [startHour, startMin] = daySchedule.start_time.split(':').map(Number);
      const [endHour, endMin] = daySchedule.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = service.duration_min;

      for (let time = startMinutes; time + duration <= endMinutes; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }

      // Filter out booked slots
      const bookings = bookingsStorage.getAll();
      const bookedTimes = bookings
        .filter(b => b.date === date && b.status !== 'cancelled')
        .map(b => b.time);

      const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

      return { slots: availableSlots };
    } catch (error) {
      console.error('Error fetching slots:', error);
      return { slots: [] };
    }
  },

  async createBooking(data: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const booking = bookingsStorage.create(data);
      return { booking };
    } catch (error: any) {
      throw error;
    }
  },

  // Admin endpoints
  async signup(email: string, password: string, name: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = adminStorage.register(email, password, name);
    const token = adminStorage.login(email, password);
    return { user, access_token: token };
  },

  async login(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const token = adminStorage.login(email, password);
    if (!token) {
      throw new Error('Неверный email или пароль');
    }
    return { access_token: token };
  },

  async adminGetServices(token: string) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    const services = servicesStorage.getAll();
    return { services };
  },

  async createService(token: string, data: any) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const service = servicesStorage.create(data);
    return { service };
  },

  async updateService(token: string, id: string, data: any) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const service = servicesStorage.update(id, data);
    if (!service) {
      throw new Error('Service not found');
    }
    return { service };
  },

  async deleteService(token: string, id: string) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const success = servicesStorage.delete(id);
    if (!success) {
      throw new Error('Service not found');
    }
    return { success: true };
  },

  async getBookings(token: string, params?: { status?: string; from?: string; to?: string }) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let bookings = bookingsStorage.getAll();
    
    if (params?.status) {
      bookings = bookings.filter(b => b.status === params.status);
    }
    
    if (params?.from && params?.to) {
      bookings = bookings.filter(b => b.date >= params.from! && b.date <= params.to!);
    }
    
    return { bookings };
  },

  async updateBooking(token: string, id: string, data: any) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const booking = bookingsStorage.update(id, data);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return { booking };
  },

  async getSchedule(token: string) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    const rules = scheduleStorage.getAll();
    return { rules };
  },

  async updateSchedule(token: string, rules: any[]) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedRules = scheduleStorage.setAll(rules);
    return { rules: updatedRules };
  },

  async getBlackouts(token: string) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    const blackouts = blackoutsStorage.getAll();
    return { blackouts };
  },

  async createBlackout(token: string, data: any) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const blackout = blackoutsStorage.create(data);
    return { blackout };
  },

  async deleteBlackout(token: string, id: string) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const success = blackoutsStorage.delete(id);
    if (!success) {
      throw new Error('Blackout not found');
    }
    return { success: true };
  },

  async getStats(token: string, params?: { from?: string; to?: string }) {
    if (!adminStorage.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let bookings = bookingsStorage.getAll();
    
    if (params?.from && params?.to) {
      bookings = bookings.filter(b => b.date >= params.from! && b.date <= params.to!);
    }
    
    const services = servicesStorage.getAll();
    
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => {
        const service = services.find(s => s.id === booking.service_id);
        return sum + (service?.price || 0);
      }, 0);
    
    return {
      stats: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      }
    };
  },

  // Marketplace endpoints
  async getProducts(token?: string) {
    try {
      const endpoint = token ? '/admin/products' : '/products';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      return await supabaseApi(endpoint, { headers });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(token: string, data: any) {
    try {
      return await supabaseApi('/admin/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: data.name,
          brand: data.brand,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          in_stock: data.inStock,
          volume: data.volume || '',
        }),
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(token: string, id: string, data: any) {
    try {
      return await supabaseApi(`/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: data.name,
          brand: data.brand,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          in_stock: data.inStock,
          volume: data.volume || '',
        }),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(token: string, id: string) {
    try {
      return await supabaseApi(`/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Masters endpoints
  async getMasters(token?: string) {
    try {
      const endpoint = token ? '/admin/masters' : '/masters';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      return await supabaseApi(endpoint, { headers });
    } catch (error) {
      console.error('Error fetching masters:', error);
      throw error;
    }
  },

  async createMaster(token: string, data: any) {
    try {
      return await supabaseApi('/admin/masters', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error creating master:', error);
      throw error;
    }
  },

  async updateMaster(token: string, id: string, data: any) {
    try {
      return await supabaseApi(`/admin/masters/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating master:', error);
      throw error;
    }
  },

  async deleteMaster(token: string, id: string) {
    try {
      return await supabaseApi(`/admin/masters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error deleting master:', error);
      throw error;
    }
  },

  // Finance endpoints
  async getFinance(token: string, params?: { from?: string; to?: string; type?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.from) query.append('from', params.from);
      if (params?.to) query.append('to', params.to);
      if (params?.type) query.append('type', params.type);
      
      const endpoint = `/admin/finance${query.toString() ? '?' + query.toString() : ''}`;
      return await supabaseApi(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error fetching finance:', error);
      throw error;
    }
  },

  async createFinanceRecord(token: string, data: any) {
    try {
      return await supabaseApi('/admin/finance', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error creating finance record:', error);
      throw error;
    }
  },

  async updateFinanceRecord(token: string, id: string, data: any) {
    try {
      return await supabaseApi(`/admin/finance/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating finance record:', error);
      throw error;
    }
  },

  async deleteFinanceRecord(token: string, id: string) {
    try {
      return await supabaseApi(`/admin/finance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error deleting finance record:', error);
      throw error;
    }
  }
};

// Helper functions for client-side usage
export async function fetchServices() {
  return api.getServices();
}

export async function fetchMasters() {
  // For now, return mock data as masters are not yet in the backend
  // In production, this would fetch from the API
  return [
    {
      id: 'master-1',
      name: 'Дмитрий Волков',
      specialty: 'Мастер классических стрижек',
      rating: 4.9,
      experience: '8 лет опыта'
    },
    {
      id: 'master-2',
      name: 'Александр Ковалев',
      specialty: 'Специалист по fade',
      rating: 4.8,
      experience: '6 лет опыта'
    },
    {
      id: 'master-3',
      name: 'Максим Соколов',
      specialty: 'Барбер-стилист',
      rating: 4.7,
      experience: '5 лет опыта'
    }
  ];
}