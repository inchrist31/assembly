const app = getApp();
Component({
  properties: {
    //小程序页面的表头
    title: {
      type: String,
      default: '读经典'
    },
    //是否展示返回和主页按钮
  /*  showHomeIcon: {
      type: Boolean,
      default: false
    },*/
  },

  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    showBackIcon:false,
    showHomeIcon:false,
  },

  ready: function () {
    let pages = getCurrentPages();
    if(pages.length > 1){
      this.setData({
        showBackIcon:true
      })
    }else if(app.globalData.userInfo){
      if (pages[0].data.pageName != 'HOME' && pages[0].data.pageName != 'YEAR'){
        this.setData({
          showHomeIcon: true
        })
      }else{
        this.setData({
          showHomeIcon: false,
        })
      }
     
    }
    // 因为很多地方都需要用到，所有保存到全局对象中
    if (app.globalData && app.globalData.statusBarHeight && app.globalData.titleBarHeight) {
      this.setData({
        statusBarHeight: app.globalData.statusBarHeight,
        titleBarHeight: app.globalData.titleBarHeight
      });
    } else {
      let that = this
      wx.getSystemInfo({
        success: function (res) {
          if (!app.globalData) {
            app.globalData = {}
          }
          if (res.model.indexOf('iPhone') !== -1) {
            app.globalData.titleBarHeight = 44
          } else {
            app.globalData.titleBarHeight = 48
          }
          app.globalData.statusBarHeight = res.statusBarHeight;
          app.globalData.systemInfo = res;
          that.setData({
            statusBarHeight: app.globalData.statusBarHeight,
            titleBarHeight: app.globalData.titleBarHeight
          });
        },
        failure() {
          that.setData({
            statusBarHeight: 0,
            titleBarHeight: 0
          });
        }
      })
    }
  },

  methods: {
    headerBack() {
      wx.navigateBack({
        delta: 1,
      })
    },
    headerHome() {
      wx.switchTab({
        url: '/pages/home/home',
      })
    }
  }
})