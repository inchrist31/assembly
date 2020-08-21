const config = require('../config.js');

const upload = (addr, filePath, data = {},name='file')=>{
  let url = config.service.host + addr;
  return new Promise(function(resolve,reject){
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: name,
      formData: data,
      header: {
        'X-RC-REQUEST': 'X-RC-REQUEST'
      },
      success(res) {
        if (+res.statusCode == 200) {
          resolve(JSON.parse(res.data));
        } else {

        }
      },
      fail(err) {
        console.error(err);
        let pages = getCurrentPages();
        if (pages[pages.length - 1].data.pageName != 'welcome') {
          wx.reLaunch({
            url: '/pages/welcome/welcome?serverError=E',
          })
        } else {
          pages[pages.length - 1].setData({
            serverError: true
          })
        }
      }
    })
  })
}

module.exports = {
  upload: upload
}