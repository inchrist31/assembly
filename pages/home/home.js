const request = require('../../utils/requestRC.js');
const content = require('../../db/content.js');
const app = getApp();

Page({
  data: {
    'hasMyBook': false,
    pageName:'HOME',
  },

  onLoad: function(ops) {
    this.setData({
      curUser:app.globalData.userInfo
    })
    this.getBanners();
    this.getAllCatalogues();
  },
  onShow: function(){
    if(app.globalData.enterStatus != "3"){
      this.getMyBooks();
    }
  },
  //获取banner
  getBanners: function() {
    let that = this;
    let input = {
      func: "HOME01",
      userInfo:app.globalData.userInfo,
      enterStatus:app.globalData.enterStatus,
    }
    request.request("/home", input).then(function(data) {
      if (data.msg_message ==='ERR_CHANGE_ENTER_STATUS'){
        app.globalData.enterStatus = '3';
      }
      that.setData({
        background: data.data
      })
    }).catch(function(){
      that.setData({
        background: content.BANNER
      })
    });
  },
  //获取我参与的读书
  getMyBooks: function() {
    let userInfo = app.globalData.userInfo;
    let groups = userInfo.groups;
    let content = groups;

    let ag = content;
    let ag_num = ag.length;
    let row_num = parseInt((ag_num + 1) / 2);
    let ag_all_rows = [];
    let ag_row = [];
    let i = 0;
    for (let j = 0; j < row_num; j++) {
      ag_row.push(ag[i++]);
      if (i < ag.length) {
        ag_row.push(ag[i++])
      }
      ag_all_rows.push({
        "ag_row": ag_row
      });
      ag_row = [];
    }
    let o = ag_all_rows;

    this.setData({
      'hasMyBook': true,
      'myBooks': o
    })
  },
  //获取各栏目
  getAllCatalogues: function() {
    let that = this;
    let input = {
      func: "HOME02",
      userInfo:app.globalData.userInfo,
      enterStatus:app.globalData.enterStatus
    }
    request.request("/home", input).then(function(data) {
      let content = data;
      let row_content = [];
      content.forEach(function(item) {
        let o = item;
        let ag = item.ag;
        let ag_num = ag.length;
        let row_num = parseInt((ag_num + 1) / 2);
        let ag_all_rows = [];
        let ag_row = [];
        let i = 0;
        for (let j = 0; j < row_num; j++) {
          ag_row.push(ag[i++]);
          if (i < ag.length) {
            ag_row.push(ag[i++])
          }
          ag_all_rows.push({
            "ag_row": ag_row
          });
          ag_row = [];
        }
        o.ag = ag_all_rows;
        row_content.push(o);
      })
      that.setData({
        content: row_content
      })
    }).catch(function(){
      that.setData({
        content: content.CATALOGUE
      })
    })
  },
  onReadingGroup: function(e) {
    let curGroup = e.currentTarget.dataset.curgroup;
    app.globalData.curGroup = curGroup;
    wx.navigateTo({
      url: '../today/today',
    })
  },

  onCourseList: function(e) {
    let articleId = e.currentTarget.dataset.courseid;
    let imgurl = e.currentTarget.dataset.imgurl;
    wx.navigateTo({
      url: '../article/article?articleId=' + articleId +"&from=banner&imgurl="+imgurl
    })
  },
  onArticleGroup: function(e) {
    let book = e.currentTarget.dataset.book;
    let catId = e.currentTarget.dataset.catid;
    let cattype = e.currentTarget.dataset.cattype;
    app.globalData.curBook = book;

    if (cattype == '0') {
      wx.navigateTo({
        url: '../video/video?groupId=' + book._id
      })
    } else if (cattype == '2') {
      wx.navigateTo({
        url: '../seven/seven?groupId=' + book._id + '&cattype=' + cattype
      })
    } else {
      wx.navigateTo({
        url: '../book/book?bookId=' + book._id + '&cattype=' + cattype + '&bookname=' + book.name
      })
    }

  },

  onVideoList: function() {
    wx.navigateTo({
      url: '../video/video'
    })
  },
  onGroupSetup:function(e){
    let curGroup = e.currentTarget.dataset.curgroup;
    app.globalData.curGroup = curGroup;
    wx.navigateTo({
      url: '../setting/setting',
    })
  },
  rankingList:function(e){
    let curGroup = e.currentTarget.dataset.curgroup;
    app.globalData.curGroup = curGroup;
    wx.navigateTo({
      url: '../rank/rank',
    })
  },
})