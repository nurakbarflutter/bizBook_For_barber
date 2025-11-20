import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const getSupabase = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper: Check if user is admin
const checkAdmin = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    console.log('Authorization error during admin check:', error);
    return null;
  }
  
  return user;
};

// Helper: Generate time slots
const generateSlots = (
  date: string,
  durationMin: number,
  scheduleRule: any,
  blackouts: any[],
  existingBookings: any[]
) => {
  const slots: string[] = [];
  
  if (!scheduleRule) return slots;
  
  const dateObj = new Date(date);
  const weekday = dateObj.getDay(); // 0 = Sunday
  
  // Find schedule for this weekday
  const daySchedule = scheduleRule.find((s: any) => s.weekday === weekday);
  if (!daySchedule || !daySchedule.open_time || !daySchedule.close_time) {
    return slots;
  }
  
  // Check if date is in blackout period
  const dateTime = new Date(date + 'T00:00:00').getTime();
  const isBlackedOut = blackouts.some(b => {
    const start = new Date(b.start_at).getTime();
    const end = new Date(b.end_at).getTime();
    return dateTime >= start && dateTime <= end;
  });
  
  if (isBlackedOut) return slots;
  
  // Generate slots
  const [openHour, openMin] = daySchedule.open_time.split(':').map(Number);
  const [closeHour, closeMin] = daySchedule.close_time.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMin = openMin;
  
  while (true) {
    const endMin = currentMin + durationMin;
    const endHour = currentHour + Math.floor(endMin / 60);
    const finalEndMin = endMin % 60;
    
    if (endHour > closeHour || (endHour === closeHour && finalEndMin > closeMin)) {
      break;
    }
    
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    const slotEnd = `${String(endHour).padStart(2, '0')}:${String(finalEndMin).padStart(2, '0')}`;
    
    // Check if slot overlaps with break
    if (daySchedule.break_from && daySchedule.break_to) {
      const breakStart = daySchedule.break_from;
      const breakEnd = daySchedule.break_to;
      
      // Skip if slot overlaps with break
      if (!(slotEnd <= breakStart || slotStart >= breakEnd)) {
        currentMin += durationMin;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
        continue;
      }
    }
    
    // Check if slot overlaps with existing bookings
    const slotStartTime = new Date(`${date}T${slotStart}:00`).getTime();
    const slotEndTime = new Date(`${date}T${slotEnd}:00`).getTime();
    
    const hasOverlap = existingBookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      
      const bookingStart = new Date(booking.start_at).getTime();
      const bookingEnd = new Date(booking.end_at).getTime();
      
      return slotStartTime < bookingEnd && bookingStart < slotEndTime;
    });
    
    if (!hasOverlap) {
      slots.push(slotStart);
    }
    
    currentMin += durationMin;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
};

// Health check endpoint
app.get("/make-server-9af35e1f/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth: Admin signup
app.post("/make-server-9af35e1f/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Error during admin signup:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Error in signup endpoint:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Services: Get all active services (public)
app.get("/make-server-9af35e1f/services", async (c) => {
  try {
    const services = await kv.getByPrefix('service:');
    const activeServices = services.filter((s: any) => s.active);
    return c.json({ services: activeServices });
  } catch (error) {
    console.log('Error fetching services:', error);
    return c.json({ error: 'Failed to fetch services' }, 500);
  }
});

// Services: Get all services (admin)
app.get("/make-server-9af35e1f/admin/services", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const services = await kv.getByPrefix('service:');
    return c.json({ services });
  } catch (error) {
    console.log('Error fetching admin services:', error);
    return c.json({ error: 'Failed to fetch services' }, 500);
  }
});

// Services: Create service (admin)
app.post("/make-server-9af35e1f/admin/services", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { name, duration_min, price, active = true } = await c.req.json();
    const id = crypto.randomUUID();
    const service = { id, name, duration_min, price, active };
    
    await kv.set(`service:${id}`, service);
    return c.json({ service });
  } catch (error) {
    console.log('Error creating service:', error);
    return c.json({ error: 'Failed to create service' }, 500);
  }
});

// Services: Update service (admin)
app.put("/make-server-9af35e1f/admin/services/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`service:${id}`);
    if (!existing) {
      return c.json({ error: 'Service not found' }, 404);
    }
    
    const service = { ...existing, ...updates, id };
    await kv.set(`service:${id}`, service);
    return c.json({ service });
  } catch (error) {
    console.log('Error updating service:', error);
    return c.json({ error: 'Failed to update service' }, 500);
  }
});

// Services: Delete service (admin)
app.delete("/make-server-9af35e1f/admin/services/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    await kv.del(`service:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting service:', error);
    return c.json({ error: 'Failed to delete service' }, 500);
  }
});

