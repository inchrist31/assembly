const request = require('../../utils/requestRC.js');
const util = require('../../utils/util.js');
const schedule = require('../../utils/schedule.js');

const app = getApp();
Page({
  data:{
    pageName:"YEAR"
  },

  onLoad: function(ops) {
    let that = this;
    let date = new Date();
    this.setData({
      userInfo: app.globalData.userInfo,
      isCHG: false,
      ifCN: false,
      curDate: date,
      curClickDay:date.getDate(),
      enterStatus:app.globalData.enterStatus,
    })
  },

  onShow: function() {
    let that = this;
    let curDate = this.data.curDate;
    let curClickDay = this.data.curClickDay;
    that.setData({
      prevStyle:null
    })
    if(this.data.enterStatus === "3"){
      that.getSignStatusLocal(that.data.curMonthDetail);
    }else{
      that.getTaskByMonth(curDate).then(function () {
        if (curClickDay) {
          that.clickAction(parseInt(curClickDay))
        }
      });
    }
    
  },

  getTaskByMonth:function(date){
    let that = this;
    return new Promise(function(reslove,reject){
      let groups = app.globalData.userInfo.groups;
      let result = schedule.getReadingSchedule(groups, date);
      let input = {
        func: "GECORD01",
        groups: groups,
        date: date,
        articleIndexes: result,
        openId: app.globalData.userInfo.openId
      }
      request.request('/gecord', input).then(function (data) {
        let result = data.data;
        let taskInfoMonth = [];
        let dayFlag = [];


        for (let i = 0; i < result.length; i++) {
          let articleIds = result[i].articleIds;
          let gecords = result[i].gecords;

          if (dayFlag.length === 0) {
            articleIds.forEach(function (item) {
              dayFlag.push(-2);//初始化,-2-没有
            })
          }

          for (let j = 0; j < articleIds.length; j++) {
            if (articleIds[j] != -2) {
              let g = gecords.find(function (item) {
                return item.article == articleIds[j]._id;
              })
              if (g) {
                articleIds[j].finish = true;
                articleIds[j].timestamp = util.formatDateTime(new Date(g.timestamp));
                if (dayFlag[j] === -2) {
                  dayFlag[j] = 1;//1 - 完成
                }
              } else {
                if (dayFlag[j] === -2 || dayFlag[j] === 1) {
                  dayFlag[j] = 0;//0-未完成
                }
              }
            }
          }
          taskInfoMonth.push({ "articleIds": articleIds, "groupId": result[i].groupId, "book": result[i].book })
        }
        that.setData({
          dayFlag: dayFlag,
          taskInfoMonth: taskInfoMonth
        })
        let days_style = [];
        dayFlag.forEach(function (item, index) {
          if (item === 1) {
            days_style.push({
              month: 'current', day: index + 1, color: 'white', background: '#19be6b'
            })
          } else if (item === 0) {
            days_style.push({
              month: 'current', day: index + 1, color: '#495060', background: '#f8f8f9'
            })
          } else {
            days_style.push({

            })
          }
        })

        that.setData({
          days_style: days_style,
        })

        reslove(true);
      })
    })
    
  },
  prev:function(e){
   let detail = e.detail;
    let date = new Date(detail.currentYear + '-' + detail.currentMonth + '-' + '01')
    this.setData({
      days_style: [],
      curDate:date,
      curClickDay:null,
      prevStyle:null,
      curMonthDetail:detail
    })
    if(this.data.enterStatus === "3"){
      this.getSignStatusLocal(detail);
    }else{
      this.getTaskByMonth(date);
    }
    
  },
  next:function(e){ 
    let detail = e.detail;
    let date = new Date(detail.currentYear + '-' + detail.currentMonth + '-' + '01')
    this.setData({
      days_style: [],
      curDate:date,
      curClickDay:null,
      prevStyle:null,
      curMonthDetail:detail,
    })
    if(this.data.enterStatus === "3"){
      this.getSignStatusLocal(detail);
    }else{
      this.getTaskByMonth(date);
    }
    
  },

  dayClick:function(e){
    let detail = e.detail;
    this.setData({
      curClickDay:detail.day,
      curClickDetail:detail
    })
    if(this.data.enterStatus === "3"){
      this.clickActionLocal(detail);
    }else{
      this.clickAction(detail.day);
    }
    
    
  },

  clickAction:function(day){
    let prevStyle = this.data.prevStyle;
    let days_style = this.data.days_style;
    if (prevStyle) {
      days_style[prevStyle.index] = prevStyle.style;
    }
    prevStyle = {
      index: day - 1,
      style: days_style[day - 1],
    }
    let clickStyle = {
      month: 'current', day: day, color: 'white', background: '#4A6141'
    }
    days_style[day - 1] = clickStyle;
    this.setData({
      prevStyle: prevStyle,
      days_style: days_style
    })

    let taskInfoMonth = this.data.taskInfoMonth;
    let dayFlag = this.data.dayFlag;
    let groups = app.globalData.userInfo.groups;
    let output = [];
    if (dayFlag[day - 1] != -2) {
      taskInfoMonth.forEach(function (item) {
        let o = {
          book: item.book,
          groupId: item.groupId,
          articleId: item.articleIds[day - 1]
        }
        if (o.articleId != -2) {
          output.push(o);
        }
      })
    }
    this.setData({
      cardList: output
    })
  },
  
  clickActionLocal:function(detail){
    let key = detail.year + util.formatNumber(detail.month)
    let days_style = wx.getStorageSync(key);
    let clickStyle = {
      month: 'current', day: detail.day, color: 'white', background: '#4A6141'
    }
    if(!days_style){
      days_style = [];
    }
    let res = days_style.find(function(item){
      return item.day == clickStyle.day
    })
    if(!res){
      days_style.push(clickStyle)
      this.setData({
        days_style: days_style
      })
    }
  },

  gotoArticle:function(e){
    let index = parseInt(e.currentTarget.dataset.index);
    let card = this.data.cardList[index];
    let groupId = card.groupId;
    let articleId = card.articleId._id;
    let finish = card.articleId.finish;
    let readflag = "1";
    if(finish){
      readflag = "2";
    }
    let groups = app.globalData.userInfo.groups;
    let curGroup = groups.find(function(item){
      return item._id === groupId;
    })
    app.globalData.curGroup = curGroup;
    wx.navigateTo({
      url: '../today/today?articleId='+articleId + '&flag=' + readflag,
    })
  },

  onChangeName: function() {
    this.setData({
      ifCN: true,
    })
  },
  cancel: function() {
    this.setData({
      ifCN: false,
    })
  },

  confirm: function(e) {
    if (this.data.newName != '' &&
    typeof(this.data.newName)!="undefined") {
      let that = this;
      let input={
        func:"SETTING02",
        openId:app.globalData.userInfo.openId,
        newName:that.data.newName
      }
      request.request('/setting',input).then(function(data){
        app.globalData.userInfo.realName = that.data.newName;
        that.setData({
          userInfo:app.globalData.userInfo,
          ifCN:false
        })
      })
    }
  },
  setValue: function(e) {
    this.setData({
      newName: e.detail.value,
    })
  },

  onEditPersonalInfo: function (options) {
    wx.navigateTo({
      url: '../setting/user/user'
    })
  },
  signLocal:function(){
    let detail = this.data.curClickDetail;

    if(!detail){
        wx.showModal({
          content: '请先选择一个日期！',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
             
            }
          }
        });   
    }else{
      let days_style = this.data.days_style;
      let key = detail.year + util.formatNumber(detail.month);
      wx.setStorageSync(key, days_style)
      wx.showToast({
        title: '签到成功',
        icon: 'success',
        duration: 1000
      });

    }
  },
  getSignStatusLocal:function(detail){
    let value = [];
    if(!detail){
      let today = new Date()
      let key = today.getFullYear() + util.formatNumber(today.getMonth()+1)
      value = wx.getStorageSync(key);
    }else{
      let key = detail.currentYear + util.formatNumber(detail.currentMonth);
      value = wx.getStorageSync(key)
    }
    this.setData({
      days_style:value
    })
  }
})