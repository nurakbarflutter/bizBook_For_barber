// Mock data for barbershop services and products

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  price: number;
  category: string;
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
}

// Generate mock time slots for demonstration
export function generateMockTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  const dayOfWeek = date.getDay();
  
  // Skip Sundays (0)
  if (dayOfWeek === 0) {
    return [];
  }
  
  // Generate slots from 9:00 to 20:00 with 30-minute intervals
  for (let hour = 9; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
  }
  
  // Randomly remove some slots to simulate bookings (remove 30-50%)
  const removeCount = Math.floor(slots.length * (0.3 + Math.random() * 0.2));
  for (let i = 0; i < removeCount; i++) {
    const randomIndex = Math.floor(Math.random() * slots.length);
    slots.splice(randomIndex, 1);
  }
  
  return slots.sort();
}

export const BARBERSHOP_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Классическая стрижка',
    description: 'Мужская стрижка ножницами с укладкой',
    duration_min: 45,
    price: 1500,
    category: 'haircut'
  },
  {
    id: 'service-2',
    name: 'Стрижка машинкой',
    description: 'Короткая стрижка под машинку',
    duration_min: 30,
    price: 1000,
    category: 'haircut'
  },
  {
    id: 'service-3',
    name: 'Моделирование бороды',
    description: 'Коррекция формы бороды, укладка',
    duration_min: 30,
    price: 1200,
    category: 'beard'
  },
  {
    id: 'service-4',
    name: 'Королевское бритье',
    description: 'Бритье опасной бритвой с горячим полотенцем и массажем',
    duration_min: 60,
    price: 2500,
    category: 'shaving'
  },
  {
    id: 'service-5',
    name: 'Детская стрижка',
    description: 'Стрижка для детей до 12 лет',
    duration_min: 30,
    price: 800,
    category: 'haircut'
  },
  {
    id: 'service-6',
    name: 'Fade стрижка',
    description: 'Модная стрижка с плавным переходом',
    duration_min: 60,
    price: 2000,
    category: 'haircut'
  },
  {
    id: 'service-7',
    name: 'Камуфляж седины',
    description: 'Окрашивание седых волос',
    duration_min: 45,
    price: 1800,
    category: 'coloring'
  },
  {
    id: 'service-8',
    name: 'Тонирование бороды',
    description: 'Окрашивание и укладка бороды',
    duration_min: 40,
    price: 1500,
    category: 'beard'
  },
  {
    id: 'service-9',
    name: 'Комплекс "Джентльмен"',
    description: 'Стрижка + моделирование бороды + укладка',
    duration_min: 90,
    price: 3000,
    category: 'package'
  },
  {
    id: 'service-10',
    name: 'Укладка волос',
    description: 'Профессиональная укладка с использованием стайлинга',
    duration_min: 20,
    price: 600,
    category: 'styling'
  }
];

export const GROOMING_PRODUCTS: Product[] = [
  {
    id: 'product-1',
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
    id: 'product-2',
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
    id: 'product-3',
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
    id: 'product-4',
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
    id: 'product-5',
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
    id: 'product-6',
    name: 'Воск для усов',
    brand: 'Can You Handlebar',
    description: 'Сильная фиксация для укладки усов',
    price: 650,
    category: 'beard',
    image: 'https://images.unsplash.com/photo-1655565638365-e6e6640938dd?w=400&h=400&fit=crop',
    inStock: true,
    volume: '15 г'
  },
  {
    id: 'product-7',
    name: 'Пена для бритья Premium',
    brand: 'Proraso',
    description: 'Богатая пена для комфортного бритья',
    price: 550,
    category: 'shaving',
    image: 'https://images.unsplash.com/photo-1510711070725-068a3a878a99?w=400&h=400&fit=crop',
    inStock: true,
    volume: '300 мл'
  },
  {
    id: 'product-8',
    name: 'Бальзам после бритья',
    brand: 'Nivea Men',
    description: 'Успокаивает и увлажняет кожу',
    price: 450,
    category: 'shaving',
    image: 'https://images.unsplash.com/photo-1510711070725-068a3a878a99?w=400&h=400&fit=crop',
    inStock: true,
    volume: '100 мл'
  },
  {
    id: 'product-9',
    name: 'Расческа для бороды',
    brand: 'Beard Kings',
    description: 'Деревянная расческа из сандалового дерева',
    price: 500,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1675516490928-e8fdfdf65ca8?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    id: 'product-10',
    name: 'Спрей-фиксатор для волос',
    brand: 'Schwarzkopf',
    description: 'Сильная фиксация без склеивания',
    price: 800,
    category: 'styling',
    image: 'https://images.unsplash.com/photo-1605180427725-95e306fc0e9a?w=400&h=400&fit=crop',
    inStock: true,
    volume: '200 мл'
  },
  {
    id: 'product-11',
    name: 'Набор для бритья Deluxe',
    brand: 'The Art of Shaving',
    description: 'Полный набор: станок, крем, бальзам',
    price: 3500,
    category: 'shaving',
    image: 'https://images.unsplash.com/photo-1510711070725-068a3a878a99?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    id: 'product-12',
    name: 'Гель для душа Men Active',
    brand: 'L\'Oreal',
    description: 'Освежающий гель с древесным ароматом',
    price: 400,
    category: 'body',
    image: 'https://images.unsplash.com/photo-1621607510248-9c78bbab941b?w=400&h=400&fit=crop',
    inStock: true,
    volume: '250 мл'
  }
];

export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'Все товары' },
  { id: 'beard', name: 'Уход за бородой' },
  { id: 'styling', name: 'Стайлинг' },
  { id: 'shaving', name: 'Бритье' },
  { id: 'accessories', name: 'Аксессуары' },
  { id: 'body', name: 'Уход за телом' }
];
