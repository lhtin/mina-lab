/**
 * 组件封装器
 * 关键点：
 *   1.组件模版中绑定的回调通过【组件名称.组件方法】的形式与组件方法进行关联
 *   2.组件外通过【组件实例.组件方法】的形式调用组件方法
 */

// 给所有组件实例分配一个独一的id，用于进行事件分发
let cid = (() => {
    let _cid = 0;
    return () => {
        _cid += 1;
        return `cid_${_cid}`;
    }
})();

// 组件实例hash表，key为实例cid
let cs = {};

// 组件api
let api = {
    // 新生成组件
    new: function (config) {
        let model = this;
        let obj = Object.create(model);
        let pages = getCurrentPages();
        let page = pages[pages.length - 1]; // 获取组件所在的页面
        obj._page = page;
        obj._dataName = config.dataName;
        obj._cid = cid();
        obj.init(config.data);
        obj.updateData();
        cs[obj._cid] = obj;
        console.log(`MinaComponent Log：${model.namespace}实例: `, obj);

        // 动态给page添加handler
        Object
            .keys(model)
            .filter((name) => {
                return typeof model[name] === 'function'
                    && name.indexOf(`${model.namespace}.`) === 0
                    && !page[name] // 还不在page上存在
            })
            .map((name) => {
                page[name] = model[name];
            });
        console.log('Current Page: ', page);
        return obj;
    },
    // 更新该组件的数据
    updateData: function () {
        let data = {};
        this.data = this.data || {};
        this.data.cid = this._cid;
        data[this._dataName] = this.data;
        this._page.setData(data);
    }
};
// 组件hash表，key为组件名称
let models = {};

/**
 * @param namespace string
 * @param model object
 * @returns model object
 */
let component = (model) => {

    if (!model.namespace) {
        throw new Error(`组件必须提供一个namespace：${model.namespace}`)
    }
    let namespace = model.namespace;
    if (models[namespace]) {
        throw new Error(`MinaComponent Error: 名称为${namespace}的Model已经存在`);
    }

    // 关键步骤
    // 1.过滤不需要处理的方法
    // 2.给过滤出来的方法添加组件名称作为其前缀
    Object
        .keys(model)
        .filter((name) => {
            return typeof model[name] === 'function'
                && name.indexOf(`${namespace}.`) !== 0 // 开头不是namespace.
                && name !== 'init'
        })
        .map((name) => {
            let handlerName = `${namespace}.${name}`;
            if (!model[handlerName]) {
                model[handlerName] = function (e) {
                    if (!e || !e.currentTarget) {
                        throw new Error(`MinaComponent Error: ${handlerName}方法必须作为页面事件的handler进行调用`);
                    }
                    let cid = e.currentTarget.dataset && e.currentTarget.dataset.cid;
                    if (!cid) {
                        throw new Error(`MinaComponent Error: ${handlerName}所挂载的标签不存在data-cid属性或者内容为空`);
                    }
                    let instance = cs[cid];
                    if (!instance) {
                        throw new Error(`MinaComponent Error: ${cid}实例不存在`);
                    }
                    // 调用组件实际的方法
                    instance[name].call(instance, e);
                };
            }
        });
    model.namespace = namespace;
    let _c = Object.create(api);
    models[namespace] = Object.assign(_c, model);
    console.log(`Model ${namespace}: `, models[namespace]);
    return models[namespace];
};

export {component}