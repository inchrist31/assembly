const wafer = require('../../../vendors/wafer-client-sdk/index');
const config = require('../../../config');
const util = require('../../../utils/util.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getStartDate();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getStartDate: function() {
    let that = this;
    wafer.request({
      login: false,
      url: config.service.host + '/RC/requestRC',
      method: 'POST',
      data: {
        "data": app.globalData,
        "funcId": 'GROUPS0004'
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          if (res.data != 0) {
            let startDate = res.data.startDate;
            that.setData({
              'startDate': startDate.year + '-' + startDate.month + '-' + startDate.day,
              'interval': res.data.interval,
            })
          }
        }
      }
    })
  },
  bindStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  updateStartDate: function() {
    let that = this;
    wx.showModal({
      title: '修改开始日期和推送周期',
      content: '您确定要修改开始日期和推送周期？',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          let startDate = that.data.startDate;
          let interval = that.data.interval;
          wafer.request({
            login: false,
            url: config.service.host + '/RC/requestRC',
            method: 'POST',
            data: {
              "data": {
                "app": app.globalData,
                "startDate": startDate,
                'interval': interval
              },
              "funcId": 'GROUPS0005'
            },
            success: (res) => {
              if (+res.statusCode == 200) {
                if (res.data != 0) {
                  app.globalData.startDate = res.data.startDate;
                  app.globalData.endDate = res.data.endDate;
                  app.globalData.interval = res.data.interval;
                  wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 1000
                  });
                } else {
                  wx.showToast({
                    title: '修改失败',
                    icon: 'success',
                    duration: 1000
                  });
                }
              }
            }
          })
        } else {
        }
      }
    })

  },
  bindIntervalInput: function(e) {
    this.setData({
      interval: e.detail.value
    })
  }
})