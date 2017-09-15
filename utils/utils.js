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

export {setKeyValue, getValue, isSamePath, deepClone, parseUseStr}