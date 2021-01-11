const path = require('path')
const mkdirp = require('mkdirp')
const log4js = require('log4js')
mkdirp.sync(path.join(__dirname, 'logs'))
const logjson = require(path.join(__dirname, 'config', 'log4js.json'))
const logger = log4js.configure(logjson)

module.exports = logger