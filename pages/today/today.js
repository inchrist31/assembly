const request = require('../../utils/requestRC.js');
const util = require('../../utils/util.js');
const encrypt = require('../../utils/encrypt.js');
const articleContent = require('../../template/articleContent/articleContent.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:"TODAYENJOY",
    currentTab:"article",
    isToday:0,//当天
    loadingFlag:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      qaFlag :app.globalData.curGroup.qa
    })

    if(!options.articleId){
      this.getTodaysArticle();
    }else{
      let readFlag = options.flag;
      let articleId = options.articleId;
      let isToday = 1;//非当天 未读
      if(readFlag==="2"){
        isToday = 2; //非当天 已读
      }

      this.setData({
        isToday:isToday,
        loadingFlag:true
      })
      this.getTodaysArticle(articleId);
    }
    this.getCurrentNotice();

    wx.showShareMenu({
      withShareTicket: true
    })
  },
  getTodaysArticle:function(articleId=""){
    let that = this;
    let curGroup = app.globalData.curGroup;
    let input = {
      func: "GROUP02",
      curGroup: curGroup,
      userInfo: app.globalData.userInfo,
      articleId:articleId
    }
    request.request('/readingGroup', input).then(function (data) {
      let article = data.data.article;
      let unReadNumber = data.data.unReadNumber;
      let articleIndex = data.data.articleIndex;
      let signFlag = data.data.signFlag;
      articleContent.articleContent(article, that);
      if(unReadNumber){
        app.globalData.curGroup.unReadNumber = unReadNumber;
      }
      that.setData({
        curArticle: article,
        unReadNumber: unReadNumber,
        articleIndex: articleIndex,
        loadingFlag:false,
        signFlag:signFlag,
        navigationTitle:article.title.substr(0,10)
      })
    })
  },
  handleTabChange:function({detail}){
    this.setData({
      currentTab: detail.key
    })
    let groupId = app.globalData.curGroup._id;
    let articleId = this.data.curArticle._id;
    let that = this;
    let input = {
      func:'GROUP04',
      groupId:groupId,
      articleId:articleId,
      startDate:app.globalData.curGroup.startDate
    }
    request.request('/readingGroup',input).then(function(data){
      that.setData({
        m1:data.data.m1,
        m2:data.data.m2,
      })
    })
  },
  onTodayEnjoy:function(){
    let signFlag = this.data.signFlag;
    if(signFlag){
      wx.showToast({
        title: '签到成功',
        icon: 'success',
        duration: 3000
      });
    }else if(this.data.curArticle._id != ""){
      let that = this;
      let input = {
        func: "GROUP03",
        groupId: app.globalData.curGroup._id,
        articleId: that.data.curArticle._id,
       // bookId: that.data.curArticle.book,
        bookId: that.data.curArticle.book._id,
        startDate: app.globalData.curGroup.startDate
      }
      request.request('/readingGroup', input, true).then(function (data) {
        wx.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 3000
        });
        app.globalData.curGroup.unReadNumber = app.globalData.curGroup.unReadNumber - 1;
        that.setData({
          signFlag:true,
          unReadNumber: app.globalData.curGroup.unReadNumber 
        })
      })
    }
    
  },
  unReadArticles:function(){
      wx.navigateTo({
        url: './history/history?articleIndex='+this.data.articleIndex,
      })
  },
  getCurrentNotice:function(){
    let that = this;
    let input={
      func:"NOTICE05",
      groupId:app.globalData.curGroup._id,
    }
    request.request('/notice',input).then(function(data){
      let notice = data.data;
      if(notice.length > 0){
        let groupId = notice[0].groupId;
        let content = notice[0].content;
        that.setData({
          noticeContent: encrypt.decrypt(content, groupId)
        })
      }else{
        that.setData({
          noticeContent: null
        })
      }
      
      
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
    this.setData({
      unReadNumber: app.globalData.curGroup.unReadNumber
    })
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
  onShareAppMessage: function (ops) {
    let book = app.globalData.curGroup.book;
    let article = this.data.curArticle;
    let shareInfo = { 
      articleId: article._id,
      book:book, 
      shareGroupId: app.globalData.curGroup._id 
    }
  
    let title = article.title;
    if (ops.from === 'button') {
      let username = app.globalData.userInfo.realName === "" ? app.globalData.userInfo.nickName : app.globalData.userInfo.realName;
      title = username + ' 邀请您一起读' + book.name;
    }
    let shareImg = book.shareImg;
    let bookImg = book.img;
    if (shareImg && shareImg.length > 0) {
      bookImg = shareImg[Math.floor(Math.random() * shareImg.length)];
    }

    return {
      title: title,
      path: '/pages/welcome/welcome?shareInfo=' + JSON.stringify(shareInfo), 
      imageUrl: bookImg,
      success: (res) => {

      },
      fail: (err) => {
        console.log('share page err:', err)
      }
    }
  },
})