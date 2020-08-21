const wafer = require('../../vendors/wafer-client-sdk/index')
const util = require('../../utils/util.js')
const config = require('../../config');
const request = require('../../utils/requestRC.js')

const app = getApp();
Page({
  data: {
    pageName:'welcome',
    networkError: false, //网络故障
    welcomeButton: false,
    pwd: false,
    books: false,
    serverError:false, //服务器连接失败
    ifAskJoin:false,
  },

  bindKeyInput: function(e) {
    this.setData({
      inputPassword: e.detail.value
    })
  },
  
  onGotUserInfo: function(ops) {
    let that = this;
      if (ops.detail.userInfo) {
        app.globalData.authFlag = true;
        let shareInfo = this.data.shareInfo;
        
        this.getUserState(shareInfo).then(function (data) {
          app.globalData.userInfo = data.userInfo;
          app.globalData.enterStatus = data.status;
          that.enterAction(data);
        })
        this.setData({
          startButton: false,
        })
      }
  },

  onCheckPWD: function() {
    if(app.globalData.enterStatus === '3'){
      if(this.data.inputPassword == 'AaBbCcDdEe'){
        wx.switchTab({
            url: '../home/home',
        })
      }else{
        wx.showModal({
          content: '对不起，密码错误',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

            }
          }
        });
      }
      return
    }
    /*
    let that = this;
    let input={
      func:'AUTH03',//验证密码
      password: that.data.inputPassword,
    }
    request.request('/auth',input,true).then(function(data){
      if(data.msg_flag === 'E'){
        wx.showModal({
          content: '对不起，密码错误',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

            }
          }
        });
      }else{
        app.globalData.userInfo = data.data;
        wx.switchTab({
          url: '../home/home',
        })
      }
    })*/
  },

  onLoad: function(e) {
    let serverError = e.serverError;
    if(serverError){
      this.setData({
        serverError:serverError,
        errMsg:JSON.parse(e.errMsg)
      })
    }
    if(this.data.serverError){
      let errMsg = this.data.errMsg;
      let input={
        func:'EVENT01',
        errMsg:errMsg
      }
      request.request('/event',input).then(function(data){
      });
      return ;
    }
    let shareInfo = e.shareInfo;
    if(shareInfo){
      shareInfo = JSON.parse(shareInfo)
      app.globalData.shareInfo = shareInfo;
    }
    this.setData({
      shareInfo:shareInfo
    })

    console.log(__wxConfig.envVersion)
    let enVersion = __wxConfig.envVersion;
    if (!enVersion) {
      app.globalData.enterStatus = "3";
      that.setData({
        pwd: true
      })
      return;
    }

    let that = this;
    //判断用户是否授权userInfo
    app._getAuthState().then(function(state) {
      if (state) {//用户已授权。
        that.getUserState(shareInfo).then(function(data){
          if (data.status){//如果返回有值
            app.globalData.userInfo = data.userInfo;
            app.globalData.enterStatus = data.status;
            that.enterAction(data);
          }else{//返回为空
            app.globalData.enterStatus = "3";
            that.setData({
              pwd: true
            })
          }
        })
      } else {
        //用户没授权
        if(shareInfo){//如果是分享来的，提示授权。
          that.setData({
            startButton: true,
          })
        }else{//没授权过，又不是别人分享进来的，置标志位3-陌生人，需要输入密码
          app.globalData.enterStatus = "3";
          that.setData({
            pwd: true
          })
        }
      }
    }).catch(function() {
      //报错，网络故障
      that.setData({
        networkError: true
      })
    })

  },
  //登录初始化检查
  getUserState: function(shareInfo) {
    let that = this;
    return new Promise(function(resolve,reject){
      if (shareInfo) {//从分享进来
        if (app.globalData.shareTicket != null) { //从群分享进来
          //从群分享进来，先查一下群id
          app._getGroupId().then(function (groupId) {
            app.globalData.groupId = groupId;
            let input = {
              func: 'AUTH01',//获取用户状态接口
              groupId: groupId,
              shareInfo: shareInfo
            }
            request.request('/auth', input, true).then(function (res) {
              resolve(res.data)
            })
          })
        } else {//从单人会话分享进来
          let input = {
            func: 'AUTH01',//获取用户状态接口
            shareInfo: shareInfo
          }
          request.request('/auth', input, true).then(function (res) {
            resolve(res.data)
          })
        }
      } else {
        //不从分享进来，查一下用户信息
        let input = {
          func: 'AUTH01',
        }
        request.request('/auth', input, true).then(function (res) {
          resolve(res.data)
        })
      }
    })
    
  },

  onShow: function() {
    
  },

  enterAction:function(data){
    switch(data.status){
      case "0":
        if(app.globalData.groupId ===null){
          app.globalData.groupId = app.globalData.shareInfo.shareGroupId;
        }
        let groups = data.userInfo.groups;
        let curGroup = null;
        groups.forEach(function (item) {

          if (item._id == app.globalData.groupId) {
            curGroup = item;
            return;
          }
        })
        app.globalData.curGroup = curGroup;
        wx.redirectTo({
          url: '../today/today',
        })
        break;
      case "1":
       // let shareInfo = JSON.stringify(app.globalData.shareInfo)
        wx.redirectTo({
          url: '../article/article',
        })
        break;
      case "2":
        this.askIfJoin(data);
        break;
      case "5":
        wx.switchTab({
          url: '../home/home',
        })
        break;
      case "6":
        this.setData({
          pwd:true
        })
      break;
      case "7":
        wx.redirectTo({
          url: '../createGroup/createGroup',
        })
        break;
    }
  },
  askIfJoin:function(data){
    let shareGroupInfo = data.shareGroupInfo;
    shareGroupInfo.startDate = util.formatTime(new Date(shareGroupInfo.startDate));
    shareGroupInfo.endDate = util.formatTime(new Date(shareGroupInfo.endDate));

   this.setData({
     ifAskJoin:true,
     shareGroupInfo:shareGroupInfo,
   })
  },
  cancelJoin:function(){
    this.setData({
      ifAskJoin:false,
    })
    wx.redirectTo({
      url: '../article/article',
    })

  },
  confirmJoin:function(){
    let that = this;
    let input ={
      func:"GROUP07",
      groupId:app.globalData.groupId
    }
    request.request('/readingGroup',input,true).then(function(data){
      app.globalData.userInfo = data.data;
      let groups = data.data.groups;
      let curGroup = null;
      groups.forEach(function(item){
        if(item._id == app.globalData.groupId){
          curGroup = item;
          return ;
        }
      })
      app.globalData.curGroup = curGroup;
      wx.redirectTo({
        url: '../today/today',
      })
    })
    this.setData({
      ifAskJoin:false
    })
  }
})