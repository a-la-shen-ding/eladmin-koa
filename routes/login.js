const loginController = require('../controller/login-controller')
const loginRouter = router => {
  router.post('api/user/login', loginController.login)
  router.delete('api/user/logout', loginController.logout)
}
module.exports = loginRouter