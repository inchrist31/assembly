const wafer = require('../../../vendors/wafer-client-sdk/index');
const config = require('../../../config');
const util = require('../../../utils/util.js')
const app=getApp();
Page({
  
  onLoad: function () {
    this.getGroupList();
    
  },
  deleteGroup:function(e){
    let that = this;
    wx.showModal({
      title: '删除群组',
      content: '您确定要将群'+ e.target.dataset.groupid +'和其成员的记录删除?',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击主操作')
          
          wafer.request({
            login: false,
            url: config.service.host + '/RC/requestRC',
            method: 'POST',
            data: {
              "data": {"app":app.globalData,'groupId':e.target.dataset.groupid},
              "funcId": 'GROUPS0002'
            },
            success: (res) => {
              if (+res.statusCode == 200) {
                if(res.data == "1"){
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 1000
                  });
                  that.getGroupList();
                }
                
              }
            }
          })

        } else {
          console.log('用户点击辅助操作')

        }
      
      }
  })
  },
  getGroupList:function(){
    let that = this;
    wafer.request({
      login: false,
      url: config.service.host + '/RC/requestRC',
      method: 'POST',
      data: {
        "data": app.globalData,
        "funcId": 'GROUPS0001'
      },
      success: (res) => {
        if (+res.statusCode == 200) {
          let groups = [];

          res.data.forEach(function (item) {
            let record = {
              "avatarUrl": '',
              "groupId": item.groupId,
              "name": 'N/A',
              "time": util.formatDateTime(new Date(item.timestamp)),
              "bookType": item.bookType,
              "pwd": 'N/A',
              "bookName": 'N/A',
            }
            if (typeof (item.manager) != 'undefined') {
              record.avatarUrl = item.manager.avatarUrl;
              record.name = item.manager.realName == '' ? item.manager.nickName : item.manager.realName;
            }
            if (typeof (item.password) != 'undefined') {
              record.pwd = item.password;
            }
            if (typeof (item.book) != 'undefined') {
              record.bookName = item.book.bookName;
            }
            groups.push(record);
          })
          that.setData({
            groups: groups
          })

        }
      }
    })
  }
});