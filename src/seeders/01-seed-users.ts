import User from '../models/User';
import { UserRole, UserStatus, ContactMethod } from '../types';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

export const seedUsers = async (): Promise<void> => {
  try {
    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      logger.info('Users already exist, skipping seed');
      return;
    }

    const password = await bcrypt.hash('Password123!', 12);

    // Create admin user
    await User.create({
      email: 'admin@deliveryapp.com',
      password_hash: password,
      name: 'Admin User',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      email_verified: true,
      preferred_contact_method: ContactMethod.EMAIL,
      is_online: false,
      rating: null,
      total_deliveries: 0,
    });

    // Create test customers
    const customers = [
      {
        email: 'customer1@test.com',
        name: 'John Doe',
        phone: '+1234567891',
      },
      {
        email: 'customer2@test.com',
        name: 'Jane Smith',
        phone: '+1234567892',
      },
      {
        email: 'customer3@test.com',
        name: 'Bob Johnson',
        phone: '+1234567893',
      },
    ];

    for (const customer of customers) {
      await User.create({
        email: customer.email,
        password_hash: password,
        name: customer.name,
        phone: customer.phone,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        email_verified: true,
        preferred_contact_method: ContactMethod.EMAIL,
        is_online: false,
        rating: null,
        total_deliveries: 0,
      });
    }

    // Create test agents
    const agents = [
      {
        email: 'agent1@test.com',
        name: 'Agent Mike',
        phone: '+1234567894',
        rating: 4.8,
        total_deliveries: 50,
      },
      {
        email: 'agent2@test.com',
        name: 'Agent Sarah',
        phone: '+1234567895',
        rating: 4.9,
        total_deliveries: 75,
      },
      {
        email: 'agent3@test.com',
        name: 'Agent Tom',
        phone: '+1234567896',
        rating: 4.5,
        total_deliveries: 30,
      },
    ];

    for (const agent of agents) {
      await User.create({
        email: agent.email,
        password_hash: password,
        name: agent.name,
        phone: agent.phone,
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE,
        email_verified: true,
        preferred_contact_method: ContactMethod.EMAIL,
        is_online: false,
        rating: agent.rating,
        total_deliveries: agent.total_deliveries,
      });
    }

    logger.info('Users seeded successfully');
    logger.info('Test accounts created:');
    logger.info('  Admin: admin@deliveryapp.com / Password123!');
    logger.info('  Customers: customer1-3@test.com / Password123!');
    logger.info('  Agents: agent1-3@test.com / Password123!');
  } catch (error) {
    logger.error('Failed to seed users', { error });
    throw error;
  }
};

export default seedUsers;
