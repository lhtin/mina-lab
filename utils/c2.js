/* 解析组件使用模版，例如：
 * <my-selector list="{{myList}}" bindSelect="onSelect"></my-selector>
 * 输出为：
 * {
 *   properties: [
 *      {innerProp: 'list', outerProp: 'myList'}
 *   ],
 *   events: [
 *      {type: 'Select', handler: 'onSelect'}
 *   ]
 * }
 */

let parseUseStr = (useStr, properties) => {
    console.log(`use str: ${useStr}`);
    let clearStr = useStr.replace(/>?<\/?[a-z\-]+[\s>]|"/g, '').replace(/ +/, ' ');
    console.log(`clear str: ${clearStr}`);
    let resultStr = clearStr.replace(/-([a-z])?/g, function (match, p1) {
        console.log(`match: ${match}, p1: ${p1}`);
        return p1 ? p1.toUpperCase() : '';
    });
    console.log(`result str: ${resultStr}`);
    let items = resultStr.split(' ').map(item => item.split('='));
    console.log('items', items);
    let result = {
        properties: [],
        events: []
    };
    items.map(item => {
        console.log(item, properties, item[0]);
        if (item[0].indexOf('bind') === 0) {
            item[0] = item[0].replace('bind', '');
            result.events.push({
                type: item[0],
                handler: item[1]
            })
        } else if (properties[item[0]]) {
            let reg = /^{{[^{}]+}}$/;
            if (!(reg.test(item[1]))) {
                throw new Error(`转入的属性必须由{{和}}包围，问题出现在：${item[0]}=${item[1]}，来源：${useStr}`);
            }
            result.properties.push({
                innerProp: item[0],
                outerProp: item[1].replace(/^{{([^{}]+)}}$/, '$1')
            });

        }
    });
    console.log(result);
    return result;
};

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
        this._instances = [];

        // 劫持page的setData，当设置的data同时属于组件的输入时，需要同时设置组件中对应的data
        this.setData = function (obj, flag) {
            // 调用原生的setData
            !flag && Object.getPrototypeOf(this).setData.call(this, obj);

            // 检查properties
            Object.getOwnPropertyNames(obj)
                .map(prop => {
                    this._instances.map(instance => {
                        instance.outerProperties.map(item => {
                            if (item.outerProp === prop) {
                                instance._setProp(item.innerProp, obj[prop]);
                            }
                        })
                    });
                });
        };

        Object.getOwnPropertyNames(this.usingComponents || {})
            .map((key) => {
                let component = this.usingComponents[key];
                let instance = component.model.new({
                    pageCtx: this,
                    namespace: component.name,
                    use: component.use
                });
                this._instances.push(instance);

                let methods = Object.getPrototypeOf(instance);
                Object.getOwnPropertyNames(methods || {})
                    .map((key) => {
                        let f = methods[key];
                        let _f = this[key];
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

        this.setData(page.data, true);
        console.log('添加完组件后的page：', this);
        _onLoad && _onLoad.call(this, ...args);
    };
    Page(page);
};

let api = {
    setData: function (newData) {
        let obj = {}, data = {};
        Object.assign(this.data, newData);
        Object.assign(data, this.data);
        data.cid = this.cid;
        obj[this.namespace] = data;
        this.pageCtx.setData(obj);
    },
    triggerEvent: function (eventType, detail) {
        this.events.map(item => {
            if (item.type === eventType) {
                this.pageCtx[item.handler](detail);
            }
        });
    },
    _setProp: function (propName, data) {
        let prop = this.properties[propName];
        if (prop && prop.value !== data) {
            let oldVal = prop.value, newVal = data;
            let obj = {};
            obj[propName] = newVal;
            this.setData(obj);
            prop.value = newVal;
            if (typeof prop.observer === 'function') {
                prop.observer.call(this, newVal, oldVal);
            }
        }
    }
};
let _Component = (component) => {
    let _api = Object.assign(Object.create(api), component.methods);
    return {
        new: function (config) {
            let instance = Object.create(_api);
            let properties = {};

            // 深度复制组件的properties
            Object.getOwnPropertyNames(component.properties)
                .map((propName) => {
                    let prop = component.properties[propName];
                    let obj = {
                        type: prop.type || undefined,
                        value: JSON.parse(JSON.stringify(prop.value))
                    };
                    if (prop.observer) {
                        obj.observer = prop.observer;
                    }
                    properties[propName] = obj;
                });

            // 深度复制组件的data
            let data = JSON.parse(JSON.stringify(component.data));

            instance.pageCtx = config.pageCtx;
            instance.namespace = config.namespace;
            instance.properties = properties;
            instance.data = data;
            instance.cid = cid();

            let use = parseUseStr(config.use, properties);
            instance.events = use.events;
            instance.outerProperties = use.properties;

            instance.setData(data);
            return instance;
        }
    };

};

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
    methods: {
        initList: function () {
            let list = this.data.list;
            list[0].selected = true;
            let selected = list[0];
            this.setData({
                selected: selected,
                list: list
            });
            this.triggerEvent('Select', {selected});
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