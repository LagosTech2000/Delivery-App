'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      claimed_by_agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      product_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      product_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      product_images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      type: {
        type: Sequelize.ENUM('product', 'document', 'package', 'other'),
        allowNull: false,
        defaultValue: 'product',
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'available',
          'claimed',
          'quoted',
          'accepted',
          'in_transit',
          'delivered',
          'cancelled',
          'rejected'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      shipping_type: {
        type: Sequelize.ENUM('national', 'international'),
        allowNull: false,
        defaultValue: 'national',
      },
      pickup_location: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      delivery_location: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      preferred_contact_method: {
        type: Sequelize.ENUM('email', 'whatsapp', 'both'),
        allowNull: false,
        defaultValue: 'email',
      },
      customer_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      claimed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create indexes
    await queryInterface.addIndex('requests', ['customer_id']);
    await queryInterface.addIndex('requests', ['claimed_by_agent_id']);
    await queryInterface.addIndex('requests', ['status']);
    await queryInterface.addIndex('requests', ['type']);
    await queryInterface.addIndex('requests', ['shipping_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('requests');
  },
};
