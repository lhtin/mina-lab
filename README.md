# 组件封装库的使用说明

阅读背景：已了解小程序中Page相关的概念和用法。

## 为什么要增加组件封装库

在小程序架构下，模版（template）里面拥有独立的数据作用域，但没有独立的事件回调作用域。也就是说模版中触发的事件回调，都是在页面（Page作用域）中去寻找的。因此，组件的逻辑层跟页面的逻辑层的耦合增加，事件回调命名容易冲突。另外一个问题是组件的逻辑层、视图层、样式也是相互独立的，使用时需要分别导入到页面中去。

目前这种机制无法改变，能做的是尽可能让代码去管理和分发事件回调到组件和页面中去。除非去创造一门新语言来动态生成小程序代码。

## 组件封装的基本要求

1. 组件模版中使用到的数据和回调只能来自组件类本身
2. 组件外必须通过调用组件的方法或监听组件的事件与组件进行交互
3. 组件封装库应该尽可能减少组件开发者去做组件本身无关的事情
4. 数据和事件回调的使用尽可能跟Page中的一致

## 组件库的用法

### 如何开发组件

组件作为一个视图块，有自己的逻辑层，逻辑层包含数据和回调函数。组件的定义是通过继承`Component`类来实现的，组件逻辑层本身也是一个类，比如这里的`Selector`。

从以下的例子来看如何定义一个组件，先上代码，在看的过程中可以类比小程序里面的Page概念。

```js
// 组件的逻辑（selector.c.js）
import {Component} from '../../utils/c1';
class Selector extends Component {
    constructor() {
        super();
        this.data = {
            selected: null,
            list: [],
            isShow: false
        }
    }
    setList(list) {
        list[0].selected = true;
        let selected = list[0];
        this.setKeyValue({
            selected: selected,
            list: list
        });
        this.emit('select', selected);
    }
    getSelected(){
        return this.data.list.filter(item => item.selected)[0];
    }
    select(e) {
        let dataset = e.currentTarget.dataset;
        let name = dataset.name;
        let list = this.data.list;
        list.filter(item => item.selected).map(item => item.selected = false);
        list.filter(item => item.name === name).map(item => item.selected = true);
        let selected = this.getSelected();
        this.setKeyValue({
            selected: selected,
            list: list,
            isShow: false
        });
        this.emit('select', selected);
    }
    show() {
        this.setKeyValue({
            isShow: !this.data.isShow
        });
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
    <view>已选（组件内）：{{selected.name}}</view>
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

可以看到，组件也是通过**`setKeyValue`**和**事件回调**实现逻辑层与视图层之间的交互，**使用方式基本可以类似Page**。

跟Page有所区别的地方是，在模版中给标签设置事件回调时，必须同时设置`data-cid`属性，`cid`是组件实例的唯一标识，用于确保事件回调能准确的分发到组件实例。至于`cid`的生成，是在组件封装库在初始化组件的时候添加的，用户无需关注。**只需要记住组件模版里面有一个`cid`变量，在设置组件中的事件回调时，也必须设置`data-cid`属性为`cid`的值**。

### 如何使用组件

对于组件使用者来说，组件是一个黑盒子，页面通过组件实例的方法与组件进行交互，包括两种形式。一是调用组件实例的方法（主动），二是监听组件实例的某个事件（被动）。

将组件添加到页面中去，是通过页面的属性`component`对象，这是一个新增加的属性，由组件封装器做处理，即代码中的`MyPage`。

```js
/* Page逻辑层 */
// Page中去使用上文定义的Selector组件
import {MyPage} from '../../utils/c1';
import {Selector} from './selector.c';
MyPage({
    data: {},
    component: {
        selector1: new Selector()
    },
    selector1Show: function () {
        this.selector1.show();
    },
    onLoad: function () {
        this.selector1.on('select', (selected) => {
            console.log('onSelect', selected);
            this.setKeyValue({
                selector1Selected: selected
            })
        });
        this.selector1.setList([
            {
                name: '西兰花'
            },
            {
                name: '霉鱼'
            },
            {
                name: '土豆'
            }
        ]);
    }
});
```

```html
<!-- Page视图层 -->
<import src="selector.c.wxml" />
<scroll-view>
    <view>已选（组件外）：{{selector1Selected.name}}</view>
    <template is="selector" data="{{...selector1}}" />
</scroll-view>
```

```css
/* Page样式 */
@import 'selector.c.wxss';
```

`component`对象是`key-value`对，`key`有两个含义。第一，`key`表示**组件实例的名称**。在页面中可以通过`this.key`（例如示例中的`this.selector1`）访问到，可以方便地调用实例的方法。第二，表示**组件实例的数据名称**。页面引入模版时通过设置`data="{{...key}}"`（例如示例中的`data="{{...selector1}}"`），即可将数据传入组件的模版中。因此，在Page页面和`data`中就不能再使用`key`属性了。

## 待改进

1. 组件内调用组件还未实现，不过实现起来不难
2. 对于组件使用者来说，需要分别导入组件的`js`、`wxml`、`wxss`，过于麻烦。另外动态添加`key`属性也不是太好的方法，容易造成命名冲突。可能需要一个组件实例的命名规范会比较好。