import {Component} from '../../utils/c1';

class List extends Component {
    constructor() {
        super();
        this.data = {
            list: [],
            isShow: false
        }
    }

    setList(list) {
        list[0].selected = true;
        this.data.list = list;
        this.updateData();
    }

    select(e) {
        let dataset = e.currentTarget.dataset;
        let name = dataset.name;
        let list = this.data.list;
        list.filter(item => item.selected).map(item => item.selected = false);
        list.filter(item => item.name === name).map(item => item.selected = true);
        this.updateData();
    }

    show() {
        this.data.isShow = !this.data.isShow;
        this.updateData();
    }
}

export {List};