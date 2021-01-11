const BaseController = require('./base-controller')
const MenuModel = require('../models/menu')
const { Op } = require('sequelize')
const nodeXlsx = require('node-xlsx')
const dayjs = require('dayjs')
const { Logger } = require('log4js')
class MenuController extends BaseController {
  constructor() {
    super()
    this.treeIds = new Set()
    this.childrenName = 'children'
  }
  
  async buildMenus(ctx, next) {
    let data = await this._list(ctx, { model: MenuModel, noPage: true, render: false, where: {}, order: [['menu_sort', 'asc']]})
    this.treeIds.clear()
    const result = this.buildTree(data.rows, null)
    this._success(ctx, result)
  }

  buildTree(data, pid) {
    const menuTree = []
    data.forEach(item => {
      const itemId = item.dataValues.id
      if (item.dataValues.pid === pid && !(this.treeIds.has(itemId))) {
        const valuesItem = this.menuDto(item.dataValues)
        if (!!item.dataValues.subCount) {
          valuesItem[this.childrenName] = this.buildTree(data, itemId)
        }
        this.treeIds.add(itemId)
        menuTree.push(valuesItem)
      }
    })
    return menuTree
  }

  menuDto(menu) {
    const path = menu.pid || menu.iFrame ? menu.path : (menu.path.indexOf('/') === 0 ? menu.path : '/' + menu.path)
    const resultMenu = {
      path,
      hidden: menu.hidden,
      meta: {
        title: menu.title,
        icon: menu.icon,
        noCache: !menu.cache
      }
    }
    if (!menu.iFrame) {
      resultMenu['name'] = menu.name
      resultMenu['component'] = menu.pid ? menu.component : (menu.component ? menu.component : 'Layout')
    }
    if (menu.subCount) {
      resultMenu['alwaysShow'] = true
      resultMenu.redirect = 'noRedirect'
      resultMenu[this.childrenName] = []
    }
    return resultMenu
  }

  async list(ctx, next) {
    let where = {}, noPage = false
    if (ctx.query.blurry) {
      where['title'] = { [Op.like]: `%${ctx.query.blurry}%` }
    }
    if (ctx.query.createTime) {
      where['createTime'] = { [Op.between]: ctx.query.createTime }
    }
    if (ctx.query.pid) {
      where['pid'] = ctx.query.pid
      noPage = true
    } else {
      where['pid'] = null
    }
   
    let data = await this._list(ctx, { model: MenuModel, noPage, render: false, where, order: [['menu_sort', 'asc']] })
    data.rows.forEach(item => {
      item.dataValues['hasChildren'] = !!(item.subCount > 0)
    })

    if (noPage) {
      this._success(ctx, data.rows)
      return
    }
    let result = {
      totalElements: data.count,
      content: data && data.rows || []
    }
    
    this._success(ctx, result)
  }

  async query(ctx, next) {
    if (!ctx.query.pid && '0' !== ctx.query.pid) {
      this._error(ctx, '缺少pid')
    }

    const where = {
      pid: '0' === ctx.query.pid ? null : ctx.query.pid
    }
    let data = await this._list(ctx, { model: MenuModel, noPage: true, render: false, where, order: [['menu_sort', 'asc']]})
    this._success(ctx, data.rows)
  } 

  async add(ctx, next) {
    const pid = ctx.request.body.pid
    if (pid === 0) ctx.request.body.pid = null
    ctx.request.body.createTime = ctx.request.body.createTime ? ctx.request.body.createTime : new Date(Date.now() + 8*60*60*1000)
    const result = await this._add(ctx, { model: MenuModel, where: null, render: false, ...ctx.request.body })
    if (result) {
      if (pid) {
        const updateResult = await this.updateSubCount(pid)
        if (!updateResult[0]) {
          this._error(ctx, '更新父级菜单的子菜单个数失败,请联系开发人员手动更新')
        }
      }
      this._success(ctx)
    } else {
      this._error(ctx, '新建菜单失败')
    }
  }

