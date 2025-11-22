'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pricing_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      base_rate_national: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 10.0,
      },
      base_rate_international: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 30.0,
      },
      weight_tiers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [
          { minWeight: 0, maxWeight: 1, pricePerKg: 5 },
          { minWeight: 1, maxWeight: 5, pricePerKg: 4 },
          { minWeight: 5, maxWeight: 10, pricePerKg: 3 },
          { minWeight: 10, maxWeight: 999, pricePerKg: 2.5 },
        ],
      },
      distance_zones: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [
          { minKm: 0, maxKm: 10, pricePerKm: 2 },
          { minKm: 10, maxKm: 50, pricePerKm: 1.5 },
          { minKm: 50, maxKm: 200, pricePerKm: 1 },
          { minKm: 200, maxKm: 9999, pricePerKm: 0.8 },
        ],
      },
      type_multipliers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          product: 1.0,
          document: 0.8,
          package: 1.2,
          other: 1.0,
        },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.addIndex('pricing_rules', ['is_active']);
    await queryInterface.addIndex('pricing_rules', ['created_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pricing_rules');
  },
};
