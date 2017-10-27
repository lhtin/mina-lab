const wxPage = Page;
const log = (() => {
    // let debug = false;
    let debug = true;
    return (...args) => {
        if (debug) {
            console.log.apply(console, ['%cComponent Info:'].concat(['color: #995323; font-weight: bold;']).concat(args));
        }
    }
})();

/**
 * a.b[0].c[156][19].d -> ['a', 'b', 0, 'c', 156, 19, 'd']
 * ['a', 'b', 0, 'c', 156, 19, 'd'] -> data.a.b[0].c[156][19].d
 * @param {string|Array} pathValue
 * @returns {Array}
 */
function _getPath(pathValue) {

    if (Array.isArray(pathValue)) {
        return pathValue;
    } else if (typeof pathValue !== 'string') {
        throw new Error(`pathValue 必须是字符串或者数组类型：转入的pathValue类型为 ${typeof pathValue}`)
    }

    let path = [];
    let at = 0;
    let context = '.'; // 上下文
    for (let i = 0, len = pathValue.length; i < len; i += 1) {
        let c = pathValue[i];
        if (context === '.') {
            // 之前是.，表示接下来是一个属性名，属性名开头要满足要求
            if (/[$_a-zA-Z]/.test(c)) {
                context = '.a';
                path[at] = c;
            } else {
                throw new Error(`属性路径的第一个字符必须在 $|_|a~z|A~Z 中：${pathValue}，下标为${i}`);
            }
        } else if (context === '.a') {
            if (c === '.') {
                context = '.';
                at += 1;
            } else if (c === '[') {
                context = '[';
                at += 1;
            } else if (/[$_a-zA-Z0-9]/.test(c)) {
                // 表示处在属性名上下文下，如果接下来不是.或者[，这表明还是属性名，需要满足要求
                context = '.a';
                path[at] += c;
            } else {
                throw new Error(`属性路径非第一个字符必须在 $|_|a~z|A~Z|0~9 中：${pathValue}，下标为${i}`);
            }
        } else if (context === '[') {
            if (/[0-9]/.test(c)) {
                context = '[0';
                path[at] = c;
            } else {
                throw new Error(`数组路径必须在 0~9 中：${pathValue}，下标为${i}`);
            }
        } else if (context === '[0') {
            if (/[0-9]/.test(c)) {
                context = '[0';
                path[at] += c;
            } else if (c === ']') {
                context = '';
                path[at] = Number(path[at]); // 转为数字
            } else {
                throw new Error(`数组路径没有结束或者下标不在 0~9 中：${pathValue}，下标为${i}`);
            }
        } else if (context === '') {
            if (c === '.') {
                context = '.';
                at += 1;
            } else if (c === '[') {
                context = '[';
                at += 1;
            } else {
                throw new Error(`路径新开始时必须是 . 或者 [：${pathValue}，下标为${i}`);
            }
        }
    }
    return path;
}

/**
 * @param {Array} path - ['a', 1, 'b'] = a[1].b
 * @returns {string}
 */
function _getKey(path) {
    let key = path[0];
    for (let i = 1, len = path.length; i < len; i =+ 1) {
        let item = path[i];
        if (typeof item === 'string') {
            key += `.${item}`;
        } else if (typeof item === 'number') {
            key += `[${item}]`;
        }
    }
    return key;
}

/**
 * 根据list路径获取data中的value
 * @param {Object} data
 * @param {Array} path
 * @returns {*}
 */
function _getValue(data, path) {
    let _data = data;
    for (let i = 0, len = path.length; i < len; i += 1) {
        _data = _data[path[i]];
    }
    return _data;
}

/**
 * @param {Object} data
 * @param {string|Array} pathValue
 * @returns {*}
 */
function getValue(data, pathValue) {
    let path = _getPath(pathValue);
    return _getValue(data, path);
}

/**
 * @param {Object} data
 * @param {string|Array} pathValue
 * @param {*} value
 */
function setKeyValue(data, pathValue, value) {
    let path = _getPath(pathValue);
    let len = path.length;
    if (len > 0) {
        let _data = _getValue(data, path.slice(0, -1));
        _data[path[path.length - 1]] = value;
    }
}

