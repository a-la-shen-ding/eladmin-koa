const Router = require('@koa/router')
const router = new Router()
const path = require('path')
const fs = require('fs')

router.get('/', ctx => {
  ctx.body = 'Hello World!'
})

fs.readFileSync(path.join(__dirname, './')
    .forEach(routePath => {
      if (routePath !== 'index.js') {
        const iRouter = require('./' + routePath)
        iRouter(router)
      }
    }))
module.exports = router