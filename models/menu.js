const { INTEGER, STRING, DATE, BOOLEAN } = require('sequelize')
const sequelize = require('../db')

const MenuModel = sequelize.define('menu_model', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: 'menu_id' },
  title: STRING(30),
  name: STRING(30),
  component: STRING(30),
  icon: STRING(30),
  path: STRING(30),
  menuSort: { type: INTEGER, field: 'menu_sort' },
  pid: INTEGER,
  type: INTEGER,
  phone: STRING(11),
  email: STRING(50),
  subCount: { type: INTEGER, field: 'sub_count' },
  iFrame: { type: BOOLEAN, field: 'i_frame' },
  cache: BOOLEAN,
  hidden: BOOLEAN,
  permission: STRING(30),
  createBy: { type: STRING(30), field: 'create_by' },
  updateBy: { type: STRING(30), field: 'update_by' },
  createTime: { type: DATE, field: 'create_time' },
  updateTime: { type: DATE, field: 'update_time' }
}, {
  timestamps: false,
  tableName: 'sys_menu'
})
module.exports = MenuModel