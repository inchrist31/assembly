const request = require('../../../utils/requestRC.js');
const utils = require('../../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'input',
    inputText:"",
    inputTextLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type;//0-编辑问题，1-回答问题，2-圣徒问题，3-圣徒回答
    let articleId = options.articleId;
    let questionId = options.questionId;
    this.setData({
      type:type,
      articleId:articleId,
      questionId : questionId,
      inputHeight:type?3.3:1
    })
  },
  cancel:function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  submit:function(){
    let that =this;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let type = this.data.type;
    if(type === '0'){
      that.submitTruthQuestion(prevPage)
    }else if(type ==='2'){
      that.submitSaintQuestion(prevPage)
    }else if(type === '3'){
      that.submitSaintAnswer(prevPage)
    }
  },
  submitTruthQuestion:function(prevPage){
    let that = this;
    let articleId = that.data.articleId;
    let questionId = that.data.questionId;
    let curGroup = app.globalData.curGroup;
    let input = {
      func: 'QUESTION01',
      curGroup: curGroup,
      question: that.data.inputText,
      articleId: articleId,
      questionId: questionId,
      openId: app.globalData.userInfo.openId,
    }
    request.request('/question', input).then(function (data) {
      if (data.data._id) {
        prevPage.setData({
          truthQuestion: data.data
        })
      } else {
        let truthQuestion = prevPage.data.truthQuestion;
        truthQuestion.question = that.data.inputText;
        prevPage.setData({
          truthQuestion: truthQuestion
        })
      }
      wx.navigateBack({
        delta:1
      })
    })
  },
  submitSaintQuestion:function(prevPage){
    let that = this;
    let input = {
      func: 'QUESTION04',
      articleId: that.data.articleId,
      openId: app.globalData.userInfo.openId,
      curGroup: app.globalData.curGroup,
      question: that.data.inputText,
    }
    request.request('/question', input).then(function (data) {
      let questions = data.data;
      questions.forEach(function (item) {
        item.timestamp = utils.formatDateTime(new Date(item.timestamp))
      })
      prevPage.setData({
        questionlist: questions,
        showAskButton: false
      })
      wx.navigateBack({
        delta: 1
      })
    })
  },
  submitSaintAnswer:function(prevPage){
    let that = this;
    let input={
      func:"QUESTION07",
      questionId:that.data.questionId,
      openId:app.globalData.userInfo.openId,
      answer:that.data.inputText,
      curGroup:app.globalData.curGroup,
      articleId:that.data.articleId
    }
    request.request('/question',input).then(function(data){
      let questions = data.data;
      questions.forEach(function (item) {
        item.timestamp = utils.formatDateTime(new Date(item.timestamp))
      })
      prevPage.setData({
        questionlist: questions,
      })
      wx.navigateBack({
        delta: 1
      })
    })
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value,
      inputTextLength: e.detail.value.length
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})