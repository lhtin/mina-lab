import {_Page} from '../../utils/debug';

import {List} from '../cs/list2.c';

_Page({
    data: {

    },
    c: {
        list1: new List(),
        list2: new List()
    },
    onLoad: function () {
        this.c.list1.init([]);
        this.c.list2.init([]);
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