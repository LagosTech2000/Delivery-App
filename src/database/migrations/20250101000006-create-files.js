'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      uploaded_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      related_to_request_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'requests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      related_to_resolution_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'resolutions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      public_url: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      file_type: {
        type: Sequelize.ENUM('product_image', 'proof_of_delivery', 'document', 'other'),
        allowNull: false,
        defaultValue: 'other',
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
    await queryInterface.addIndex('files', ['uploaded_by_user_id']);
    await queryInterface.addIndex('files', ['related_to_request_id']);
    await queryInterface.addIndex('files', ['related_to_resolution_id']);
    await queryInterface.addIndex('files', ['file_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('files');
  },
};
