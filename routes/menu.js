const menuController = require('../controller/menu-controller')
const menuRouter = router => {
  router.get('api/menus', menuController.list)
  router.post('api/menus', menuController.add)
  router.put('api/menus', menuController.update)
  router.delete('api/menus', menuController.delete)
  router.get('api/menus/downloads', menuController.download)
}
module.exports = menuRouter