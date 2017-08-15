// lab.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  verify: function () {
    wx.checkIsSupportSoterAuthentication({
      success: (res) => {
        // res.supportMode = ['fingerPrint']
        console.log('success');
        console.log(res);
        if (res.supportMode.length <= 0) {
        }

        wx.startSoterAuthentication({
          requestAuthModes: ['fingerPrint'],
          challenge: 'xxxxxxxxxxx',
          authContent: '请进行指纹验证',
          success: (res) => {
            console.log('success');
            console.log(res);
          },
          fail: (res) => {
            console.log('fail');
            console.log(res);
          }
        });
      },
      fail: (res) => {
        console.log('fail');
        console.log(res);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})