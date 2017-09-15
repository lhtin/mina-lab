let wxPage = Page;

/**
 * a.b[0].c[156][19].d -> ['a', 'b', '0', 'c', '156', '19', 'd']
 * @param key{string}
 * @returns {Array}
 */
function _getList(key) {
    let list = [];
    let at = 0;
    let pre = '.'; // 上下文
    for (let i = 0, len = key.length; i < len; i += 1) {
        let c = key[i];
        if (pre === '.') {
            // 之前是.，表示接下来是一个属性名，属性名开头要满足要求
            if (/[$_a-zA-Z]/.test(c)) {
                pre = '.a';
                list[at] = c;
            } else {
                throw new Error(`属性路径的第一个字符必须在 $|_|a~z|A~Z 中：${key}，下标为${i}`);
            }
        } else if (pre === '.a') {
            if (c === '.') {
                pre = '.';
                at += 1;
            } else if (c === '[') {
                pre = '[';
                at += 1;
            } else if (/[$_a-zA-Z0-9]/.test(c)) {
                // 表示处在属性名上下文下，如果接下来不是.或者[，这表明还是属性名，需要满足要求
                pre = '.a';
                list[at] += c;
            } else {
                throw new Error(`属性路径非第一个字符必须在 $|_|a~z|A~Z|0~9 中：${key}，下标为${i}`);
            }
        } else if (pre === '[') {
            if (/[0-9]/.test(c)) {
                pre = '[0';
                list[at] = c;
            } else {
                throw new Error(`数组路径必须在 0~9 中：${key}，下标为${i}`);
            }
        } else if (pre === '[0') {
            if (/[0-9]/.test(c)) {
                pre = '[0';
                list[at] += c;
            } else if (c === ']') {
                pre = '';
            } else {
                throw new Error(`数组路径没有结束或者下标不在 0~9 中：${key}，下标为${i}`);
            }
        } else if (pre === '') {
            if (c === '.') {
                pre = '.';
                at += 1;
            } else if (c === '[') {
                pre = '[';
                at += 1;
            } else {
                throw new Error(`路径新开始时必须是 . 或者 [：${key}，下标为${i}`);
            }
        }
    }
    return list;
}

function _getValue(data, list) {
    let _data = data;
    for (let i = 0, len = list.length; i < len; i += 1) {
        _data = _data[list[i]];
    }
    return _data;
}

function getValue(data, key) {
    let list = _getList(key);
    return _getValue(data, list);
}

function setKeyValue(data, key, value) {
    let list = _getList(key);
    let len = list.length;
    if (len > 0) {
        let _data = _getValue(data, list.slice(0, -1));
        _data[list[list.length - 1]] = value;
    }
}

function isSamePath(key1, key2) {
    return key1.indexOf(key2) === 0 || key2.indexOf(key1) === 0;
}

function deepClone(jsonData) {
    return JSON.parse(JSON.stringify(jsonData));
}

/** 解析组件使用模版，例如：
 * <my-tag inner-list="{{my.list}}" bindtap="onTap"></my-tag>
 * 输出为：
 * {
 *   properties: [
 *      {innerKey: 'innerList', outerKey: 'my.list'}
 *   ],
 *   events: [
 *      {type: 'tap', handler: 'onTap'}
 *   ]
 * }
 */
function parseUseStr(useStr, properties) {
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
                throw new Error(`传入的属性必须由{{和}}包围，问题出现在：${item[0]}=${item[1]}，来源：${useStr}`);
            }
            result.properties.push({
                innerKey: item[0],
                outerKey: item[1].replace(/^{{([^{}]+)}}$/, '$1')
            });

        }
    });
    console.log(result);
    return result;
}

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
        let _instances = [];

        let _setData = this.setData;
        /**
         * 劫持page的setData，因为当设置的data同时里面有属于组件的输入时，需要同时设置组件中对应的data
         * @param obj
         * @param ignore 表示是否跳过对原生setData的调用
         */
        this.setData = function (obj, ignore) {
            // 调用原生的setData
            !ignore && _setData.call(this, obj);

            // 检查properties
            Object.getOwnPropertyNames(obj)
                .map(key => {
                    _instances.map(instance => {
                        instance.outerProperties.map(item => {
                            if (isSamePath(item.outerKey, key)) {
                                instance._setProp(item.innerKey, getValue(this.data, item.outerKey), ignore);
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
                _instances.push(instance);

                let methods = Object.getPrototypeOf(instance);
                Object.getOwnPropertyNames(methods || {})
                    .map((key) => {
                        let f = methods[key];
                        let _f = this[key];
                        if (typeof _f !== 'function' && typeof _f !== 'undefined') {
                            throw new Error(`Page中的非方法属性${key}被${instance.namespace}组件中的同名方法覆盖了。`);
                        }
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

        _instances.map(instance => instance.ready());
    };
    wxPage(page);
};

let api = {
    _setData: function (newData) {
        Object.getOwnPropertyNames(newData)
            .map((key) => setKeyValue(this.data, key, newData[key]));
        let data = deepClone(this.data);
        data.cid = this.cid;
        let obj = {};
        obj[this.namespace] = data;
        this.pageCtx.setData(obj);
    },
    /**
     * @param propName
     * @param data
     * @param ignore 表示首次从外面传入数据，不触发observer
     */
    _setProp: function (propName, data, ignore) {
        let prop = this.properties[propName];
        if (prop && prop.value !== data) {
            let oldVal = prop.value, newVal = data;
            let obj = {};
            obj[propName] = newVal;
            this._setData(obj);
            prop.value = newVal;
            if (!ignore && typeof prop.observer === 'function') {
                prop.observer.call(this, newVal, oldVal);
            }
        }
    },
    setData: function (newData) {
        let _newData = {};
        Object.getOwnPropertyNames(newData)
            .filter(key => !this.properties[key]) // 不允许setData设置properties的属性
            .map(key => _newData[key] = newData[key]);
        this._setData(_newData);
    },
    triggerEvent: function (eventType, detail) {
        this.events.map(item => {
            if (item.type === eventType) {
                this.pageCtx[item.handler](detail);
            }
        });
    },
    // 默认的组件生命周期方法
    ready: function () {},
};
let _Component = (component) => {
    let _api = Object.assign(Object.create(api), component.methods);
    return {
        new: function (config) {
            let properties = {};

            // 深度复制组件的properties
            Object.getOwnPropertyNames(component.properties)
                .map((propName) => {
                    let prop = component.properties[propName];
                    let obj = {
                        type: prop.type || undefined,
                        value: deepClone(prop.value)
                    };
                    if (prop.observer) {
                        obj.observer = prop.observer;
                    }
                    properties[propName] = obj;
                });

            // 深度复制组件的data
            let data = deepClone(component.data);

            let instance = Object.create(_api);
            instance.pageCtx = config.pageCtx;
            instance.namespace = config.namespace;
            instance.properties = properties;
            instance.data = data;
            instance.cid = cid();
            if (component.ready) {
                instance.ready = component.ready;
            }

            let use = parseUseStr(config.use, properties);
            instance.events = use.events;
            instance.outerProperties = use.properties;

            instance.setData(data);
            return instance;
        }
    };

};

export {_Page, _Component};