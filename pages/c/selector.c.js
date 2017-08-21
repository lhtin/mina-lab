import {Component} from '../../utils/c1';

class Selector extends Component {
    constructor() {
        super();
        this.data = {
            selected: null,
            list: [],
            isShow: false
        }
    }

    setList(list) {
        list[0].selected = true;
        let selected = list[0];
        this.setData({
            selected: selected,
            list: list
        });
        this.emit('select', selected);
    }

    getSelected(){
        return this.data.list.filter(item => item.selected)[0];
    }

    beSelect(cb) {
        if (typeof cb !== 'function') {
            throw new Error('组件Selector的beSelect方法的参数不是函数');
        }
        this.cb = cb;
    }

    select(e) {
        let dataset = e.currentTarget.dataset;
        let name = dataset.name;
        let list = this.data.list;
        list.filter(item => item.selected).map(item => item.selected = false);
        list.filter(item => item.name === name).map(item => item.selected = true);
        this.cb && this.cb();
        let selected = this.getSelected();
        this.setData({
            selected: selected,
            list: list,
            isShow: false
        });
        this.emit('select', selected);
    }

    show() {
        this.setData({
            isShow: !this.data.isShow
        });
        if (this.data.isShow) {
            this.emit('show');
        }
    }

    reorder(amount) {
        this.setData({
            list: this.data.list.reverse()
        })
    }
}

export {Selector};