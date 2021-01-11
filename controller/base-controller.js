const DEFAULT_SIZE = 20
const logger = require('log4js').getLogger('info')
class BaseController {
  async _list(ctx, params) {
    const { model, render, noPage, where, order } = params
    const wheres = where || JSON.parse(decodeURI(ctx.query.where || '{}'))
    const size = parseInt(ctx.query.size || DEFAULT_SIZE)
    const page = parseInt(ctx.query.page || 1)
    const offset = (page - 1) * size
    
    let options = noPage ? { where: wheres } : { where: wheres, offset, limit:size }
    if (order) options['order'] = order
    const result = await model.findAndCountAll(options)
    if (render) this._success(ctx, result)
    else return result
  }

  async _add(ctx, params) {
    const { model, where, render, ...data } = params
    if (ctx.state.user && ctx.state.user.name) {
      data.createBy = ctx.state.user.name
    }
    const result = await model.create({ ...data })
    if (render) this._success(ctx, result)
    else return result
  }

  async _update(ctx, params) {
    const { model, where, render, ...data } = params
    if (ctx.state.user && ctx.state.user.name) {
      data.createBy = ctx.state.user.name
    }
    const result = await model.update({ ...data }, { where })
    if (render) this._success(ctx, result)
    else return result
  }

  async _delete(ctx, params) {
    const { model, where, render } = params
    const result = await model.destroy({ where, force: true })  // 硬删除
    if (render) this._success(ctx, result)
    else return result
  }

  async _find(params, ctx) {
    const { model, where, render } = params
    const result = await  model.findOne({ where })
    logger.info('find ' + JSON.stringify(where) + ': ' + JSON.stringify(result))
    if (ctx && render && result) {
      this._success(ctx, result)
    } else {
      return result
    }
  }

  _success(ctx, data) {
    ctx.body = data
  }

  _error(ctx, msg) {
    ctx.status = 500
    ctx.body = {
      code: -1,
      msg: msg || 'error'
    }
  }

  _noLogin(ctx, msg) {
    ctx.status = 401
    ctx.body = {
      code: 0,
      msg: msg || '用户未登录！'
    }
  }

  _notFound(ctx, msg) {
    ctx.throw(404, msg || 'not found')
  }
}

module.exports = BaseController