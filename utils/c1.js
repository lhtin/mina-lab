import {EventCenter} from './EventCenter';

let cid = (() => {
    let _cid = 0;
    return () => {
        _cid += 1;
        return `cid_${_cid}`;
    }
})();

let _Page = (page) => {

    // 处理组件
    let _onLoad = page.onLoad;
    page.onLoad = function (...args) {
        console.log('在onLoad添加组件');
        Object.getOwnPropertyNames(this.component || {})
            .map((key) => {
                let instance = this.component[key];
                if (!(instance instanceof Component)) {
                    throw new Error('组件没有继承 Component 类');
                }
                instance.__init__({
                    pageCtx: this,
                    namespace: key
                });
                this[key] = instance;

                let proto = Object.getPrototypeOf(instance);
                Object.getOwnPropertyNames(proto)
                    .filter((key) => typeof proto[key] === 'function' && key !== 'constructor')
                    .map((key) => {
                        let f = proto[key];
                        let _f = this[key];
                        // 核心部分，根据cid分发回调到具体的组件实例
                        this[key] = function (...args) {
                            console.log(`回调 ${key} 被调用，参数：`, args);
                            let event = args.length > 0 ? args[0] : false;
                            let cid = event && event.currentTarget
                                && event.currentTarget.dataset
                                && event.currentTarget.dataset.cid;
                            if (instance.cid === cid) {
                                f.call(instance, ...args);
                            } else {
                                _f && _f.call(this, ...args);
                            }
                        };
                    })
            });
        console.log('添加完组件后的page：', this);
        _onLoad && _onLoad.call(this, ...args);
    };
    Page(page);
};

class Component {
    constructor() {
        this.data = this.data || {};
    }

    __init__(config) {
        this.cid = cid();
        this.pageCtx = config.pageCtx;
        this.namespace = config.namespace;
        this.eventCenter = new EventCenter();
    }

    setData(data) {
        console.log(this.data);
        let obj = {}, _data = {};
        Object.assign(this.data, data);
        Object.assign(_data, this.data);
        _data.cid = this.cid;
        obj[this.namespace] = _data;
        this.pageCtx.setData(obj);
    }

    emit(eventType, data) {
        this.eventCenter.emit(eventType, data);
    }

    on(eventType, handler) {
        this.eventCenter.on(eventType, handler);
    }
}

export {_Page, Component};