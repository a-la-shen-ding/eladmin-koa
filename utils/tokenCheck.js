const { verToken } = require('./tokenVerify')
const logger = require('../logger')
module.exports = function () {
  return async function(ctx, next) {
    logger.getLogger('info').info(`request url: ${ctx.url}, method: ${ctx.method}, body: ` + JSON.stringify(ctx.request.body))
    const token = ctx.headers.authorization
    if (token) {
      verToken)(token).then(user => {
        ctx.state = { user }
      })
      await next()
    } else {
      await next()
    }
  }
}