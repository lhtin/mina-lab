# 组件封装库的使用说明

## 为什么要增加组件封装库

在小程序架构下，模版（template）里面拥有独立的数据作用域，但没有独立的回调函数作用域。也就是说模版中出发的回调函数，都是在页面（page）上去寻找。这样的话，会导致组件的逻辑层跟页面之间的耦合增加了，不利于复用。

目前这种机制无法改变，能做的是尽可能让代码去管理和分发回调函数到组件中去。

## 组件封装的要求

1. 组件模版中使用到的数据和回调只能来自组件类本身
2. 组件外必须通过调用组件的方法与组件进行交互，或者监听组件的方法
3. 组件封装库应该尽可能减少组件开发者去做组件本身无关的事情

## 组件库的用法

### 如何开发组件

组件作为一个视图块，有自己的逻辑层，逻辑层包含数据和回调函数。从以下的例子来看如何定义一个组件，先上代码，在看的过程中可以类比小程序里面的Page概念：

```js
// 组件的逻辑（selector.c.js）
import {Component} from '../../utils/c1';
class Selector extends Component {
    constructor() {
        super();
        this.data = {
            list: [],
            isShow: false
        }
    }

    setSelected () {
        this.data.selected = this.getSelected();
    }

    setList(list) {
        list[0].selected = true;
        this.data.list = list;
        this.setSelected();
        this.updateData();
    }

    getSelected(){
        return this.data.list.filter(item => item.selected)[0];
    }

    beSelect(cb) {
        if (typeof cb !== 'function') {
            throw new Error('参数不是函数');
        }
        this.cb = cb;
    }

    select(e) {
        let dataset = e.currentTarget.dataset;
        let name = dataset.name;
        let list = this.data.list;
        list.filter(item => item.selected).map(item => item.selected = false);
        list.filter(item => item.name === name).map(item => item.selected = true);
        this.cb && this.cb();
        this.data.isShow = false;
        this.setSelected();
        this.updateData();
    }

    show() {
        this.data.isShow = !this.data.isShow;
        this.updateData();
    }
}
export {Selector};
```

```html
<!-- 组件的模版（selector.c.wxml） -->
<template name="selector">
    <button bindtap="show" data-cid="{{cid}}">{{isShow ? '请选择' : '展开列表'}}</button>
    <view class="li" wx:if="{{isShow}}">
        <view wx:for="{{list}}" bindtap="select" data-cid="{{cid}}" data-name="{{item.name}}"
            class="{{item.selected ? 'selected' : ''}}">{{item.name}}</view>
    </view>
    <view>已选：{{selected.name}}</view>
</template>
```

```css
/* 组件的样式（selector.c.wxss） */
.li {
    text-align: center;
}
.li .selected {
    color: red;
}
```

跟Page有所区别的地方是，绑定回调时，必须设置`data-cid`属性，`cid`是组件实例的唯一标识，用于确保回调分发成功。至于`cid`的生成，是在初始化组件的时候做的，用户无需关注。只需要记住组件模版里面有一个`cid`变量，在设置回调时，也必须设置`data-cid`属性为`cid`的值。

另外一个不同点是数据到视图的更新，在Page中是通过`setData`进行更新的，可以具体到某一个属性。而在组件中，是调用`updateData`，并且是更新组件的内容。


### 如何使用组件
