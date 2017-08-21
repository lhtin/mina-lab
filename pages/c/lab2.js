import {_Page} from '../../utils/c1';

import {Selector} from './selector.c';

_Page({
    data: {
        list1Selected: '',
        list2Selected: ''
    },
    component: {
        list1: new Selector(), // 同时会设置 data.list1
        list2: new Selector()  // 同时会设置 data.list2
    },
    list1Show: function () {
        this.list1.show();
    },
    list2Show: function () {
        this.list2.show();
    },
    onLoad: function () {
        this.list1.on('select', (selected) => {
            console.log('onSelect', selected);
            this.setData({
                list1Selected: selected
            })
        });
        this.list1.on('show', () => {
            this.list1.reorder(12);
        });
        this.list1.setList([
            {
                name: '西兰花'
            },
            {
                name: '霉鱼'
            },
            {
                name: '土豆'
            }
        ]);
    }
});