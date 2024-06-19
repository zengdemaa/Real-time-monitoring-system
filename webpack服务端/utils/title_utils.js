// 读取文件的工具和方法
const fs = require('fs')

module.exports.getFileJsonData = (filePath) => {
  //return返回一个promise对象
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (error, data) => {
      if (error) {
        // 读取文件失败
        reject(error)
      } else {
        // 读取文件成功
        resolve(data)
      }
    })
  })
}