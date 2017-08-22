import {_Page} from '../../utils/c1';
import {Selector} from './selector.c';
_Page({
    data: {},
    component: {
        selector1: new Selector()
    },
    selector1Show: function () {
        this.selector1.show();
    },
    onLoad: function () {
        this.selector1.on('select', (selected) => {
            console.log('onSelect', selected);
            this.setData({
                selector1Selected: selected
            })
        });
        this.selector1.setList([
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