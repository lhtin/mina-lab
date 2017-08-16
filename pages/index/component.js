import {list} from '../cs/list.c';
import {toast} from '../cs/toast.c';

Page({
    data: {},
    onLoad: function (options) {
        // 初始化列表组件1
        this.list1 = list.new({
            dataName: 'list1Data',
            data: [
                {name: '选择1'},
                {name: '选择2'}
            ]
        });

        // 初始化列表组件2
        this.list2 = list.new({
            dataName: 'list2Data',
            data: [
                {name: '选择3'},
                {name: '选择4'}
            ]
        });

        this.toast1 = toast.new({
            dataName: 'toastData'
        });
    },
    showToast: function () {
        this.toast1.show('我是一个5000ms的toast', 5000);
    },
    hideToast: function () {
        this.toast1.hide();
    },
    list1Show: function () {
        this.list1.show();
    },
    list2Show: function () {
        this.list2.show();
    }
});