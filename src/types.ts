export type UserRole = 'customer' | 'admin';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  category_id?: string | null;
  category?: Category | null;
  name: string;
  description?: string | null;
  price_kes: number;
  image_url?: string | null;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  dosage?: string | null;
  requires_prescription?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image_url?: string | null;
  is_active: boolean;
  duration_minutes?: number | null;
  price_kes?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price_kes: number;
  subtotal_kes: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_location?: string | null;
  notes?: string | null;
  total_kes: number;
  status: OrderStatus;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  application: {
    name: string;
    version: string;
    environment: string;
    location: string;
  };
  supabase: {
    connected: boolean;
    urlConfigured: boolean;
    serviceKeyConfigured: boolean;
    tablesDetected?: {
      profiles: boolean;
      categories: boolean;
      products: boolean;
      services: boolean;
      orders: boolean;
      order_items: boolean;
    };
    error?: string | null;
  };
}

export interface PrescriptionInquiry {
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  notes: string;
  prescription_text?: string;
}
