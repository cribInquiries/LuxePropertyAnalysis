// Simple test to verify basic functionality
import { DatabaseService } from '../config/supabase';

describe('Basic Tests', () => {
  test('DatabaseService should be defined', () => {
    expect(DatabaseService).toBeDefined();
  });

  test('DatabaseService should have required methods', () => {
    expect(typeof DatabaseService.createUser).toBe('function');
    expect(typeof DatabaseService.getUserById).toBe('function');
    expect(typeof DatabaseService.getProperties).toBe('function');
    expect(typeof DatabaseService.createProperty).toBe('function');
  });

  test('Environment variables should be configured', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
