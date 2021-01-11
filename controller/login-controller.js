const BaseController = require('./base-controller')
const UserModel = require('../models/user')
const { decrypt } = require('../utils/rsaEncrypt')
cosnt { setToken } = require('../utils/tokenVerify')

class LoginController extends BaseController {
  constructor() {
    super()
  }

  async login(ctx, next) {
    const user = await this._find({ model: UserModel, where: { username: ctx.request.body.username }, render: false})
    if (!user) {
      this._error(ctx, '该用户不存在')
      return
    }
    let token = setToken(user.username, user.id)
    if (user.password) {
      const sendPassword = ctx.request.body.password
      const resPassword = user.password
      if (decrypt(sendPassword) === decrypt(resPassword)) {
        delete user.password
        this._success(ctx, {
          token,
          user
        })
      } else {
        this._error(ctx, '用户名或密码错误')
      }
    } else {
      delete user.password
      this._success(ctx, { token, user })
    }
  }

  async logout(ctx, next) {
    this._success(ctx)
  }
}
const loginController = new LoginController()
module.exports = loginController