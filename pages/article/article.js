const request = require('../../utils/requestRC.js');
const articleContent = require('../../template/articleContent/articleContent.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'article',
    showHomeIcon:false,
    showBacKIcon:false,
    startSign:false,
    ifSign:false,
    curArticleId:"",
    loadingFlag:true,
    navigationTitle:"读经典"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let enterStatus = app.globalData.enterStatus;
    let shareInfo = app.globalData.shareInfo;
    let articleId = "";
    if(options.articleId){
      articleId = options.articleId
      if(options.from !='banner' && app.globalData.enterStatus != "3"){
        this.setData({
          startSign: true
        })
      }else{
        this.setData({
          bannerImg: options.imgurl
        })
      }
    }else if(shareInfo){
      articleId = shareInfo.articleId;
      if(shareInfo.bannerImg){
        this.setData({
          bannerImg: shareInfo.bannerImg
        })
      }
    }
    this.setData({
      curArticleId:articleId,
      loadingFlag:true,
    })

    this.getCurrentArticle(articleId);

    wx.showShareMenu({
      withShareTicket: true
    })
    if(app.globalData.enterStatus=="3"){
      wx.hideShareMenu()
    }
  },

  getCurrentArticle: function (id) {
    let that = this;
    let input = {
      func: "ARTICLE01",
      articleId: id
    }
    request.request('/article', input).then(function (resData) {
      let article = resData.data;
      articleContent.articleContent(article, that);
      that.setData({
        curArticle:article,
        loadingFlag:false,
        navigationTitle:article.title.substr(0,10)
      })
    })
  },

  onStartSign:function(e){
    this.setData({
      ifSign:true
    })
  },
  cancelSign:function(){
    this.setData({
      ifSign:false
    })
  },
  confirmSign:function(){
    this.setData({
      ifSign:false
    })
  },
  slider4change: function (e) {

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
    //停止播放
    articleContent.unload();
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
    let curArticle = this.data.curArticle;
    const title = curArticle.title;
    let path = '/pages/welcome/welcome';
    let bookImg= "";
   
    let shareInfo = {
      articleId: curArticle._id,
    //  book: app.globalData.curBook,
      book:curArticle.book,
      shareOpenId: app.globalData.userInfo.openId,
      bannerImg:this.data.bannerImg
    }
    if(this.data.bannerImg){
      bookImg = this.data.bannerImg;
    }else{
    //  bookImg = app.globalData.curBook.img;
      bookImg = curArticle.book.img;
    //  let shareImg = app.globalData.curBook.shareImg;
      let shareImg = curArticle.book.shareImg;
      if (shareImg && shareImg.length > 0) {
        bookImg = shareImg[Math.floor(Math.random() * shareImg.length)];
      }
    }
    
    path = path + '?shareInfo=' + JSON.stringify(shareInfo)
    
    return {
      title: title,
      path: path,
      imageUrl:bookImg,
      success: (res) => {

      },
      fail: (err) => {
        console.log('share page err:', err)
      }
    }
  }
})