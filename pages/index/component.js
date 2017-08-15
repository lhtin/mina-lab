import {list} from '../cs/list.c';
import {toast} from '../cs/toast.c';

Page({

    /**
     * 页面的初始数据
     */
    data: {},
    onLoad: function (options) {
        // 初始化列表组件1
        list.new(this, {
            dataName: 'list1Data',
            data: [
                {name: '选择1'},
                {name: '选择2'}
            ]
        });

        // 初始化列表组件2
        list.new(this, {
            dataName: 'list2Data',
            data: [
                {name: '选择3'},
                {name: '选择4'}
            ]
        });

        this.toast1 = toast.new(this, {dataName: 'toastData'});
    },
    showToast: function () {
        this.xxx = (this.xxx || '') + '闻';
        this.toast1.show(this.xxx, 5000);
    }
})