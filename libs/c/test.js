import {isSamePath, setKeyValue, getValue, log} from './c';

let failed = 0;
const test = (desc, result) => {
    if (!result) {
        failed += 1;
        console.error(`test fail: ${desc}`);
    }
};

// test isSamePath
let test_isOnePath = () => {
    let cases = [
        ['a', 'b', false],
        ['a', 'a.b', true],
        ['a.b', 'a.b.c', true],
        ['a.b', 'a.c', false],
        ['a.b', 'a.c.d', false],
        ['a', 'a[0]', true],
        ['a[0]', 'a[1]', false],
        ['a[0]', 'a[0][0]', true],
        ['a.b[0]', 'a.b', true],
        ['a[0].b', 'a[0]', true]
    ];
    cases.map((c) => {
        test(`isOnePath("${c[0]}", "${c[1]}") === ${c[2]}`, isSamePath(c[0], c[1]) === c[2]);
    })
};
test_isOnePath();

// test setKeyValue
let test_setData = () => {
    let data = {
        a: {
            b: 42,
            c: '1234',
            d: true,
            e: {
                f: [1, 2, 3]
            }
        }

    };
    let newData = {
        'a.b': 45,
        'a.c': '123456',
        'a.x': 12345,
        'a.d': false,
        'a.e.f[0]': 5
    };

    setKeyValue(data, "a.b", 45);
    test(`setKeyValue(data, "a.b", 45)`, data.a.b === 45);
    setKeyValue(data, "a.c", "123456");
    test(`setKeyValue(data, "a.c", "123456")`, data.a.c === "123456");
    setKeyValue(data, "a.x", 12345);
    test(`setKeyValue(data, "a.x", 12345)`, data.a.x === 12345);
    setKeyValue(data, "a.d", false);
    test(`setKeyValue(data, "a.d", false)`, data.a.d === false);
    setKeyValue(data, "a.e.f[0]", 5);
    test(`setKeyValue(data, "a.e.f[0]", 5)`, data.a.e.f[0] === 5);
};
test_setData();

// test getValue
let test_getData = () => {
    let data = {
        a: {
            b: 42,
            c: {
                d: [1, 2, 3]
            }
        }
    };
    test(`getValue(data, "a.b") === 42`, getValue(data, "a.b") === 42);
    test(`getValue(data, "a.c") === {d: [1,2,3]}`, getValue(data, "a.c") === data.a.c);
    test(`getValue(data, "a.c.d[0]") === 1`, getValue(data, "a.c.d[0]") === 1);
};
test_getData();

if (failed > 0) {
    log(`${failed} tests failed`);
} else {
    log('all tests pass');
}