// Bookings: Get available slots
app.get("/make-server-9af35e1f/slots", async (c) => {
  try {
    const serviceId = c.req.query('service_id');
    const date = c.req.query('date');
    
    if (!serviceId || !date) {
      return c.json({ error: 'service_id and date are required' }, 400);
    }
    
    const service = await kv.get(`service:${serviceId}`);
    if (!service || !service.active) {
      return c.json({ error: 'Service not found or inactive' }, 404);
    }
    
    const scheduleRules = await kv.get('schedule:rules') || [];
    const blackouts = await kv.getByPrefix('blackout:');
    const allBookings = await kv.getByPrefix('booking:');
    
    // Filter bookings for this service and date
    const dateBookings = allBookings.filter((b: any) => {
      const bookingDate = b.start_at.split('T')[0];
      return b.service_id === serviceId && bookingDate === date;
    });
    
    const slots = generateSlots(date, service.duration_min, scheduleRules, blackouts, dateBookings);
    
    return c.json({ slots });
  } catch (error) {
    console.log('Error generating slots:', error);
    return c.json({ error: 'Failed to generate slots' }, 500);
  }
});

// Bookings: Create booking (public)
app.post("/make-server-9af35e1f/bookings", async (c) => {
  try {
    const { service_id, date, time, customer_name, phone, note } = await c.req.json();
    
    if (!service_id || !date || !time || !customer_name || !phone) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const service = await kv.get(`service:${service_id}`);
    if (!service || !service.active) {
      return c.json({ error: 'Service not found or inactive' }, 404);
    }
    
    // Calculate end time
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration_min * 60000);
    
    // Check for overlaps
    const allBookings = await kv.getByPrefix('booking:');
    const hasOverlap = allBookings.some((b: any) => {
      if (b.status === 'cancelled' || b.service_id !== service_id) return false;
      
      const bookingStart = new Date(b.start_at).getTime();
      const bookingEnd = new Date(b.end_at).getTime();
      const newStart = startDateTime.getTime();
      const newEnd = endDateTime.getTime();
      
      return newStart < bookingEnd && bookingStart < newEnd;
    });
    
    if (hasOverlap) {
      return c.json({ error: 'Time slot is no longer available' }, 409);
    }
    
    const id = crypto.randomUUID();
    const booking = {
      id,
      service_id,
      start_at: startDateTime.toISOString(),
      end_at: endDateTime.toISOString(),
      customer_name,
      phone,
      note: note || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    await kv.set(`booking:${id}`, booking);
    
    console.log(`New booking created: ${customer_name} for ${service.name} on ${date} at ${time}`);
    
    return c.json({ booking });
  } catch (error) {
    console.log('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Bookings: Get all bookings (admin)
app.get("/make-server-9af35e1f/admin/bookings", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const status = c.req.query('status');
    const from = c.req.query('from');
    const to = c.req.query('to');
    
    let bookings = await kv.getByPrefix('booking:');
    
    if (status) {
      bookings = bookings.filter((b: any) => b.status === status);
    }
    
    if (from) {
      const fromTime = new Date(from).getTime();
      bookings = bookings.filter((b: any) => new Date(b.start_at).getTime() >= fromTime);
    }
    
    if (to) {
      const toTime = new Date(to).getTime();
      bookings = bookings.filter((b: any) => new Date(b.start_at).getTime() <= toTime);
    }
    
    // Sort by start time
    bookings.sort((a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    
    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Bookings: Update booking status (admin)
app.patch("/make-server-9af35e1f/admin/bookings/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const { status, cancel_reason } = await c.req.json();
    
    if (!['confirmed', 'cancelled'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const existing = await kv.get(`booking:${id}`);
    if (!existing) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    const booking = { 
      ...existing, 
      status,
      cancel_reason: status === 'cancelled' ? cancel_reason : undefined,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`booking:${id}`, booking);
    
    console.log(`Booking ${status}: ${existing.customer_name} - ${existing.phone}`);
    
    return c.json({ booking });
  } catch (error) {
    console.log('Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// Schedule: Get schedule rules (admin)
app.get("/make-server-9af35e1f/admin/schedule", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const rules = await kv.get('schedule:rules') || [];
    return c.json({ rules });
  } catch (error) {
    console.log('Error fetching schedule:', error);
    return c.json({ error: 'Failed to fetch schedule' }, 500);
  }
});

// Schedule: Update schedule rules (admin)
app.put("/make-server-9af35e1f/admin/schedule", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { rules } = await c.req.json();
    await kv.set('schedule:rules', rules);
    return c.json({ rules });
  } catch (error) {
    console.log('Error updating schedule:', error);
    return c.json({ error: 'Failed to update schedule' }, 500);
  }
});

// Blackouts: Get blackout dates (admin)
app.get("/make-server-9af35e1f/admin/blackouts", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const blackouts = await kv.getByPrefix('blackout:');
    return c.json({ blackouts });
  } catch (error) {
    console.log('Error fetching blackouts:', error);
    return c.json({ error: 'Failed to fetch blackouts' }, 500);
  }
});

// Blackouts: Create blackout date (admin)
app.post("/make-server-9af35e1f/admin/blackouts", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { start_at, end_at, reason } = await c.req.json();
    const id = crypto.randomUUID();
    const blackout = { id, start_at, end_at, reason };
    
    await kv.set(`blackout:${id}`, blackout);
    return c.json({ blackout });
  } catch (error) {
    console.log('Error creating blackout:', error);
    return c.json({ error: 'Failed to create blackout' }, 500);
  }
});

// Blackouts: Delete blackout date (admin)
app.delete("/make-server-9af35e1f/admin/blackouts/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    await kv.del(`blackout:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting blackout:', error);
    return c.json({ error: 'Failed to delete blackout' }, 500);
  }
});

// Stats: Get statistics (admin)
app.get("/make-server-9af35e1f/admin/stats", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    
    let bookings = await kv.getByPrefix('booking:');
    
    if (from) {
      const fromTime = new Date(from).getTime();
      bookings = bookings.filter((b: any) => new Date(b.start_at).getTime() >= fromTime);
    }
    
    if (to) {
      const toTime = new Date(to).getTime();
      bookings = bookings.filter((b: any) => new Date(b.start_at).getTime() <= toTime);
    }
    
    // Calculate stats
    const total = bookings.length;
    const confirmed = bookings.filter((b: any) => b.status === 'confirmed').length;
    const pending = bookings.filter((b: any) => b.status === 'pending').length;
    const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;
    
    // Top services
    const serviceCount: Record<string, number> = {};
    bookings.forEach((b: any) => {
      if (b.status !== 'cancelled') {
        serviceCount[b.service_id] = (serviceCount[b.service_id] || 0) + 1;
      }
    });
    
    const services = await kv.getByPrefix('service:');
    const topServices = Object.entries(serviceCount)
      .map(([service_id, count]) => {
        const service = services.find((s: any) => s.id === service_id);
        return { service_id, service_name: service?.name || 'Unknown', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Bookings by day
    const byDay: Record<string, number> = {};
    bookings.forEach((b: any) => {
      if (b.status !== 'cancelled') {
        const date = b.start_at.split('T')[0];
        byDay[date] = (byDay[date] || 0) + 1;
      }
    });
    
    return c.json({
      total,
      confirmed,
      pending,
      cancelled,
      topServices,
      byDay,
    });
  } catch (error) {
    console.log('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Masters: Get all masters (public)
app.get("/make-server-9af35e1f/masters", async (c) => {
  try {
    const masters = await kv.getByPrefix('master:');
    const activeMasters = masters.filter((m: any) => m.is_active);
    return c.json({ masters: activeMasters });
  } catch (error) {
    console.log('Error fetching masters:', error);
    return c.json({ error: 'Failed to fetch masters' }, 500);
  }
});

// Masters: Get all masters (admin)
app.get("/make-server-9af35e1f/admin/masters", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const masters = await kv.getByPrefix('master:');
    return c.json({ masters });
  } catch (error) {
    console.log('Error fetching admin masters:', error);
    return c.json({ error: 'Failed to fetch masters' }, 500);
  }
});

// Masters: Create master (admin)
app.post("/make-server-9af35e1f/admin/masters", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { name, specialization, avatar, phone, email, is_active = true } = await c.req.json();
    const id = crypto.randomUUID();
    const master = { 
      id, 
      name, 
      specialization, 
      avatar: avatar || '', 
      phone: phone || '', 
      email: email || '', 
      is_active,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`master:${id}`, master);
    console.log(`New master created: ${name} - ${specialization}`);
    return c.json({ master });
  } catch (error) {
    console.log('Error creating master:', error);
    return c.json({ error: 'Failed to create master' }, 500);
  }
});

// Masters: Update master (admin)
app.put("/make-server-9af35e1f/admin/masters/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`master:${id}`);
    if (!existing) {
      return c.json({ error: 'Master not found' }, 404);
    }
    
    const master = { ...existing, ...updates, id };
    await kv.set(`master:${id}`, master);
    console.log(`Master updated: ${master.name}`);
    return c.json({ master });
  } catch (error) {
    console.log('Error updating master:', error);
    return c.json({ error: 'Failed to update master' }, 500);
  }
});

