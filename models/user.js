const { INTEGER, STRING, DATE, BOOLEAN } = require('sequelize')
const sequelize = require('../db')

const UserModel = sequelize.define('user_model', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: 'user_id' },
  username: STRING(30),
  nickName: { type: STRING(30), field: 'nick_name' },
  deptId: { type: INTEGER, field: 'dept_id' },
  gender: INTEGER,
  phone: STRING(11),
  email: STRING(50),
  avatarName: { type: STRING(200), field: 'avatar_name' },
  avatarPath: { type: STRING(200), field: 'avatar_path' },
  password: STRING(200),
  isAdmin: { type: BOOLEAN, field: 'is_admin' },
  enabled: BOOLEAN,
  createBy: { type: STRING(30), field: 'create_by' },
  updateBy: { type: STRING(30), field: 'update_by' },
  createTime: { type: DATE, field: 'create_time' },
  updateTime: { type: DATE, field: 'update_time' },
  pwdResetTime: { type: DATE, field: 'pwd_reset_time' }
}, {
  timestamps: false,
  tableName: 'sys_user'
})
module.exports = UserModel