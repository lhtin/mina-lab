import {_Page, sleep_3000} from '../../utils/debug';

let app = getApp();
_Page({

    /**
     * 页面的初始数据
     */
    data: {
        ifHideCanvas: false,
        hideCanvas: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    drawCanvas: function () {
        let context = wx.createCanvasContext('lab-canvas')

        // context.setStrokeStyle("#00ff00")
        // context.setLineWidth(5)
        // context.rect(0, 0, 200, 200)
        // context.stroke()
        context.setStrokeStyle("#ff0000")
        context.setLineWidth(2)
        context.moveTo(160, 100)
        context.arc(100, 100, 60, 0, 2 * Math.PI, true)
        context.moveTo(140, 100)
        context.arc(100, 100, 40, 0, Math.PI, false)
        context.moveTo(85, 80)
        context.arc(80, 80, 5, 0, 2 * Math.PI, true)
        context.moveTo(125, 80)
        context.arc(120, 80, 5, 0, 2 * Math.PI, true)
        context.stroke();
        context.draw();
    },
    toggleCanvas1: function () {
        this.setData({
            ifHideCanvas: !this.data.ifHideCanvas
        });
        console.log(`wx:if ${this.data.ifHideCanvas}`);
        console.log(`hidden ${this.data.hideCanvas}`);
    },
    toggleCanvas2: function () {
        this.drawCanvas();
        this.toggleCanvas1();
    },
    toggleCanvas1_hidden: function () {
        this.setData({
            hideCanvas: !this.data.hideCanvas
        });
        console.log(`wx:if ${this.data.ifHideCanvas}`);
        console.log(`hidden ${this.data.hideCanvas}`);
    },
    toggleCanvas2_hidden: function () {
        this.drawCanvas();
        this.toggleCanvas1_hidden();
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
        if (app.globalData.needBack) {
            wx.navigateTo({url: '/pages/lab1/index'});
            sleep_3000('/pages/lab1/lab onShow');
        }

        this.drawCanvas()
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