// Masters: Delete master (admin)
app.delete("/make-server-9af35e1f/admin/masters/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    await kv.del(`master:${id}`);
    console.log(`Master deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting master:', error);
    return c.json({ error: 'Failed to delete master' }, 500);
  }
});

// Products: Get all products (public)
app.get("/make-server-9af35e1f/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    const inStockProducts = products.filter((p: any) => p.in_stock);
    return c.json({ products: inStockProducts });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Products: Get all products (admin)
app.get("/make-server-9af35e1f/admin/products", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.log('Error fetching admin products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Products: Create product (admin)
app.post("/make-server-9af35e1f/admin/products", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { name, brand, description, price, category, image, in_stock = true, volume } = await c.req.json();
    const id = crypto.randomUUID();
    const product = { 
      id, 
      name, 
      brand, 
      description, 
      price, 
      category, 
      image, 
      in_stock,
      volume: volume || '',
      created_at: new Date().toISOString()
    };
    
    await kv.set(`product:${id}`, product);
    console.log(`New product created: ${name} - ${brand}`);
    return c.json({ product });
  } catch (error) {
    console.log('Error creating product:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Products: Update product (admin)
app.put("/make-server-9af35e1f/admin/products/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const product = { ...existing, ...updates, id };
    await kv.set(`product:${id}`, product);
    console.log(`Product updated: ${product.name}`);
    return c.json({ product });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Products: Delete product (admin)
app.delete("/make-server-9af35e1f/admin/products/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    console.log(`Product deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// Finance: Get all records (admin)
app.get("/make-server-9af35e1f/admin/finance", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    const type = c.req.query('type'); // income or expense
    
    let records = await kv.getByPrefix('finance:');
    
    if (from) {
      const fromTime = new Date(from).getTime();
      records = records.filter((r: any) => new Date(r.date).getTime() >= fromTime);
    }
    
    if (to) {
      const toTime = new Date(to).getTime();
      records = records.filter((r: any) => new Date(r.date).getTime() <= toTime);
    }
    
    if (type) {
      records = records.filter((r: any) => r.type === type);
    }
    
    // Sort by date descending
    records.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return c.json({ records });
  } catch (error) {
    console.log('Error fetching finance records:', error);
    return c.json({ error: 'Failed to fetch finance records' }, 500);
  }
});

