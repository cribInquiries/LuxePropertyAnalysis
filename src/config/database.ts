import { supabase, DatabaseService } from './supabase';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    logger.info('✅ Supabase database connected successfully');
  } catch (error) {
    logger.error('❌ Supabase database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    // Supabase doesn't require explicit disconnection
    logger.info('✅ Supabase database disconnected successfully');
  } catch (error) {
    logger.error('❌ Supabase database disconnection failed:', error);
    throw error;
  }
};

// Export Supabase client and database service
export { supabase, DatabaseService };
export { DatabaseService as prisma };
export default DatabaseService;
