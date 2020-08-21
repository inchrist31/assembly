const wafer = require('../../vendors/wafer-client-sdk/index');
const config = require('../../config')
const util = require('../../utils/util.js')
const encrypt = require('../../utils/encrypt.js')

wafer.setLoginUrl(config.service.loginUrl);
//index.js
//获取应用实例
const app = getApp()
const bgMusic = wx.getBackgroundAudioManager()

Page({
  data: {
    isOpen: false, //播放开关
    isNT: false, //新约
    isOT: false, //旧约
    starttime: '00:00', //正在播放时长
    duration: '00:00', //总时长

    groupId: app.globalData.groupId,
    authFlag: true,
    loadingFlag: true,

    gsBtn1: 'gs_btn_2',
    gsBtn2: 'gs_btn_1',
    gsBtn3: 'gs_btn_1',

    scriptureTitle: {
      NT: 'Reading Classic',
      audioLength: '00:00',
    }
    
  },
  onLoad: function(options) {

    var curDate = new Date();

    var mon = curDate.getMonth() + 1;
    var year = curDate.getFullYear();
    var day = curDate.getDate();
    var strDate = year + '年' + mon + '月' + day + '日';
    
    this.setData({
      groupId:app.globalData.groupId,
      current: {
        name: strDate,
        author: 'RC',
      },
      currentDay: {
        year: year,
        month: mon,
        day: day,
      }
    })
    wx.setNavigationBarTitle({
      title: strDate,
      success: function(res) {

      }
    })
    wx.showShareMenu({
      withShareTicket: true
    })

  },
  onShow: function() {
    this.setData({
      groupId: app.globalData.groupId,
      gsBtn1: 'gs_btn_2',
      gsBtn2: 'gs_btn_1',
      gsBtn3: 'gs_btn_1',
    })

    let that = this;
    
    that.getUserList(new Date())
    let filename = util.formatFilename(that.data.currentDay)
    this.getScriptureTitle(filename);
    this.getHtml(filename);
    this.checkNotice();
    
  },

  onShareAppMessage: function(ops) {
    var imageUrl = null;
    var title = this.data.current.name;
    if (ops.from === 'button') {
      title = this.data.current.name;
      if (ops.target.id == 'read') {
        imageUrl = config.service.host + '/images/share/'+ app.globalData.currentBook.bookId+'/read_today.jpg'
      } else {
        imageUrl = config.service.host + '/images/share/' + app.globalData.currentBook.bookId+'/listen_today.jpg'
      }
    }


    return {
      title: title,
      path: '/pages/welcome/welcome',
      imageUrl: imageUrl,
      success: (res) => {

      },
      fail: (err) => {
        console.log('share err:', err)
      }
    }
  },
  onReady: function() {
   
  },
  onRead: function() {

    this.rlAction('read')
  },
  onListen: function() {

    this.rlAction('listen')
  },
  getUserList: function(date) {
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
            unsignedUsers:unsignedUsers
          })

        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log('getUserList error:', error)
      }
    })
  },
  rlAction: function(rl) {
    wafer.request({
      login: false,
      url: config.service.host + '/RC/readListen',
      method: 'POST',
      data: {
        'action': rl,
        'day': this.data.currentDay,
        'groupId': this.data.groupId,
        'openId':app.globalData.userInfo.openId,
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          
        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log('rlAction:', error)
      }
    })
  },

  //获取文章内容
  getHtml: function(date) {
    let that = this;
    let tm = '';
    
    wx.request({
      url: config.service.host + '/RC/getHtml20190728',
      method: 'POST',
      data: {
        'book':app.globalData.currentBook,
        'date': date,
        'tm': 'NT'
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        let article = res.data;
        console.log('getHTML',res.data.audioName)
        if(typeof(article.audioName)!="undefined"){
          that.setData({
            loadingFlag: false,
            ntText: article.text,
            scriptureTitle: article.scriptureTitles,
            duration: util.getInitDuration(article.scriptureTitles.audioLength),
            audioName:article.audioName,
          })
        }else{
          that.setData({
            loadingFlag: false,
            ntText: article,
          })
        }
        
      }
    })
    
  },

  listenerButtonPlay: function() {
    this.setData({
      isOpen: true,
    })
    if (!this.data.isNT) {
      this.playNT();
    } else {
      bgMusic.play()
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

  playNT: function() {
    let that = this
    //bug ios 播放时必须加title 不然会报错导致音乐不播  
    bgMusic.title = that.data.current.name;
    bgMusic.epname = "Reading Classic"
   // let src = config.service.host + '/audio/' + that.data.audioName;
    
    let src = that.data.audioName;
    console.log('playNT',src)
    bgMusic.src = src;

    that.setData({
      isNT: true,
    })

    bgMusic.onTimeUpdate(() => {
      //bgMusic.duration总时长  bgMusic.currentTime当前进度
      let currentTime = parseInt(bgMusic.currentTime);

      let starttime = util.formatMinSec(bgMusic.currentTime);

      let duration = parseInt(bgMusic.duration);

      that.setData({
        starttime: starttime,
        currentTime: currentTime,
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
    //播放结束
    bgMusic.onEnded(() => {

      that.setData({
        isNT: false,
        isOpen: false
      })
    })
  },

  //获取标题
  getScriptureTitle: function(date) {
    let that = this;
    wafer.request({
      login: false,
      url: config.service.host + '/RC/getScriptureTitle20190729',
      method: 'POST',
      data: {
        'key': date,
        'book': app.globalData.currentBook,
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          if(res.data.result){
            console.log('getScriptureTitle',res.data.audioName)
            that.setData({
              scriptureTitle: res.data.scriptureTitles,
              duration: util.getInitDuration(res.data.scriptureTitles.audioLength),
              audioName:res.data.audioName,
            })
          }
        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log('getScriptureTitle:', error)
      }
    })
  },
  slider4change: function(e) {

  },
  slider4changing: function(e) {
    let value = e.detail.value;
    bgMusic.seek(value);

  },
  onGsToday: function() {
    if (this.data.gsBtn1 == 'gs_btn_1') {
      this.setData({
        gsBtn1: 'gs_btn_2',
        gsBtn2: 'gs_btn_1',
        gsBtn3: 'gs_btn_1'
      })
      this.getUserList(new Date())
    }
  },
  onGsCurMon: function() {
    if (this.data.gsBtn2 == 'gs_btn_1') {
      this.setData({
        gsBtn2: 'gs_btn_2',
        gsBtn1: 'gs_btn_1',
        gsBtn3: 'gs_btn_1',
      })
      this.getGsCurMon(0, this.currentDay)
    }

  },
  onGsAllYear: function() {
    if (this.data.gsBtn3 == 'gs_btn_1') {
      this.setData({
        gsBtn3: 'gs_btn_2',
        gsBtn1: 'gs_btn_1',
        gsBtn2: 'gs_btn_1',
      })
      this.getGsCurMon(1, this.currentDay)
    }
  },
  //获取本月或本年的统计数据
  getGsCurMon: function(flag, date) {
    let that = this;
    wafer.request({
      login: true,
      url: config.service.host + '/RC/getGsCurMon20190805',
      method: 'POST',
      data: {
        'groupId': that.data.groupId,
        'flag': flag,
        'date': that.data.currentDay,
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          if (flag == 0) {
            
            this.setData({
              gsMon: res.data
            })
          } else {
            this.setData({
              gsYear: res.data
            })
          }
        } else {
          console.log(res.statusCode)
        }
      },
      fail: (error) => {
        console.log('getGsCurMon error:', error)
      }
    })
  },
  checkNotice:function(){
    let that = this;

    wafer.request({
      login: false,
      url: config.service.host + '/RC/requestRCNotice',
      method: 'POST',
      data: {
        'data':app.globalData,
        'funcId':'NOTICE0003'
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          that.setData({
            notice:res.data
          })
        } 
      
      }
    })
  },
  showDetail:function(e){
    let message = this.data.notice[0];
    message = encrypt.decrypt(message.content,app.globalData.groupId)
    wx.navigateTo({
      url: '../setting/notice/shownotice/shownotice?data=' + encodeURIComponent(message)
    })
  }
})