const request = require('../../utils/requestRC.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'createGroup',
    letterNo:0,
    startDate: util.formatTime(new Date()),
    showTopTips: false,
    auths: [
      "所有人可加入",
      "仅群成员可加入"
    ],
    inputNumber: [0, 0],
    radioIntervalSelectedIndex: 0,
    radioInterval: [
      { name: '每', value: '0', checked: true, nflag: true, desc: "天一篇" },
      { name: '每周', value: '1', checked: false, nflag: true, desc: "篇(填6以下)" },
      { name: '一年一遍', value: '2', checked: false, nflag: false, desc: "循环" }
    ],
    ruleText:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let groupId = app.globalData.groupId;
    let shareInfo = app.globalData.shareInfo;
    this.setData({
      shareInfo:shareInfo,
      groupId:groupId
    })
    
    let that = this;
    let input={
      func:'GROUP06',
      groupId:groupId,
      userInfo:app.globalData.userInfo
    }
    request.request('/readingGroup',input).then(function(data){
      if(data.msg_flag ==='E'){
        let curSign = data.data.curSign;
        wx.showModal({
          content: '本群已经有正在进行中的读书签到活动\n  书名:' + curSign.book.name + '  \n结束日期:' + util.formatTime(new Date(curSign.endDate)) + ' \n管理员:' + curSign.manager.nickName,
            showCancel: false,
            success: function (res) {
                if (res.confirm) {
                  app.globalData.userInfo = data.data.user;
                    wx.switchTab({
                      url: '../home/home',
                    })
                }
            }
        });
      }
    })
  },
  bindDateChange: function (e) {
    this.setData({
      startDate: util.formatTime(new Date(e.detail.value))
    })
  },
  bindPlanChange: function (e) {
    this.setData({
      planIndex: e.detail.value
    })
  },
  bindAuthChange: function (e) {
    this.setData({
      authIndex: e.detail.value
    })
  },
  radioChange: function (e) {
    let radioInterval = this.data.radioInterval;
    for (var i = 0, len = radioInterval.length; i < len; ++i) {
      radioInterval[i].checked = radioInterval[i].value == e.detail.value;
      if (radioInterval[i].checked) {
        this.setData({
          radioIntervalSelectedIndex: i
        })
      }
    }

    this.setData({
      radioInterval: radioInterval
    });
  },
  handleNoChange: function (e) {
    let nIndex = e.currentTarget.dataset.nindex;
    let inputNumber = this.data.inputNumber;
    inputNumber[parseInt(nIndex)] = e.detail.value;
    this.setData({
      inputNumber: inputNumber
    })
  },
  bindRuleInput:function(e){
    let ruleText = e.detail.value;
    this.setData({
      ruleText:ruleText,
      letterNo:ruleText.length,
    })
  },
  submitNewGroup: function () {
    let errMsg = "";
    this.setData({
      showTopTips: false,
      errMsg: errMsg
    })

    let checkFlag = true;

    let radioIntervalSelectedIndex;
    let inputNumberValue;

    if (checkFlag) {
      radioIntervalSelectedIndex = this.data.radioIntervalSelectedIndex;

      let nflag = this.data.radioInterval[radioIntervalSelectedIndex].nflag;
      inputNumberValue = this.data.inputNumber[this.data.radioInterval[radioIntervalSelectedIndex].value];
      if (nflag) {
        if (inputNumberValue == 0) {
          errMsg = "周期不能为0"
          checkFlag = false
        }
      }
    }
    if(checkFlag && this.data.ruleText===''){
      checkFlag = false;
      errMsg = "请输入签到规则";
    }
    
    
    if (!checkFlag) {
      this.setData({
        showTopTips: true,
        errMsg: errMsg
      })
    } else {
      let input = {
        func: "GROUP01",
        startDate: this.data.startDate,
        planType: radioIntervalSelectedIndex,
        interval: inputNumberValue,
        ruleText:this.data.ruleText,
        book:app.globalData.shareInfo.book,
        groupId:app.globalData.groupId,
      }
      request.request('/readingGroup',input,true).then(function(data){
        app.globalData.userInfo = data.data;
        wx.switchTab({
          url: '../home/home',
        })
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      topTipsPadding: app.globalData.statusBarHeight + app.globalData.titleBarHeight
    })
      
    
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