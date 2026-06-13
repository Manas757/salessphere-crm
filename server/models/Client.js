const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  // Sequelize automatically creates an 'id' column for you!
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  pipelineStage: { 
    type: DataTypes.STRING, 
    defaultValue: 'Lead' 
  },
  sentimentStatus: { 
    type: DataTypes.STRING, 
    defaultValue: 'Interested' 
  },
  dealValue: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
},
});

module.exports = Client;