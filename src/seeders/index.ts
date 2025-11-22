import sequelize from '../config/database';
import logger from '../utils/logger';

export const runSeeders = async (): Promise<void> => {
  try {
    logger.info('Starting database seeders...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Dynamically import seeders AFTER database connection
    const { seedUsers } = await import('./01-seed-users');
    const { seedPricing } = await import('./02-seed-pricing');
    const { seedRequests } = await import('./03-seed-requests');

    // Run seeders in order
    await seedUsers();
    await seedPricing();
    await seedRequests();

    logger.info('All seeders completed successfully');
  } catch (error) {
    logger.error('Seeder execution failed');
    console.error(error);
    throw error;
  }
};

// Run seeders if executed directly
if (require.main === module) {
  runSeeders()
    .then(() => {
      logger.info('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed');
      console.error(error);
      process.exit(1);
    });
}

export default runSeeders;
