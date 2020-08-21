const encrypt = require('../../../utils/encrypt.js');
const util = require('../../../utils/util.js');
const request = require('../../../utils/requestRC.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'notice',
    count:0,
    hasContent: false,
    sendFlag:false,
    noticelist:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo:app.globalData.userInfo,
      curGroup:app.globalData.curGroup,
    })
    this.getAllNotices();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  bindKeyInputArea:function(e){
    let inputText = e.detail.value;
    let inputLength = inputText.length;
    let hasContent = true;
    if (inputText == '') {
      hasContent = false;
    }
    this.setData({
      msg: e.detail.value,
      count: inputLength,
      hasContent: hasContent,
    })
  },
  sendMsg:function(){
    let that = this;
    wx.showModal({
      title: '发送通知',
      content: '您确定要发送这条通知？',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.newNotice();
          that.setData({
            sendFlag:true
          })
        } else {

        }
      }
    });

    this.setData({
      sendMsgFlag:false,

    })
  },

  //funcId:NOTICE0001
  newNotice: function () {
    let that = this;
    let input={
      func:"NOTICE02",
      openId:app.globalData.userInfo.openId,
      groupId:app.globalData.curGroup._id,
      msg: encrypt.encrypt(that.data.msg, app.globalData.curGroup._id)
    }
    request.request('/notice',input).then(function(data){
      let notice = data.data;
      let noticelist = that.data.noticelist;
      let dd = new Date();
      let record = {
        '_id': notice._id,
        'groupId': app.globalData.curGroup._id,
        'openId': app.globalData.userInfo.openId,
        'content': that.data.msg,
        'status': '0',
        'timestamp': util.formatDateTime(dd)
      }
      if (noticelist.length > 0) {
        noticelist[0].status = '1';
      }
      noticelist.splice(0, 0, record);
      that.setData({
        noticelist: noticelist
      })
      wx.showToast({
        title: '发送成功',
        icon: 'success',
        duration: 1000
      });
    })
  },
  //funcId:NOTICE0002
  getAllNotices: function () {
    let that = this;
    let input={
      func:"NOTICE01",
      groupId:app.globalData.curGroup._id
    }
    request.request('/notice',input).then(function(data){
      let notices = data.data;
      let output = [];
      notices.forEach(function (item) {
        let dd = new Date(item.timestamp);
        let record = {
          '_id': item._id,
          'groupId': item.groupId,
          'openId': item.openId,
          'content': encrypt.decrypt(item.content, app.globalData.curGroup._id),
          'status': item.status,
          'timestamp': util.formatDateTime(dd)
        }
        output.push(record);
      })
      that.setData({
        noticelist: output
      })
    })
  },
  cancelNotice:function(){
    let that = this;
    wx.showModal({
      title: '取消通知',
      content: '您确定要取消这条通知？',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          let input={
            func:"NOTICE04",
            groupId:app.globalData.curGroup._id,
            openId:app.globalData.userInfo.openId,

          }
          request.request('/notice',input,true).then(function(data){
            let noticelist = that.data.noticelist;
            noticelist[0].status = '1';
            that.setData({
              noticelist: noticelist
            })
          })
        }
      }
    })
  }, 
  deleteNotice: function (e) {
    let that = this;
    let _id = e.target.dataset.id;
    let idx = e.target.dataset.idx;
    wx.showModal({
      title: '删除通知',
      content: '您确定要删除这条通知？',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          let input={
            func:"NOTICE03",
            groupId:app.globalData.curGroup._id,
            openId:app.globalData.userInfo.openId,
            id:_id
          }
          request.request('/notice',input,true).then(function(data){
            let noticelist = that.data.noticelist;
            noticelist.splice(idx, 1)
            that.setData({
              noticelist: noticelist
            })
          })
        } else {

        }
      }
    });
  },
  showDetail: function (e) {
    wx.navigateTo({
      url: './shownotice/shownotice?data=' + encodeURIComponent( e.target.dataset.content)
    })
  },
})