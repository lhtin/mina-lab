import {_Page, _Component} from './c0';

let Selector = _Component({
    properties: {
        list: {
            type: Array,
            value: [],
            observer: function (newVal, oldVal) {
                this.initList();
            }
        },
        isShow: {
            type: Boolean,
            value: false
        }
    },
    data: {},
    ready: function () {},
    methods: {
        initList: function () {
            let list = this.data.list;
            if (list && list.length > 0) {
                list[0].selected = true;
                let selected = list[0];
                this.setData({
                    selected: selected,
                    list: list
                });
                this.triggerEvent('Select', {selected});
            }
        },
        select: function (e) {
            let dataset = e.currentTarget.dataset;
            let name = dataset.name;
            let list = this.data.list;
            list.filter(item => item.selected).map(item => item.selected = false);
            list.filter(item => item.name === name).map(item => item.selected = true);
            let selected = this.data.list.filter(item => item.selected)[0];
            this.setData({
                selected: selected,
                list: list,
                isShow: false
            });
            this.triggerEvent('Select', {selected});
        }
    }
});

export {Selector, _Page};