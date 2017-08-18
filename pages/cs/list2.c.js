import {Component} from '../../utils/debug';

let List = Component({
    init(list) {
        this.data = {
            list: list,
            isShow: false
        };
    },
    select(e) {
        let dataset = e.currentTarget.dataset;
        console.log('select: ', dataset);
        let name = dataset.name;
        let list = this.data.list;
        list.filter(item => item.selected).map(item => item.selected = false);
        list.filter(item => item.name === name).map(item => item.selected = true);
    },
    show() {
        let data = this.data;
        data.isShow = !data.isShow;
        console.log(data);
    }
});

export {List};