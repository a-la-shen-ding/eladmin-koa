const jwt = require('jsonwebtoken')
const config = require('../config')

exports.setToken = function(username, userid) {
  let token = null
  try {
    token = 'Bearer ' + jwt.sign({
      name: username,
      id: userid
    },
    config.secret,
    {
      expiresIn: config.expiresIn
    })
  } catch (error) {
    console.log('setToken error: ' + error)
  }
  return token
}

exports.verToken = fucntion(token) {
  return new Promise((resolve, reject) => {
    const userInfo = jwt.verify(token.split(' ')[1], config.secret)
    resolve(userInfo)
  }).catch(err => {
    console.log('verToken error: ' + err)
  })
}