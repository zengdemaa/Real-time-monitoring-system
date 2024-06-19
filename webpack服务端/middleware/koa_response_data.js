// 处理业务逻辑，读取某个json文件的数据
const path = require('path')
const fileUtils = require('../utils/title_utils')
module.exports = async (ctx, next) => {
  // 根据url
  const url = ctx.request.url //端口之后的路径 /api/seller
  // 根据url获取文件路径
  let filePath = url.replace('/api', '')  // /seller
  filePath = '../data' + filePath + '.json' // ../data/seller.json
  filePath = path.join(__dirname, filePath)
  try {
    const ret = await fileUtils.getFileJsonData(filePath)
    ctx.response.body = ret
  } catch (error) {
    // 形成的是JSON格式的字符串
    const errorMsg ={
      message:'读取文件内容失败，文件资源不存在',
      status:404
    }
    ctx.response.body = JSON.stringify(errorMsg)
  }


  // console.log(filePath);
  // 不确定层级
  await next()
}