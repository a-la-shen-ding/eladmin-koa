const BaseController = require('./base-controller')
const UserModel = require('../models/user')
const { encrypt } = require('../utils/rsaEncrypt')
const { Op } = require('sequelize')
const nodeXlsx = require('node-xlsx')
const dayjs = require('dayjs')
class UserController extends BaseController {
  constructor() {
    super()
  }
  async list(ctx, next) {
    let where = {}, order = null
    if (ctx.query.blurry) {
      where['username'] = { [Op.like]: `%${ctx.query.blurry}%` }
    }
    if (ctx.query.createTime) {
      where['createTime'] = { [Op.between]: ctx.query.createTime }
    }
    if (ctx.query.sort) {
      order = [ ctx.query.sort.split(',') ]
    }
   
    let data = await this._list(ctx, { model: UserModel, noPage: false, render: false, where, order })
    let result = {
      totalElements: data.count,
      content: data && data.rows || []
    }
    
    this._success(ctx, result)
  }

  async add(ctx, next) {
    ctx.request.body.password = encrypt('123456')
    ctx.request.body.createTime = ctx.request.body.createTime ? ctx.request.body.createTime : new Date(Date.now() + 8*60*60*1000)
    const findUser = await this._find({ model: UserModel, where: { username: ctx.request.body.username }})
    if (findUser) {
      this._error(ctx, '该用户已存在')
    } else {
      await this._add(ctx, { model: UserModel, where: null, render: false, ...ctx.request.body })
      this._success(ctx)
    }
  }

  async update(ctx, next) {
    if (ctx.request.body.id) {
      ctx.request.body.updateTime = ctx.request.body.updateTime ? ctx.request.body.updateTime : new Date(Date.now() + 8*60*60*1000)
      if (ctx.state.user && ctx.state.user.name) {
        data.updateBy = ctx.state.user.name
      }
      await this._update(ctx, { model: UserModel, where: { user_id: ctx.request.body.id }, render: false, ...ctx.request.body })
      this._success(ctx)
    } else {
      this._error(ctx, '该用户不存在')
    }
  }

  async delete(ctx, next) {
    const ids = ctx.request.body.ids ? ctx.request.body.ids : []
    if (ids.length === 0) {
      this._error(ctx, '缺少参数')
    } else {
      let delFlag = true
      for (let index in ids) {
        const result = await this._delete(ctx, { model: UserModel, where: { user_id: ids[index] }, render: false })
        if (!result) delFlag = false
      }
      if (delFlag) this._success(ctx)
      else this._error('删除失败')
    }
  }

  async download(ctx, next) {
    let where = {}, order = null
    if (ctx.query.blurry) {
      where['username'] = {[Op.like]: `%${ctx.query.blurry}%`}
    }
    if (ctx.query.createTime) {
      where['createTime'] = {[Op.between]: ctx.query.createTime}
    }
    if (ctx.query.sort) {
      order = [ctx.query.sort.split(',')]
    }
    let data = await this._list(ctx, { model: UserModel, noPage: true, render: false, where, order })
    let result = [['用户名', '昵称', '性别', '年龄', '电话号码', '邮箱', '上次修改密码时间', '创建时间']]
    data.rows.forEach(item => {
      const temp = [
        item.dataValues.username,
        item.dataValues.nickName ? item.dataValues.nickName : '',
        item.dataValues.gender ? item.dataValues.gender : '',
        item.dataValues.age ? item.dataValues.age : '',
        item.dataValues.phone ? item.dataValues.phone : '',
        item.dataValues.email ? item.dataValues.email : '',
        item.dataValues.pwdResetTime ? item.dataValues.pwdResetTime : '',
        item.dataValues.createTime
      ]
      result.push(temp)
    })

    const filename = dayjs(new Date(Date.now() + 8*60*60*1000)).format('YYYY-MM-DD') + '_用户数据.xls'
    const file = nodeXlsx.build([{name: 'sheet1', data: result}])

    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
    ctx.set('Content-Disposition', 'attachement;filename=' + encodeURIComponent(filename))
    ctx.body = file
  }
}
const userController = new UserController()
module.exports = userController