import {list} from '../cs/list.c';
import {toast} from '../cs/toast.c';

console.log(list);
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    show: list.show, // list提供的handler
    select: list.select, // list提供的handler
    showToast: function () {
        this.xxx = (this.xxx || '') + '闻';
        this.toast1.show(this.xxx, 5000);
    },
    hideToast: toast.hide,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 初始化列表组件1
        list.new(this, {
            dataName: 'list1',
            data: [
                {name: '选择1'},
                {name: '选择2'}
            ]
        });

        // 初始化列表组件2
        list.new(this, {
            dataName: 'list2',
            data: [
                {name: '选择3'},
                {name: '选择4'}
            ]
        });

        this.toast1 = toast.new(this, {dataName: 'toastData'});
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