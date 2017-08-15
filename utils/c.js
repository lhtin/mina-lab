/**
 * 组件生成器
 * 主要作用统一分发模版中的事件到对应的组件实例中
 */

// 给每个组件生成一个独一的id
// 用于将事件进行分发
let cid = (() => {
    let _cid = 0;
    return () => {
        _cid += 1;
        return _cid;
    }
})();

// 所有组件列表
let cs = [];

// 组件api
let api = {
    // 新生成组件
    new: function (page_this, config) {
        let model = this;
        let obj = Object.create(model);
        obj._page = page_this;
        obj._dataName = config.dataName;
        obj._cid = cid();
        obj.init(config.data);
        obj.updateData();
        cs.push(obj);
        console.log(`MinaComponent Log：${model.namespace}实例，`, obj);

        // 动态给page添加handler
        let pages = getCurrentPages();
        let page = pages[pages.length - 1];
        if (page) {
            Object
                .keys(model)
                .filter((name) => {
                    return typeof model[name] === 'function'
                        && name.indexOf(`${model.namespace}.`) === 0
                })
                .map((name) => {
                    page[name] = model[name];
                })
        }
        console.log('Page: ', page);
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
let models = {};

/**
 * 封装model，添加namespace到方法的前面
 * @param namespace string
 * @param model object
 * @returns model object
 */
let component = (namespace, model) => {

    if (models[namespace]) {
        throw new Error(`MinaComponent Error: 名称为${namespace}的Model已经存在`);
    }

    // 关键步骤
    // 将组件的所有方法进行代理，方式是将具体组件上的方法加短杆保存起来
    // 里面根据cid分发到组件示例的方法上去
    Object
        .keys(model)
        .filter((name) => {
            return typeof model[name] === 'function'
                && name.indexOf(`${namespace}.`) !== 0 // 开头不是namespace.
                && name.indexOf(`${namespace}_`) !== 0 // 开头不是namespace_
                && name !== 'init'
        })
        .map((name) => {
            let originName = `${namespace}_${name}`;
            let proxyName = `${namespace}.${name}`;
            if (!model[originName]) {
                model[originName] = model[name];
                model[name] = model[proxyName] = function (e) {
                    if (e && e.currentTarget) {
                        // 如果函数是作为页面事件的handler调用，cid从dataset中获取
                        let cid = e.currentTarget.dataset && e.currentTarget.dataset.cid;
                        // 根据cid过滤出对应的组件实例，然后调用对应的方法
                        cs.filter((_c) => _c._cid === cid)
                            .map((_c) => _c[originName].apply(_c, arguments));
                    } else if (this && this._cid) {
                        // 如果函数是作为组件实例的方法调用，则直接调用
                        this[originName].apply(this, arguments);
                    }
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