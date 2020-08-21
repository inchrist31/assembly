const request = require('../../utils/requestRC.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'book'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let bookId = options.bookId;
    let bookname = options.bookname;
    that.setData({
      title:bookname,
      bookId:bookId
    })
    let input={
      func:'ARTICLE02',
      bookId:bookId
    }
    request.request('/article',input).then(function(res){
      let articleInfo = res.data;
      let pageNum = parseInt(articleInfo.pageNum);
      that.setData({
        ['articleList['+ (pageNum - 1) +']']:articleInfo.articles,
        endFlag:articleInfo.endFlag,
        pageNum:articleInfo.pageNum,
      })
    })
  },
  loadMoreArticle:function(e){
    let endFlag = this.data.endFlag;
    if(endFlag){
      return;
    }

    this.setData({
      loading:true
    })
    let that = this;
    let input={
      "func":"ARTICLE03",
      "bookId":that.data.bookId,
      "pageNum":that.data.pageNum
    }
    request.request('/article', input).then(function (res) {
      let articleInfo = res.data;
      let articleList = that.data.articleList;
      let pageNum = articleInfo.pageNum;
    //  let list = [];
    //  list['articleList[' + (pageNum - 1) + ']'] = articleInfo.articles;
      that.setData({
      //  ...list,
        ['articleList[' + (pageNum - 1) + ']']: articleInfo.articles,
        endFlag: articleInfo.endFlag,
        pageNum: articleInfo.pageNum,
        loading:false
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
    this.loadMoreArticle();
  },

})