/**
 * 两个key路径是否在同一条路上
 * @param {string|Array} key1
 * @param {string|Array} key2
 * @returns {boolean}
 */
function isSamePath(key1, key2) {
    key1 = _getPath(key1).join('.');
    key2 = _getPath(key2).join('.');
    return key1.indexOf(key2) === 0 || key2.indexOf(key1) === 0;
}

/**
 * @param {Object} jsonData
 */
function deepClone(jsonData) {
    return JSON.parse(JSON.stringify(jsonData));
}

/**
 * 解析组件使用模版，例如：
 * <my-tag inner-list="{{my.list}}" bind:tap="onTap"></my-tag>
 * 输出为：
 * {
 *   properties: [
 *      {innerKey: 'innerList', outerKey: 'my.list'}
 *   ],
 *   events: [
 *      {type: 'tap', handlerName: 'onTap'}
 *   ]
 * }
 *
 * @param {string} useStr - 标签使用字符串
 * @param {Object} properties - 组件中设置了的properties，只有组件中设置了的属性使用者才可以传入
 * @returns {Object}
 */
function parseUseStr(useStr, properties) {
    // log(`原始 use: ${useStr}`);
    let clearStr = useStr.replace(/>?<\/?[a-z\-]+[\s>]|"/g, '').replace(/ +/, ' ');
    // log(`清除无用信息后的 use: ${clearStr}`);
    let resultStr = clearStr.replace(/-([a-z])?/g, function (match, p1) {
        return p1 ? p1.toUpperCase() : '';
    });
    // log(`去除短杠后的 use: ${resultStr}`);
    let items = resultStr.split(' ').map(item => item.split('='));
    // log('分段形成数组', items);
    let result = {
        properties: [],
        events: []
    };
    items.map(item => {
        let inner = item[0],
            outer = item[1];
        if (inner.indexOf('bind:') === 0) {
            inner = inner.replace(/^bind:/, '');
            result.events.push({
                type: inner,
                handlerName: outer
            });
        } else if (properties[inner]) {
            let reg = /^{{([^{}]+)}}$/;
            if (!(reg.test(outer))) {
                throw new Error(`传入的属性必须由{{和}}包围，问题出现在：${inner}=${outer}，来源：${useStr}`);
            }
            result.properties.push({
                innerKey: inner,
                outerKey: outer.replace(reg, '$1')
            });
        }
    });
    // log('结果对象', result);
    return result;
}

/**
 * 组件唯一id
 */
let cid = (() => {
    let _cid = 0;
    return () => {
        _cid += 1;
        return `cid_${_cid}`;
    }
})();

/**
 * 组件api
 */
let api = {
    _setData: function (newData) {
        log('Invoke _setData');
        let __context__ = this.__context__;
        Object.getOwnPropertyNames(newData)
            .map((key) => setKeyValue(this.data, key, newData[key]));
        let data = deepClone(this.data);
        data.cid = __context__.cid;
        let obj = {};
        obj[__context__.namespace] = data;
        __context__.pageCtx.setData(obj);
    },
    /**
     * @param {string} propName - 需要设置的属性名
     * @param {Object} data - 数据
     * @param {Boolean} [ignore] - 表示是否是首次从外面传入数据，是则不调用observer
     */
    _setProp: function (propName, data, ignore) {
        log('Invoke _setProp');
        let __context__ = this.__context__;
        let prop = __context__.properties[propName];
        if (prop && prop.value !== data) {
            let oldVal = prop.value,
                newVal = data;
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
        log('Invoke setData');
        let __context__ = this.__context__;
        let _newData = {};
        Object.getOwnPropertyNames(newData)
            .filter(key => !__context__.properties[key]) // 不允许组件的setData设置properties的属性
            .map(key => _newData[key] = newData[key]);
        this._setData(_newData);
    },
    triggerEvent: function (eventType, detail) {
        log(`Invoke triggerEvent eventType: ${eventType}`);
        let __context__ = this.__context__;
        __context__.events.map(item => {
            if (item.type === eventType) {
                // 执行page中的handlerName
                let handler = __context__.pageCtx[item.handlerName];
                if (typeof handler === 'function') {
                    handler.call(__context__.pageCtx, detail);
                }
            }
        });
    },
    hasBehavior: function () {
        return false;
    },
    selectComponent: function (selector) {
        return null;
    },
    selectAllComponents: function (selector) {
        return [];
    }
};

/**
 * @param {Object} component - 组件对象
 * @param {Object} [component.properties]
 * @param {Object} [component.data]
 * @param {Object} [component.methods]
 * @param {Function} [component.attached]
 * @param {Function} [component.ready]
 * @returns {{new: new}}
 */
let MyComponent = (component) => {
    let componentAPI = Object.assign(Object.create(api), component.methods);
    return {
        new: function (config) {
            log(`通过调用组件的 new 进行初始化，数据名称为 ${config.namespace}`);
            log(`标签使用为 ${config.use}`);
            // 深度复制组件的properties
            let properties = {};
            Object.getOwnPropertyNames(component.properties || {})
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

            // 组件实例继承componentAPI
            let instance = Object.create(componentAPI);

            // 深度复制组件的data
            let data = deepClone(component.data || {});
            instance.data = data;

            // 实例的私有信息，防止命名冲突
            log('解析组件配置中的 use 属性');
            let use = parseUseStr(config.use, properties);
            log('use属性解析结果：', use);
            instance.__context__ = {
                pageCtx: config.pageCtx,
                namespace: config.namespace,
                properties: properties,
                cid: cid(),
                events: use.events,
                outerProperties: use.properties
            };

            if (component.ready) {
                instance.ready = component.ready;
            }
            if (component.attached) {
                instance.attached = component.attached;
            }

            log('第一次更新组件的 data');
            instance.setData(data);
            return instance;
        }
    };

};

/**
 * @param {Object} page - 页面配置
 */
let MyPage = (page) => {

    // 处理组件
    let _onLoad = page.onLoad;
    page.onLoad = function (...args) {
        let _instances = [];

        let _setData = this.setData;
        /**
         * 劫持page的setData，因为当设置的data同时里面有属于组件的输入时，需要同时设置组件中对应的data
         * @param {Object} data
         * @param {Boolean} [ignore] 表示是否跳过对原生setData的调用
         */
        this.setData = function (data, ignore) {
            // 调用原生的setData
            !ignore && _setData.call(this, data);

            // 检查properties
            Object.getOwnPropertyNames(data)
                .map(key => {
                    _instances.map(instance => {
                        instance.__context__.outerProperties.map(item => {
                            if (isSamePath(item.outerKey, key)) {
                                instance._setProp(item.innerKey, getValue(this.data, item.outerKey), ignore);
                            }
                        })
                    });
                });
        };

        Object.getOwnPropertyNames(this.usingComponents || {})
            .map((key) => {
                return this.usingComponents[key];
            })
            .reduce((all, components) => {
                return all.concat(components);
            }, [])
            .map((component) => {
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
                            log(`回调 ${key} 被调用，参数：`, args);
                            let event = args.length > 0 ? args[0] : false;
                            let cid = event && event.currentTarget
                                && event.currentTarget.dataset
                                && event.currentTarget.dataset.cid;
                            if (instance.__context__.cid === cid) {
                                f.call(instance, ...args);
                            } else {
                                _f && _f.call(this, ...args);
                            }
                        };
                    })
            });

        log('将page中的data更新到组件中');
        this.setData(page.data, true);
        log('添加完组件后的page：', this);

        log('调用组件的attached');
        _instances.filter(instance => typeof instance.attached === 'function')
            .map(instance => instance.attached());
        log('调用page的onLoad');
        _onLoad && _onLoad.call(this, ...args);
        log('调用组件的ready');
        _instances.filter(instance => typeof instance.ready === 'function')
            .map(instance => instance.ready());
    };
    wxPage(page);
};

export {MyPage, MyComponent, isSamePath, setKeyValue, getValue, log};