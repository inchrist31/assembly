const request = require("../../../utils/requestRC.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'user',
    countryIndex: 0,
    provinceIndex: 0,
    localChurchIndex: 0,
    districtIndex: 0,
    realName: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLocalityParam();
    if (app.globalData.userInfo != null) {
      this.setData({
        realName: app.globalData.userInfo.realName,
      })
    }

  },

  getLocalityParam: function () {
    let that = this;
    let input = {
      func: "PARM01",
      type_name: "local_church"
    };
    request.request("/parameter", input).then(function (data) {
      let locality = data.data;
      let countries = [];
      let provinces = [];
      let localChurches = [];
      let districts = [];
      let p = [];
      let l = [];
      let d = [];
      let countryIndex = 0;
      let provinceIndex = 0;
      let localChurchIndex = 0;
      let districtIndex = 0;

      let curUserLocality = null;
      if (app.globalData.userInfo != null) {
        curUserLocality = app.globalData.userInfo.locality;
      }

      if (locality.length > 0) {
        locality.forEach(function (item, index) {
          countries.push(item.country);
          if (curUserLocality != null) {
            if (curUserLocality.country == item.country) {
              countryIndex = index;
            }
          }
        })
        p = locality[countryIndex].province;
      }
      if (p.length > 0) {
        p.forEach(function (item, index) {
          provinces.push(item.province)
          if (curUserLocality != null) {
            if (curUserLocality.province == item.province) {
              provinceIndex = index;
            }
          }
        })
        l = p[provinceIndex].localChurch;
      }
      if (l.length > 0) {
        l.forEach(function (item, index) {
          localChurches.push(item.localChurch)
          if (curUserLocality != null) {
            if (curUserLocality.localChurch == item.localChurch) {
              localChurchIndex = index;
            }
          }
        })
        d = l[localChurchIndex].district;
      }
     
      if (d.length > 0) {
        d.forEach(function (item, index) {
          districts.push(item)
          if (curUserLocality.district != null) {
            if (curUserLocality.district == item) {
              districtIndex = index;
            }
          }
        })
      }

      that.setData({
        locality: locality,
        countries: countries,
        provinces: provinces,
        localChurches: localChurches,
        districts: districts,
        countryIndex: countryIndex,
        provinceIndex: provinceIndex,
        localChurchIndex: localChurchIndex,
        districtIndex: districtIndex
      })
    })
  },

  bindCountryChange: function (e) {
    this.setData({
      countryIndex: e.detail.value,
      provinceIndex: 0,
      localChurchIndex: 0,
      districtIndex: 0,
    })

    let countryIndex = e.detail.value;
    let locality = this.data.locality;

    let provinces = [];
    let localChurches = [];
    let districts = [];
    let p = [];
    let l = [];
    let d = [];

    p = locality[countryIndex].province;

    if (p.length > 0) {
      p.forEach(function (item) {
        provinces.push(item.province)
      })
      l = p[0].localChurch;
    }

    if (l.length > 0) {
      l.forEach(function (item) {
        localChurches.push(item.localChurch)
      })
      d = l[0].district;
    }

    if (d.length > 0) {
      d.forEach(function (item) {
        districts.push(item)
      })
    }

    this.setData({
      provinces: provinces,
      localChurches: localChurches,
      districts: districts
    })
  },
  bindProvinceChange: function (e) {
    this.setData({
      provinceIndex: e.detail.value,
      localChurchIndex: 0,
      districtIndex: 0,
    })
    let countryIndex = this.data.countryIndex;
    let provinceIndex = e.detail.value;
    let locality = this.data.locality;

    let localChurches = [];
    let districts = [];
    let l = [];
    let d = [];

    let p = locality[countryIndex].province;
    l = p[provinceIndex].localChurch;
    if (l.length > 0) {
      l.forEach(function (item) {
        localChurches.push(item.localChurch)
      })
      d = l[0].district;
    }

    if (d.length > 0) {
      d.forEach(function (item) {
        districts.push(item)
      })
    }

    this.setData({
      localChurches: localChurches,
      districts: districts
    })
  },
  bindLocalChurchChange: function (e) {
    this.setData({
      localChurchIndex: e.detail.value,
      districtIndex: 0,
    })

    let countryIndex = this.data.countryIndex;
    let provinceIndex = this.data.provinceIndex;
    let localChurchIndex = e.detail.value;
    let locality = this.data.locality;

    let districts = [];

    let d = [];

    let p = locality[countryIndex].province;
    let l = p[provinceIndex].localChurch;
    d = l[localChurchIndex].district;

    if (d.length > 0) {
      d.forEach(function (item) {
        districts.push(item)
      })
    }

    this.setData({
      districts: districts
    })
  },

  bindDistrictChange: function (e) {
    this.setData({
      districtIndex: e.detail.value
    })
  },
  bindNameInput: function (e) {
    this.setData({
      realName: e.detail.value
    })
  },

  bindUpdateLocality: function (e) {
    let country = this.data.countries[this.data.countryIndex];
    let province = this.data.provinces[this.data.provinceIndex];
    let localChurch = this.data.localChurches[this.data.localChurchIndex];
    let district = this.data.districts[this.data.districtIndex];

    let realName = this.data.realName;
    if (realName == "") {
      wx.showModal({
        content: '请输入您的姓名',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      });
    } else {
      let input = {
        func: "SETTING04",
        locality: {
          country: country,
          province: province,
          localChurch: localChurch,
          district: district
        },
        realName: realName,
      };
      request.request('/setting', input, true).then(function (res) {
        if (res.msg_flag == "N") {
          app.globalData.userInfo.locality = input.locality;
          app.globalData.userInfo.realName = input.realName;
          let pages = getCurrentPages();
          pages[pages.length - 2].setData({
            userInfo:app.globalData.userInfo
          })
          wx.navigateBack({
            delta: 1,
          })
        }
      })
    }
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