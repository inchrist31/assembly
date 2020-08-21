const wafer = require('./vendors/wafer-client-sdk/index');
var config = require('./config')
wafer.setLoginUrl(config.service.loginUrl);
const request = require('./utils/requestRC.js');

//app.js
App({
  _getGroupId:function(){
    let that = this;
    return new Promise(function(resolve,reject){
    //  request.request('/auth', { func: 'AUTH04' }, true).then(function (user) {
        wx.getShareInfo({
          shareTicket: that.globalData.shareTicket,
          sucess(res) {
          },
          fail(err) {
            console.log("getShareInfo error!", err)
          },
          complete(res) {
            let input = {
              func: 'AUTH02',
              encryptedData: res.encryptedData,
              iv: res.iv,
            }
            request.request('/auth', input,true).then(function (res) {
              resolve(res.data);
            })
          }
        })
     // })
    })
    
  },

  _getAuthState: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            that.globalData.authFlag = true;
            resolve(true)
          } else {
            resolve(false);
          }
          
        },
        fail: function (err) {
          console.log("jump failed", err)
          reject()
        },
        complete: function () {
          console.log("getAuthState complete")
        }
      })
    })
  },
  _getUserInfo: function () {
    let that = this;
    request.request('/auth', { func: 'AUTH01' }, true).then(function (user) {
    })
  },

  onLaunch: function (options) {
    this.globalData.version = __wxConfig.envVersion;

  },


  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    if (options.scene == 1044) {
      this.globalData.shareTicket = options.shareTicket
    }
  
  },

  globalData: {
    shareTicket: null,
    userInfo: null, //当前进来的用户信息
    authFlag: false,//
    groupId: null, //从群分享进入获得的群ID
    shareInfo:null, //从个人或群分享进入带的url参数
    curBook:null,//当前进入的书/视频集
    curGroup:null,//当前进入的签到组
    constant:{}, //一些常量
    version: __wxConfig.envVersion,
  }
})