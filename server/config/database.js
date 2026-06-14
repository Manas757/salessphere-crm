const { Sequelize } = require('sequelize');
require('dotenv').config();

const isLocalhost = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, 
  dialectOptions: !isLocalhost ? {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  } : {}
});
module.exports = sequelize;