  async updateSubCount(pid) {
    const model = await this._find({ model: MenuModel, where: { id: pid }, render: false})
    model.dataValues.subCount++
    cosnt result = await this._update(null, { model: MenuModel, where: { menu_id: pid }, render: false, ...model.dataValues })
    if (result[0]) {
      Logger.getLogger('info').info('update menu_id=' + pid + ' sub_count ' + (model.dataValues.subCount - 1) + ' -> ' + model.dataValues.subCount + ' success')
    } else {
      Logger.getLogger('error').error('update menu_id=' + pid + ' sub_count ' + (model.dataValues.subCount - 1) + ' -> ' + model.dataValues.subCount + ' failed')
    }
    return result
  }

  async update(ctx, next) {
    if (ctx.request.body.id) {
      ctx.request.body.updateTime = ctx.request.body.updateTime ? ctx.request.body.updateTime : new Date(Date.now() + 8*60*60*1000)
      if (ctx.state.user && ctx.state.user.name) {
        data.updateBy = ctx.state.user.name
      }
      await this._update(ctx, { model: MenuModel, where: { menu_id: ctx.request.body.id }, render: false, ...ctx.request.body })
      this._success(ctx)
    } else {
      this._error(ctx, '该菜单不存在')
    }
  }

  async delete(ctx, next) {
    const ids = ctx.request.body.ids ? ctx.request.body.ids : []
    if (ids.length === 0) {
      this._error(ctx, '缺少参数')
    } else {
      let delFlag = true
      let newIds = new Set()
      try {
        for (let item of ids) {
          const menuItem = await this._find({ model: MenuModel, where: { menu_id: item }, render: false })
          if (menuItem) {
            newIds = await this.findChildIds([menuItem], newIds)
          }
        }
        for (let item of newIds) {
          const result = await this._delete(ctx, { model: MenuModel, where: { menu_id: item }, render: false })
          if (!result) delFlag = false
        }
        if (delFlag) this._success(ctx)
        else this._error(ctx, '删除失败')
      } catch(err) {
        this._error(ctx, err)
      }
    }
  }

  async findChildIds(menuList, menuSet) {
    if (menuList.length === 0) return menuSet
    for (let item of menuList) {
      const id = item.dataValues.id
      menuSet.add(id)
      const childList = await this._list({query: {}}, { model: MenuModel, noPage: true, render: false, where: {pid: id} })
      this.findChildIds(childList.rows, menuSet)
    }
    return menuSet
  }

  async download(ctx, next) {
    let where = {}
    const typeArr = ['目录', '菜单', '按钮']
    if (ctx.query.blurry) {
      where['title'] = {[Op.like]: `%${ctx.query.blurry}%`}
    }
    if (ctx.query.createTime) {
      where['createTime'] = {[Op.between]: ctx.query.createTime}
    }
    if (ctx.query.sort) {
      order = [ctx.query.sort.split(',')]
    }
    let data = await this._list(ctx, { model: MenuModel, noPage: true, render: false, where })
    let result = [['菜单名称', '菜单类型', '图标', '排序', '权限标识', '组件路径', '外链', '缓存', '可见', '创建时间']]
    data.rows.forEach(item => {
      const temp = [
        item.dataValues.title,
        typeof item.dataValues.type === 'number' ? typeArr[item.dataValues.type] : '',
        item.dataValues.icon ? item.dataValues.icon : '',
        item.dataValues.menuSort ? item.dataValues.menuSort : '',
        item.dataValues.permission ? item.dataValues.permission : '',
        typeof item.dataValues.iFrame === 'boolean' ? (item.dataValues.iFrame ? '是':'否') : '',
        typeof item.dataValues.cache === 'boolean' ? (item.dataValues.cache ? '是':'否') : '',
        typeof item.dataValues.hidden === 'boolean' ? (item.dataValues.hidden ? '是':'否') : '',
        item.dataValues.createTime
      ]
      result.push(temp)
    })

    const filename = dayjs(new Date(Date.now() + 8*60*60*1000)).format('YYYY-MM-DD') + '_菜单数据.xls'
    const file = nodeXlsx.build([{name: 'sheet1', data: result}])

    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
    ctx.set('Content-Disposition', 'attachement;filename=' + encodeURIComponent(filename))
    ctx.body = file
  }
}
const menuController = new MenuController()
module.exports = menuController