import Request from '../models/Request';
import User from '../models/User';
import {
  UserRole,
  RequestType,
  RequestSource,
  ShippingType,
  RequestStatus,
  ContactMethod,
} from '../types';
import logger from '../utils/logger';

export const seedRequests = async (): Promise<void> => {
  try {
    // Check if requests already exist
    const existingRequests = await Request.count();
    if (existingRequests > 0) {
      logger.info('Requests already exist, skipping seed');
      return;
    }

    // Get customers and agents
    const customers = await User.findAll({ where: { role: UserRole.CUSTOMER } });
    const agents = await User.findAll({ where: { role: UserRole.AGENT } });

    if (customers.length === 0 || agents.length === 0) {
      throw new Error('Customers or agents not found. Run user seeder first.');
    }

    const requestsData = [
      {
        customer_id: customers[0].id,
        product_name: 'iPhone 15 Pro',
        product_description: 'Latest iPhone model, 256GB, Space Black',
        product_url: 'https://www.amazon.com/example',
        type: RequestType.PRODUCT_DELIVERY,
        source: RequestSource.AMAZON,
        weight: 0.5,
        quantity: 1,
        shipping_type: ShippingType.NATIONAL,
        pickup_location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
        delivery_location: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          zipCode: '90001',
        },
        status: RequestStatus.AVAILABLE,
        preferred_contact_method: ContactMethod.EMAIL,
        customer_phone: customers[0].phone,
      },
      {
        customer_id: customers[1].id,
        product_name: 'Important Documents',
        product_description: 'Legal documents that need to be delivered',
        type: RequestType.DOCUMENT,
        source: RequestSource.OTHER,
        weight: 0.2,
        quantity: 1,
        shipping_type: ShippingType.NATIONAL,
        pickup_location: {
          address: '789 Legal Blvd',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          zipCode: '60601',
        },
        delivery_location: {
          address: '321 Court St',
          city: 'Boston',
          state: 'MA',
          country: 'USA',
          zipCode: '02101',
        },
        status: RequestStatus.CLAIMED,
        claimed_by_agent_id: agents[0].id,
        claimed_at: new Date(),
        preferred_contact_method: ContactMethod.EMAIL,
        customer_phone: customers[1].phone,
      },
      {
        customer_id: customers[2].id,
        product_name: 'Laptop Package',
        product_description: 'Dell XPS 15 laptop in original packaging',
        product_url: 'https://www.ebay.com/example',
        type: RequestType.PACKAGE,
        source: RequestSource.EBAY,
        weight: 2.5,
        quantity: 1,
        shipping_type: ShippingType.INTERNATIONAL,
        pickup_location: {
          address: '555 Tech Park',
          city: 'Seattle',
          state: 'WA',
          country: 'USA',
          zipCode: '98101',
        },
        delivery_location: {
          address: '777 Innovation Way',
          city: 'Toronto',
          state: 'ON',
          country: 'Canada',
          zipCode: 'M5H 2N2',
        },
        status: RequestStatus.IN_PROGRESS,
        claimed_by_agent_id: agents[1].id,
        claimed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        preferred_contact_method: ContactMethod.WHATSAPP,
        customer_phone: customers[2].phone,
      },
      {
        customer_id: customers[0].id,
        product_name: 'Gaming Console',
        product_description: 'PlayStation 5 with 2 controllers',
        type: RequestType.PRODUCT_DELIVERY,
        source: RequestSource.NATIONAL_STORE,
        weight: 4.5,
        quantity: 1,
        shipping_type: ShippingType.NATIONAL,
        pickup_location: {
          address: '999 Gaming St',
          city: 'Miami',
          state: 'FL',
          country: 'USA',
          zipCode: '33101',
        },
        delivery_location: {
          address: '888 Player Ave',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '73301',
        },
        status: RequestStatus.PENDING,
        preferred_contact_method: ContactMethod.EMAIL,
        customer_phone: customers[0].phone,
      },
      {
        customer_id: customers[1].id,
        product_name: 'Custom Furniture',
        product_description: 'Hand-made oak desk',
        type: RequestType.CUSTOM,
        source: RequestSource.OTHER,
        weight: 25.0,
        quantity: 1,
        shipping_type: ShippingType.NATIONAL,
        pickup_location: {
          address: '123 Craftsman Way',
          city: 'Portland',
          state: 'OR',
          country: 'USA',
          zipCode: '97201',
        },
        delivery_location: {
          address: '456 Home St',
          city: 'Denver',
          state: 'CO',
          country: 'USA',
          zipCode: '80201',
        },
        status: RequestStatus.COMPLETED,
        claimed_by_agent_id: agents[2].id,
        claimed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        preferred_contact_method: ContactMethod.EMAIL,
        customer_phone: customers[1].phone,
      },
    ];

    for (const requestData of requestsData) {
      await Request.create(requestData);
    }

    logger.info(`${requestsData.length} requests seeded successfully`);
  } catch (error) {
    logger.error('Failed to seed requests', { error });
    throw error;
  }
};

export default seedRequests;
