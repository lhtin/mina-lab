import {component} from '../../utils/c';

let list = component('list', {
    init: function (list) {
        list[0].selected = true;
        this.data = {
            list: list,
            isShow: false
        };
    },
    select: function (e) {
        let dataset = e.currentTarget.dataset;
        console.log('select: ', dataset);
        let name = dataset.name;
        let list = this.data.list;
        list.filter(item => item.selected).map(item => item.selected = false);
        list.filter(item => item.name === name).map(item => item.selected = true);
        this.updateData();
    },
    show: function () {
        let data = this.data;
        data.isShow = !data.isShow;
        console.log(data);
        this.updateData();
    }
});
export {list};