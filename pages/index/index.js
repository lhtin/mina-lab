import {now, log, sleep_5000} from '../../utils/debug';
let wxCharts = require('../../utils/wxcharts');

log('Page index out');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    width: 100,
    height: 100,
    initView: now()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    log('Page onLoad');

    let width = 662, height = 1014;
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        log('getSystemInfo');
        let w = res.windowWidth;
        that.setData({
          onLoad: now(),
          width: w,
          height: height / width * w
        });
      },
    });

      new wxCharts({
          animation: false,
          canvasId: 'chart',
          type: 'line',
          categories: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
          series: [{
              name: '成交量1',
              data: [0.15, 0.2, 0.45, 0.37, 0.4, 0.8, 1],
              format: function (val) {
                  return val.toFixed(2) + '万';
              }
          }, {
              name: '成交量2',
              data: [0.30, 0.37, 0.65, 0.78, 0.69, 0.94, 1],
              format: function (val) {
                  return val.toFixed(2) + '万';
              }
          }],
          yAxis: {
              title: '成交金额 (万元)',
              format: function (val) {
                  return val.toFixed(2);
              },
              min: 0
          },
          width: 300,
          height: 400
      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    log('Page onShow');
    this.setData({
      onShow: now()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    log('Page onReady');
    this.setData({
      onReady: now()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    log('Page onHide');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    log('Page onUnload')
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
  onShareAppMessage: function () {

  }
});