import {now, log, sleep_5000} from '../../utils/debug';

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