import {_Page, Selector} from '../../utils/c2';
_Page({
    data: {
        isShow1: false,
        isShow2: false,
        list1: [
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
        list2: [
            {
                name: 'x1'
            },
            {
                name: 'x2'
            },
            {
                name: 'x3'
            }
        ]
    },
    usingComponents: {
        'my-selector1': {
            use: '<my-selector list="{{list1}}" is-show="{{isShow1}}" bindSelect="onSelect1"></my-selector>',
            name: 'selector1Data',
            model: Selector
        },
        'my-selector2': {
            use: '<my-selector list="{{list2}}" is-show="{{isShow2}}" bindSelect="onSelect2"></my-selector>',
            name: 'selector2Data',
            model: Selector
        }
    },
    showSelector1: function () {
        this.setData({
            isShow1: true
        })
    },
    showSelector2: function () {
        this.setData({
            isShow2: true
        })
    },
    onSelect1: function (detail) {
        console.log(detail);
        this.setData({
            isShow1: false,
            selector1Selected: detail.selected
        })
    },
    onSelect2: function (detail) {
        console.log(detail);
        this.setData({
            isShow2: false,
            selector2Selected: detail.selected
        })
    },
    onLoad: function () {
    }
});