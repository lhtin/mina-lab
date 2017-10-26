import {MyComponent} from '../../libs/c/index';

const Selector = MyComponent({
    properties: {
        list: {
            type: Array,
            value: []
        }
    },
    data: {
        isShow: false,
        selectedIndex: 0
    },
    attached: function () {
        this.triggerEvent('attached', {instance: this});
    },
    ready: function () {
        this.initSelected();
    },
    methods: {
        initSelected: function () {
            console.log('initSelected invoke');
            let index = 0;
            this.setData({
                selectedIndex: index
            });
            this.triggerEvent('select', {selectedItem: this.data.list[index]});
        },
        show: function () {
            if (this.data.isShow) {
                return;
            }
            this.setData({
                isShow: true
            })
        },
        onSelect: function (e) {
            let index = e.target.dataset.index;
            if (this.data.selectedIndex !== index) {
                this.setData({
                    selectedIndex: index
                });
                this.triggerEvent('select', {selectedItem: this.data.list[index]});
            }
            this.setData({
                isShow: false
            })
        },
    }
});

export {Selector}