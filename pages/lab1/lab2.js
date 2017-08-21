import {_Page} from '../../utils/debug';

import {List} from '../cs/list2.c';

_Page({
    data: {
    },
    component: {
        list1: new List(),
        list2: new List()
    },
    list1Show: function () {
        this.list1.show();
    },
    list2Show: function () {
        this.list2.show();
    },
    onLoad: function () {
        this.list1.setList([{
            name: 'lala1'
        }, {
            name: 'lala2'
        }]);
        this.list2.setList([{
            name: 'lala3'
        }, {
            name: 'lala4'
        }])
    },
    onShow: function () {
    },
    onReady: function () {
    },
    onHide: function () {
    },
    onUnload: function () {
    }

});