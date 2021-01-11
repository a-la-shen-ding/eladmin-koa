const userController = require('../controller/user-controller')
const userRouter = router => {
  router.get('api/users', userController.list)
  router.post('api/users', userController.add)
  router.put('api/users', userController.update)
  router.delete('api/users', userController.delete)
  router.get('api/users/downloads', userController.download)
}
module.exports = userRouter