const config = require('../../config')
const util = require('../../utils/util.js')
const wafer = require('../../vendors/wafer-client-sdk/index');

const app = getApp();
const bgMusic = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpen: false, //播放开关
    isNT: false, //新约
    isOT: false,//旧约
    starttime: '00:00', //正在播放时长
    duration: '00:00', //总时长
   
    authFlag:true,
    groupId:'',
    loadingFlag:true,

    scriptureTitle: {
      NT: 'Reading Classic'
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let currentSelect = JSON.parse(options.date)
    let strDate = currentSelect.year + '年' + currentSelect.month + '月' + currentSelect.day + '日';
    this.setData({
      current: {
        name: strDate,
        author: 'RC',

      }
    })
    let filename = util.formatFilename(currentSelect)
    this.getScriptureTitle(filename);
    this.getHtml(filename)
    
    wx.setNavigationBarTitle({
      title: strDate,
      success: function (res) {

      }
    })
    wx.showShareMenu({
      withShareTicket: true
    })

    this.setData({
      selectedDay:currentSelect,
      groupId:app.globalData.groupId,
    })
  },

  onRead: function (day) {
   
    this.addAction('read')
  },
  onListen: function (day) {
    
    this.addAction('listen')
  },

  addAction: function (rl) {
    
    let that = this;
    wafer.request({
      login: true,
      url: config.service.host + '/RC/readListen', 
      method: 'POST',
      data: {
        'action': rl,
        'day':that.data.selectedDay ,
        'groupId': that.data.groupId,
        'openId':app.globalData.userInfo.openId
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          
        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log('addAction:',error)
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
    let date = new Date(this.data.selectedDay.month+"/"+this.data.selectedDay.day+'/'+this.data.selectedDay.year)
   
    this.getUserList(date)
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
    var imageUrl = null;
    var title = this.data.current.name;
    if (ops.from === 'button') {
      title = this.data.current.name;
      if (ops.target.id == 'read') {
        imageUrl = config.service.host + '/images/share/' + app.globalData.currentBook.bookId + '/read_add.jpg'
      } else {
        imageUrl = config.service.host + '/images/share/' + app.globalData.currentBook.bookId +'/listen_add.jpg'
      }
    }


    return {
      title: title,
      path: '/pages/welcome/welcome',
      imageUrl: imageUrl,
      success: (res) => {
       
      },
      fail: (err) => {
        console.log('share page err:',err)
      }
    }
  },
  getUserList: function (date) {
    let that = this;
    
    wafer.request({
      login: true,
      url: config.service.host + '/RC/getUserList20190520',
      method: 'POST',
      data: {
        'groupId': that.data.groupId,
        'date': date,
        'openId': '',
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          let unsignedUsers = util.getUnsignedUsers(res.data);
          
          this.setData({
            rlList: res.data.signedUsers,
            unsignedUsers: unsignedUsers
          })
          
        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log('getUserList:',error)
      }
    })
  },
  listenerButtonPlay: function () {
    this.setData({
      isOpen: true,
    })
    if (!this.data.isNT && !this.data.isOT) {
      this.playNT();
    } else {
      bgMusic.play();
    }
  },

  //暂停播放
  listenerButtonPause() {
    let that = this
    bgMusic.pause()
    that.setData({
      isOpen: false,
    })
  },
  listenerButtonStop() {
    let that = this
    bgMusic.stop()
  },

  onUnload() {
    let that = this
    that.listenerButtonStop() //停止播放
    
  },

  playNT: function () {
    let that = this
    //bug ios 播放时必须加title 不然会报错导致音乐不播  
    bgMusic.title = that.data.current.name;
    bgMusic.epname = "Reading Classic"
   // let src = config.service.host + '/audio/' + that.data.audioName;
    let src = that.data.audioName;
    console.log('sday playNT',src)
    bgMusic.src = src;

    that.setData({
      isNT: true,
    })

    bgMusic.onTimeUpdate(() => {
      //bgMusic.duration总时长  bgMusic.currentTime当前进度
      let currentTime = parseInt(bgMusic.currentTime);

      let starttime = util.formatMinSec(bgMusic.currentTime);
      let duration = util.formatMinSec(bgMusic.duration);
      that.setData({
        starttime: starttime,
        currentTime:currentTime
      })
    })
    bgMusic.onPlay(() => {
      that.setData({
        isOpen: true
      })
    })
    bgMusic.onPause(() => {
      that.setData({
        isOpen: false
      })
    })
    bgMusic.onStop(() => {
      that.setData({
        isOpen: false,
        isNT: false,
      })
    })
    //NT播放结束
    bgMusic.onEnded(() => {
      
      that.setData({
        isNT: false,
      })
    })
  },

  getScriptureTitle: function (date) {
    let that = this;
    wafer.request({
      login: false,
      url: config.service.host + '/RC/getScriptureTitle20190729',
      method: 'POST',
      data: { 'key': date, 'book': app.globalData.currentBook,},
      success: (res) => {
        if (+res.statusCode == 200) {
          console.log('sday getScripture',res.data.audioName)
          if (res.data.result) {
            that.setData({
              scriptureTitle: res.data.scriptureTitles,
              duration: util.getInitDuration(res.data.scriptureTitles.audioLength),
              audioName: res.data.audioName,
            })
          }
        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log(error.message)
      }
    })
  },
  getHtml: function (date) {
    var that = this;
    
    wx.request({
      url: config.service.host + '/RC/getHtml20190728',
      method: 'POST',
      data: {
        'book': app.globalData.currentBook,
        'date': date,
        'tm': 'NT'
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log('sday getHTML',res.data.audioName)
        let article = res.data;
        if (typeof (article.audioName) != "undefined") {
          that.setData({
            loadingFlag: false,
            ntText: article.text,
            scriptureTitle: article.scriptureTitles,
            duration: util.getInitDuration(article.scriptureTitles.audioLength),
            audioName: article.audioName,
          })
        } else {
          that.setData({
            loadingFlag: false,
            ntText: article,
          })
        }
      }
    })
  },
  slider4change: function (e) {

  },
  slider4changing: function (e) {
    let value = e.detail.value;
    bgMusic.seek(value);

  }
})