// Finance: Create record (admin)
app.post("/make-server-9af35e1f/admin/finance", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { type, amount, category, description, date } = await c.req.json();
    
    if (!['income', 'expense'].includes(type)) {
      return c.json({ error: 'Invalid type. Must be income or expense' }, 400);
    }
    
    const id = crypto.randomUUID();
    const record = { 
      id, 
      type, 
      amount, 
      category, 
      description: description || '', 
      date,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`finance:${id}`, record);
    console.log(`New finance record created: ${type} - ${amount} сом`);
    return c.json({ record });
  } catch (error) {
    console.log('Error creating finance record:', error);
    return c.json({ error: 'Failed to create finance record' }, 500);
  }
});

// Finance: Update record (admin)
app.put("/make-server-9af35e1f/admin/finance/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`finance:${id}`);
    if (!existing) {
      return c.json({ error: 'Finance record not found' }, 404);
    }
    
    const record = { ...existing, ...updates, id };
    await kv.set(`finance:${id}`, record);
    console.log(`Finance record updated: ${id}`);
    return c.json({ record });
  } catch (error) {
    console.log('Error updating finance record:', error);
    return c.json({ error: 'Failed to update finance record' }, 500);
  }
});

// Finance: Delete record (admin)
app.delete("/make-server-9af35e1f/admin/finance/:id", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    await kv.del(`finance:${id}`);
    console.log(`Finance record deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting finance record:', error);
    return c.json({ error: 'Failed to delete finance record' }, 500);
  }
});

// Finance: Get summary (admin)
app.get("/make-server-9af35e1f/admin/finance/summary", async (c) => {
  const user = await checkAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    
    let records = await kv.getByPrefix('finance:');
    
    if (from) {
      const fromTime = new Date(from).getTime();
      records = records.filter((r: any) => new Date(r.date).getTime() >= fromTime);
    }
    
    if (to) {
      const toTime = new Date(to).getTime();
      records = records.filter((r: any) => new Date(r.date).getTime() <= toTime);
    }
    
    const totalIncome = records
      .filter((r: any) => r.type === 'income')
      .reduce((sum: number, r: any) => sum + r.amount, 0);
    
    const totalExpense = records
      .filter((r: any) => r.type === 'expense')
      .reduce((sum: number, r: any) => sum + r.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // By category
    const byCategory: Record<string, { income: number; expense: number }> = {};
    records.forEach((r: any) => {
      if (!byCategory[r.category]) {
        byCategory[r.category] = { income: 0, expense: 0 };
      }
      if (r.type === 'income') {
        byCategory[r.category].income += r.amount;
      } else {
        byCategory[r.category].expense += r.amount;
      }
    });
    
    return c.json({
      totalIncome,
      totalExpense,
      balance,
      byCategory,
    });
  } catch (error) {
    console.log('Error fetching finance summary:', error);
    return c.json({ error: 'Failed to fetch finance summary' }, 500);
  }
});

Deno.serve(app.fetch);