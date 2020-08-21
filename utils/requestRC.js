const wafer = require('../vendors/wafer-client-sdk/index');
const config = require('../config.js');
wafer.setLoginUrl(config.service.loginUrl);

const request = (addr, data = {}, login = false) => {
  let url = config.service.host + addr;
  let interfaceData = data;
  interfaceData.version = config.current_version + '|' + __wxConfig.envVersion
  return new Promise(function (resolve, reject) {
    wafer.request({
      login: login,
      url: url,
      method: 'POST',
      data: interfaceData,
      header:{'X-RC-REQUEST':'X-RC-REQUEST'},
      success: (res) => {
        if (+res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject()
        }
      },
      fail: (err) => {
        console.error(err);
        reject()
        let pages = getCurrentPages();
        let errMsg = {
          url: url,
          input: {data,login:login},
          pageName: pages[pages.length - 1].data.pageName,
          error: err
        }
        if (pages[pages.length - 1].data.pageName != 'HOME') {
        /*  wx.reLaunch({
            url: '/pages/welcome/welcome?serverError=E&errMsg='+JSON.stringify(errMsg),
          })*/
          wx.switchTab({
            url: '/pages/home/home',
          })
        } else {
          pages[pages.length - 1].setData({
            serverError: true,
            errMsg:errMsg
          })
        }

      }
    })
  })

}

module.exports = {
  request: request
}
