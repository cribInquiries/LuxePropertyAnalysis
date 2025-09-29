import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://enclxnbfucvjyqzlpvtt.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY2x4bmJmdWN2anlxemxwdnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTUwNDYsImV4cCI6MjA3NDYzMTA0Nn0.Y7VOqA_RvUBeNcf2oc45_shVyQDrLXzL0iO9p2Vr-Jw';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Database service class for Supabase operations
export class DatabaseService {
  // User operations
  static async createUser(userData: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error creating user:', error);
      return { data: null, error };
    }
  }

  static async getUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error getting user:', error);
      return { data: null, error };
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error getting user by email:', error);
      return { data: null, error };
    }
  }

  static async updateUser(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error updating user:', error);
      return { data: null, error };
    }
  }

  static async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      logger.error('Error deleting user:', error);
      return { data: null, error };
    }
  }

  // Property operations
  static async createProperty(propertyData: any) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select(`
          *,
          owner:users!properties_owner_id_fkey(id, first_name, last_name, email, phone),
          agent:users!properties_agent_id_fkey(id, first_name, last_name, email, phone)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error creating property:', error);
      return { data: null, error };
    }
  }

  static async getPropertyById(id: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:users!properties_owner_id_fkey(id, first_name, last_name, email, phone),
          agent:users!properties_agent_id_fkey(id, first_name, last_name, email, phone),
          analyses:analyses(*),
          favorites:favorites(count)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error getting property:', error);
      return { data: null, error };
    }
  }

  static async getProperties(filters: any = {}, pagination: any = {}) {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:users!properties_owner_id_fkey(id, first_name, last_name, email, phone),
          agent:users!properties_agent_id_fkey(id, first_name, last_name, email, phone),
          favorites:favorites(count),
          inquiries:inquiries(count)
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,state.ilike.%${filters.search}%`);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      if (filters.zip_code) {
        query = query.eq('zip_code', filters.zip_code);
      }

      // Apply pagination
      const { page = 1, limit = 10 } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      // Apply sorting
      if (filters.sort_by) {
        const order = filters.sort_order === 'asc' ? true : false;
        query = query.order(filters.sort_by, { ascending: order });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data, error: null, count };
    } catch (error) {
      logger.error('Error getting properties:', error);
      return { data: null, error, count: 0 };
    }
  }

  static async updateProperty(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          owner:users!properties_owner_id_fkey(id, first_name, last_name, email, phone),
          agent:users!properties_agent_id_fkey(id, first_name, last_name, email, phone)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error updating property:', error);
      return { data: null, error };
    }
  }

  static async deleteProperty(id: string) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      logger.error('Error deleting property:', error);
      return { data: null, error };
    }
  }

  // Analysis operations
  static async createAnalysis(analysisData: any) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .insert([analysisData])
        .select(`
          *,
          property:properties(id, title, price, property_type),
          analyst:users!analyses_analyst_id_fkey(id, first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error creating analysis:', error);
      return { data: null, error };
    }
  }

  static async getAnalysisById(id: string) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          *,
          property:properties(id, title, price, property_type, status, address),
          analyst:users!analyses_analyst_id_fkey(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error getting analysis:', error);
      return { data: null, error };
    }
  }

  static async getAnalyses(filters: any = {}, pagination: any = {}) {
    try {
      let query = supabase
        .from('analyses')
        .select(`
          *,
          property:properties(id, title, price, property_type, status, city, state),
          analyst:users!analyses_analyst_id_fkey(id, first_name, last_name)
        `);

      // Apply filters
      if (filters.analyst_id) {
        query = query.eq('analyst_id', filters.analyst_id);
      }
      if (filters.property_id) {
        query = query.eq('property_id', filters.property_id);
      }
      if (filters.analysis_type) {
        query = query.eq('analysis_type', filters.analysis_type);
      }
      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      // Apply pagination
      const { page = 1, limit = 10 } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      return { data, error: null, count };
    } catch (error) {
      logger.error('Error getting analyses:', error);
      return { data: null, error, count: 0 };
    }
  }

  static async updateAnalysis(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          property:properties(id, title, price, property_type),
          analyst:users!analyses_analyst_id_fkey(id, first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error updating analysis:', error);
      return { data: null, error };
    }
  }

  static async deleteAnalysis(id: string) {
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      logger.error('Error deleting analysis:', error);
      return { data: null, error };
    }
  }

  // Favorite operations
  static async toggleFavorite(userId: string, propertyId: string) {
    try {
      // Check if favorite exists
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', propertyId);

        if (error) throw error;
        return { data: { isFavorited: false }, error: null };
      } else {
        // Add favorite
        const { data, error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, property_id: propertyId }])
          .select()
          .single();

        if (error) throw error;
        return { data: { isFavorited: true }, error: null };
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error);
      return { data: null, error };
    }
  }

  static async getFavorites(userId: string, pagination: any = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(
            *,
            owner:users!properties_owner_id_fkey(id, first_name, last_name, email),
            favorites:favorites(count),
            inquiries:inquiries(count)
          )
        `)
        .eq('user_id', userId)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null, count };
    } catch (error) {
      logger.error('Error getting favorites:', error);
      return { data: null, error, count: 0 };
    }
  }

  // Inquiry operations
  static async createInquiry(inquiryData: any) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select(`
          *,
          property:properties(id, title, price)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error creating inquiry:', error);
      return { data: null, error };
    }
  }

  static async getInquiries(userId: string, filters: any = {}, pagination: any = {}) {
    try {
      let query = supabase
        .from('inquiries')
        .select(`
          *,
          property:properties(id, title, price, property_type, status, images)
        `)
        .eq('user_id', userId);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { page = 1, limit = 10 } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null, count };
    } catch (error) {
      logger.error('Error getting inquiries:', error);
      return { data: null, error, count: 0 };
    }
  }

  // Message operations
  static async createMessage(messageData: any) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          property:properties(id, title, price),
          sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
          receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error creating message:', error);
      return { data: null, error };
    }
  }

  static async getMessages(userId: string, pagination: any = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('messages')
        .select(`
          *,
          property:properties(id, title, price),
          sender:users!messages_sender_id_fkey(id, first_name, last_name, email),
          receiver:users!messages_receiver_id_fkey(id, first_name, last_name, email)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null, count };
    } catch (error) {
      logger.error('Error getting messages:', error);
      return { data: null, error, count: 0 };
    }
  }

  // Storage operations for file uploads
  static async uploadFile(bucket: string, path: string, file: Buffer, options: any = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error uploading file:', error);
      return { data: null, error };
    }
  }

  static async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      logger.error('Error deleting file:', error);
      return { data: null, error };
    }
  }

  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}

export default DatabaseService;
