const Koa = require('koa')
const config = require('./config')
const app = new Koa()

// 设置cors
const cors = require('@koa/cors')
app.use(cors({
  credentials: true
}))

// ctx.body
const body = require('koa-boty')
app.use(body({
  strict: false // 解析GET、HEAD、DELETE请求
}))

// 设置日志
const logger = require('./logger')
app.logger = logger

// 设置jwt
if (config.jwt) {
  const jwt = require('koa-jwt')
  app.use(jwt({ secret: config.secret }).unless({
    path: [/^\/api\/user\/login/]
  }))
}

const tokenCheck = require('./utils/tokenCheck')
app.use(tokenCheck())

// 设置路由
const router = require('./routes')
app.use(router.routes()).use(router.allowedMethods())

// 启动app
app.listen(config.port, _ => {
  console.log(`eladmin-koa app is going to be running on port ${config.port}`)
})