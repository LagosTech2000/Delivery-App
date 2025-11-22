'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: true, // Null for OAuth users
      },
      google_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      oauth_provider: {
        type: Sequelize.ENUM('google', 'local'),
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('customer', 'agent', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
        allowNull: false,
        defaultValue: 'active',
      },
      preferred_contact_method: {
        type: Sequelize.ENUM('email', 'whatsapp', 'both'),
        allowNull: false,
        defaultValue: 'email',
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      email_verification_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refresh_token_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      failed_login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      account_locked_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      skills: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      total_deliveries: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['google_id']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['is_online']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
