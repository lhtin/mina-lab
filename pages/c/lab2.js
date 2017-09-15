import {_Page, Selector} from '../../utils/c2';

_Page({
    data: {
        select1: {
            isShow: false,
            list: [
                {
                    name: '西兰花'
                },
                {
                    name: '霉鱼'
                },
                {
                    name: '土豆'
                }
            ],
            selected: null
        },
        select2: {
            isShow: false,
            list: [
                {
                    name: 'x1'
                },
                {
                    name: 'x2'
                },
                {
                    name: 'x3'
                }
            ],
            selected: null
        }
    },
    usingComponents: {
        'my-selector1': {
            use: '<my-selector list="{{select1.list}}" is-show="{{select1.isShow}}" bindSelect="onSelect1"></my-selector>',
            name: 'selector1Data',
            model: Selector
        },
        'my-selector2': {
            use: '<my-selector list="{{select2.list}}" is-show="{{select2.isShow}}" bindSelect="onSelect2"></my-selector>',
            name: 'selector2Data',
            model: Selector
        }
    },
    showSelector1: function () {
        this.setData({
            'a': {c: 1}
        });
        this.setData({
            'select1.isShow': true
        })
    },
    showSelector2: function () {
        this.setData({
            'select2.isShow': true
        })
    },
    onSelect1: function (detail) {
        console.log(detail);
        this.setData({
            'select1.isShow': false,
            'select1.selected': detail.selected
        })
    },
    onSelect2: function (detail) {
        console.log(detail);
        this.setData({
            'select2.isShow': false,
            'select2.selected': detail.selected
        })
    },
    onLoad: function () {
    }
});