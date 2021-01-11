const config = require('../config/db')
const logger = require('../logger').getLogger('info')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+08:00'，
  define: {
    timestamps: true,
    paranoid: false,
    createdAt: 'create_time',
    updatedAt: 'update_time'
  },
  logging: sql => {
    logger.info(sql)
  }
})
module.exports = sequelize