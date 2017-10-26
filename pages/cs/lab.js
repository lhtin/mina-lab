import {MyPage} from '../../libs/c/index';
import {Selector} from 'Selector';

MyPage({
    data: {
        selector: {
            selected: null,
            list: []
        },
    },
    usingComponents: {
        'selector': [
            {
                use: '<my-selector list="{{selector.list}}" bindattached="selectorAttached" bindselect="selectorSelected"></my-selector>',
                name: 'selectorData',
                model: Selector
            }
        ]
    },
    selectorAttached: function (detail) {
        this.selector = detail.instance;
    },
    selectorSelected: function (detail) {
        this.setData({
            'selector.selected': detail.selectedItem
        })
    },
    showSelector: function () {
        this.selector.show();
    },
    onLoad: function () {
        this.setData({
            'selector.list': ['选项1', '选项2', '选项3']
        });
    }
});