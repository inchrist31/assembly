const request = require('../../../utils/requestRC.js');
const app = getApp();
Page({
  data: {
    pageName:'members',
    ifCN:false
  },
  onLoad: function (e) {
    this.getMembersOfGroup()
    
  },

  onDeleteMember:function(e){
    let that = this;
    wx.showModal({
      title: '删除群成员',
      content: '您确定要将 '+e.target.dataset.name+' 和其签到记录从本群删除?',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.deleteMember(e.target.dataset.openid);
          that.getMembersOfGroup();
          
        } else {
          

        }
      }
    });
  },
  onChangeName:function(e){
    this.setData({
      openIdCN:e.target.dataset.openid,
      indexCN:e.target.dataset.index,
      ifCN:true
    })
  },
  cancel: function () {
    this.setData({
      ifCN: false,
    })
  },

  confirm: function (e) {
    if (this.data.newName != '' &&
      typeof (this.data.newName) != "undefined") {
      let that = this;
      let input={
        func:"SETTING02",
        openId:that.data.openIdCN,
        newName:that.data.newName
      }
      request.request('/setting',input).then(function(data){
        let ml = that.data.memberlist;
        ml[that.data.indexCN].realName = that.data.newName
        that.setData({
          memberlist: ml,
          ifCN: false,
        })
      })
    }
  },
  setValue: function (e) {
    this.setData({
      newName: e.detail.value,
    })
  },
 //funcId:MEMBERS0001
  getMembersOfGroup: function () {
    let that = this;
    let input = {
      func:"SETTING01",
      groupId:app.globalData.curGroup._id,
    }
    request.request('/setting',input).then(function(data){
      that.setData({
        memberlist:data.data
      })
    })
  },
  //funcId:MEMBERS0002
  deleteMember: function (openId) {
    let that = this;
    let input = {
      func:"SETTING05",
      groupId: app.globalData.curGroup._id,
      openId:openId,
    }
    request.request('/setting',input,true).then(function(data){
      that.getMembersOfGroup();
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 1000
      });
    })
  },
});