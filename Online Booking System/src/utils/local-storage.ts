// Local storage management for BizBook system
// This replaces Supabase with localStorage for standalone operation

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  price: number;
  category: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  service_id: string;
  date: string;
  time: string;
  customer_name: string;
  phone: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ScheduleRule {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Blackout {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  volume?: string;
  created_at: string;
}

export interface AdminUser {
  email: string;
  password: string; // In production, this should be hashed!
  name: string;
}

// Storage keys
const KEYS = {
  SERVICES: 'bizbook_services',
  BOOKINGS: 'bizbook_bookings',
  SCHEDULE: 'bizbook_schedule',
  BLACKOUTS: 'bizbook_blackouts',
  PRODUCTS: 'bizbook_products',
  ADMIN_USER: 'bizbook_admin_user',
  ADMIN_SESSION: 'bizbook_admin_session',
};

// Helper functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Services
export const servicesStorage = {
  getAll(): Service[] {
    return getFromStorage<Service[]>(KEYS.SERVICES, []);
  },
  
  create(service: Omit<Service, 'id' | 'created_at'>): Service {
    const services = this.getAll();
    const newService: Service = {
      ...service,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    services.push(newService);
    setToStorage(KEYS.SERVICES, services);
    return newService;
  },
  
  update(id: string, updates: Partial<Service>): Service | null {
    const services = this.getAll();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    services[index] = { ...services[index], ...updates };
    setToStorage(KEYS.SERVICES, services);
    return services[index];
  },
  
  delete(id: string): boolean {
    const services = this.getAll();
    const filtered = services.filter(s => s.id !== id);
    if (filtered.length === services.length) return false;
    
    setToStorage(KEYS.SERVICES, filtered);
    return true;
  }
};

// Bookings
export const bookingsStorage = {
  getAll(): Booking[] {
    return getFromStorage<Booking[]>(KEYS.BOOKINGS, []);
  },
  
  create(booking: Omit<Booking, 'id' | 'status' | 'created_at'>): Booking {
    const bookings = this.getAll();
    
    // Check if slot is already taken
    const existingBooking = bookings.find(
      b => b.date === booking.date && 
           b.time === booking.time && 
           b.status !== 'cancelled'
    );
    
    if (existingBooking) {
      throw new Error('Это время уже занято');
    }
    
    const newBooking: Booking = {
      ...booking,
      id: generateId(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    bookings.push(newBooking);
    setToStorage(KEYS.BOOKINGS, bookings);
    return newBooking;
  },
  
  update(id: string, updates: Partial<Booking>): Booking | null {
    const bookings = this.getAll();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    bookings[index] = { ...bookings[index], ...updates };
    setToStorage(KEYS.BOOKINGS, bookings);
    return bookings[index];
  },
  
  getByDateRange(from: string, to: string): Booking[] {
    const bookings = this.getAll();
    return bookings.filter(b => b.date >= from && b.date <= to);
  }
};

// Schedule
export const scheduleStorage = {
  getAll(): ScheduleRule[] {
    return getFromStorage<ScheduleRule[]>(KEYS.SCHEDULE, []);
  },
  
  setAll(rules: Omit<ScheduleRule, 'id'>[]): ScheduleRule[] {
    const newRules = rules.map(rule => ({
      ...rule,
      id: generateId(),
    }));
    setToStorage(KEYS.SCHEDULE, newRules);
    return newRules;
  }
};

// Blackouts
export const blackoutsStorage = {
  getAll(): Blackout[] {
    return getFromStorage<Blackout[]>(KEYS.BLACKOUTS, []);
  },
  
  create(blackout: Omit<Blackout, 'id'>): Blackout {
    const blackouts = this.getAll();
    const newBlackout: Blackout = {
      ...blackout,
      id: generateId(),
    };
    blackouts.push(newBlackout);
    setToStorage(KEYS.BLACKOUTS, blackouts);
    return newBlackout;
  },
  
  delete(id: string): boolean {
    const blackouts = this.getAll();
    const filtered = blackouts.filter(b => b.id !== id);
    if (filtered.length === blackouts.length) return false;
    
    setToStorage(KEYS.BLACKOUTS, filtered);
    return true;
  }
};

// Products (Marketplace)
export const productsStorage = {
  getAll(): Product[] {
    return getFromStorage<Product[]>(KEYS.PRODUCTS, []);
  },
  
  create(product: Omit<Product, 'id' | 'created_at'>): Product {
    const products = this.getAll();
    const newProduct: Product = {
      ...product,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    products.push(newProduct);
    setToStorage(KEYS.PRODUCTS, products);
    return newProduct;
  },
  
  update(id: string, updates: Partial<Product>): Product | null {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...updates };
    setToStorage(KEYS.PRODUCTS, products);
    return products[index];
  },
  
  delete(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    
    setToStorage(KEYS.PRODUCTS, filtered);
    return true;
  }
};

// Admin authentication
export const adminStorage = {
  register(email: string, password: string, name: string): AdminUser {
    const user: AdminUser = { email, password, name };
    setToStorage(KEYS.ADMIN_USER, user);
    return user;
  },
  
  login(email: string, password: string): string | null {
    const user = getFromStorage<AdminUser | null>(KEYS.ADMIN_USER, null);
    if (!user) {
      // Create default admin if none exists
      this.register(email, password, 'Admin');
      const token = generateId();
      setToStorage(KEYS.ADMIN_SESSION, { token, email });
      return token;
    }
    
    if (user.email === email && user.password === password) {
      const token = generateId();
      setToStorage(KEYS.ADMIN_SESSION, { token, email });
      return token;
    }
    
    return null;
  },
  
  validateToken(token: string): boolean {
    const session = getFromStorage<{ token: string; email: string } | null>(
      KEYS.ADMIN_SESSION,
      null
    );
    return session?.token === token;
  },
  
  logout(): void {
    localStorage.removeItem(KEYS.ADMIN_SESSION);
  },
  
  getSession(): { token: string; email: string } | null {
    return getFromStorage<{ token: string; email: string } | null>(
      KEYS.ADMIN_SESSION,
      null
    );
  }
};

// Initialize with default schedule if empty
export function initializeDefaultData() {
  const schedule = scheduleStorage.getAll();
  if (schedule.length === 0) {
    // Set default working hours: Mon-Sat 9:00-20:00
    scheduleStorage.setAll([
      { day_of_week: 1, start_time: '09:00', end_time: '20:00', is_active: true },
      { day_of_week: 2, start_time: '09:00', end_time: '20:00', is_active: true },
      { day_of_week: 3, start_time: '09:00', end_time: '20:00', is_active: true },
      { day_of_week: 4, start_time: '09:00', end_time: '20:00', is_active: true },
      { day_of_week: 5, start_time: '09:00', end_time: '20:00', is_active: true },
      { day_of_week: 6, start_time: '09:00', end_time: '20:00', is_active: true },
      { day_of_week: 0, start_time: '09:00', end_time: '20:00', is_active: false },
    ]);
  }

  // Initialize with some demo products
  const products = productsStorage.getAll();
  if (products.length === 0) {
    const demoProducts = [
      {
        name: 'Масло для бороды Cedar',
        brand: 'Beard Kings',
        description: 'Натуральное масло с ароматом кедра для увлажнения и блеска бороды',
        price: 1200,
        category: 'beard',
        image: 'https://images.unsplash.com/photo-1655565638365-e6e6640938dd?w=400&h=400&fit=crop',
        inStock: true,
        volume: '30 мл'
      },
      {
        name: 'Помада для укладки Strong Hold',
        brand: 'American Crew',
        description: 'Сильная фиксация, естественный блеск',
        price: 950,
        category: 'styling',
        image: 'https://images.unsplash.com/photo-1605180427725-95e306fc0e9a?w=400&h=400&fit=crop',
        inStock: true,
        volume: '85 г'
      },
      {
        name: 'Бальзам для бороды',
        brand: 'Viking Revolution',
        description: 'Смягчает, питает и укладывает бороду',
        price: 850,
        category: 'beard',
        image: 'https://images.unsplash.com/photo-1655565638365-e6e6640938dd?w=400&h=400&fit=crop',
        inStock: true,
        volume: '60 мл'
      },
      {
        name: 'Матовая глина для волос',
        brand: 'Uppercut Deluxe',
        description: 'Матовая текстура, средняя фиксация',
        price: 1100,
        category: 'styling',
        image: 'https://images.unsplash.com/photo-1605180427725-95e306fc0e9a?w=400&h=400&fit=crop',
        inStock: true,
        volume: '70 г'
      },
      {
        name: 'Шампунь для бороды',
        brand: 'Beard Kings',
        description: 'Деликатное очищение бороды и кожи',
        price: 750,
        category: 'beard',
        image: 'https://images.unsplash.com/photo-1706765779515-40038dafd7c9?w=400&h=400&fit=crop',
        inStock: true,
        volume: '150 мл'
      },
      {
        name: 'Пена для бритья Premium',
        brand: 'Proraso',
        description: 'Богатая пена для комфортного бритья',
        price: 550,
        category: 'shaving',
        image: 'https://images.unsplash.com/photo-1510711070725-068a3a878a99?w=400&h=400&fit=crop',
        inStock: true,
        volume: '300 мл'
      }
    ];

    demoProducts.forEach(product => {
      productsStorage.create(product);
    });
  }
}