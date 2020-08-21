const request = require('../../utils/requestRC.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'rank'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let curGroup = app.globalData.curGroup;
    let that = this;
    let input={
      func:"GROUP08",
      groupId:curGroup._id,
      startDate:curGroup.startDate
    }
    request.request('/readingGroup',input).then(function(data){
      that.setData({
        ranklist:data.data
      })
    })
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

})