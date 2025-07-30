const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('net_project', 'postgres', 'postgres', {
  host: 'db', // همون اسمی که توی docker-compose به سرویس دیتابیس دادی
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
