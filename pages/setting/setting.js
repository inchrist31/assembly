const request = require('../../utils/requestRC.js');
const app = getApp();
Page({
  data: {
    pageName:'setting'
  },
  onLoad: function () {
    let curGroup = app.globalData.curGroup;
    let question = curGroup.qa?curGroup.qa:"1";
    this.setData({
      curGroup:curGroup,
      userInfo:app.globalData.userInfo,
      question:question
    })
    
  },
  finishGroup:function(){
    let curGroup = this.data.curGroup;
    wx.showModal({
      title: '您确定要结束本群的签到活动？',
      content: '书名：'+ curGroup.book.name,
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          let that = this;
          let input = {
            func:"SETTING03",
            groupId:app.globalData.curGroup._id,
          }
          request.request('/setting',input,true).then(function(data){
            let groups =  app.globalData.userInfo.groups;
            let newGroups = [];
            groups.forEach(function(item){
              if(item._id != app.globalData.curGroup._id){
                newGroups.push(item);
              }
            })
            app.globalData.userInfo.groups = newGroups;
            app.globalData.curGroup = null;
            wx.switchTab({
              url: '/pages/home/home',
            })
          })

        } else {
          

        }
      }
    }); 
  },
  changeQA:function(e){
    let input={
      func:"SETTING06",
      groupId:app.globalData.curGroup._id,
      bookId:app.globalData.curGroup.book._id,
      flag:e.detail.value?"0":"1"
    }
    request.request('/setting',input,true).then(function(data){
      wx.showToast({
        title: e.detail.value?'开通成功':'关闭成功',
        icon: 'success',
        duration: 1000
      });

      let userInfo = app.globalData.userInfo;
      let groups = userInfo.groups;
      let index = groups.findIndex(function(item){
        return item._id === app.globalData.curGroup._id
      })
      groups[index].qa = input.flag;
      app.globalData.userInfo.groups = groups;
    })
  }
});