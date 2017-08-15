import {component} from '../../utils/c';

let toast = component('toast', {
    init: function () {
        this.data = {
            isShow: false
        };
    },
    show: function (content, timeout = 1500) {
        clearTimeout(this.timeoutId);
        this.data.isShow = true;
        this.data.content = content;
        this.updateData();
        this.timeoutId = setTimeout(() => {
            this.data.isShow = false;
            this.updateData();
        }, timeout)
    },
    hide: function () {
        clearTimeout(this.timeoutId);
        this.data.isShow = false;
        this.updateData();
    }
});
export {toast};