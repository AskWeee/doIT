function test() {
    console.log("k3 - test()");
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

// eslint-disable-next-line no-unused-vars
function sleepA(milliseconds) {
    const dtBegin = Date.now();
    let dtNow;
    do {
        dtNow = Date.now();
    } while (dtNow - dtBegin < milliseconds)
}

function* sleepB(ms) {
    // let fun = () => console.timeEnd("console.timeEnd");
    yield new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

// eslint-disable-next-line no-unused-vars
function test_sleepB() {
    console.time("time");
    let s = sleepB(3000);
    s.next().value.then(console.timeEnd("time"));
}

function* countAppleSales () {
    let saleList = [3, 7, 5];
    for (let i = 0; i < saleList.length; i++) {
        yield saleList[i];
    }
}

// eslint-disable-next-line no-unused-vars
function test_countAppleSales() {
    let appleStore = countAppleSales(); // Generator { }
    console.log(appleStore.next()); // { value: 3, done: false }
    console.log(appleStore.next()); // { value: 7, done: false }
    console.log(appleStore.next()); // { value: 5, done: false }
    console.log(appleStore.next()); // { value: undefined, done: true }
}

module.exports = {
    test: test,
    sleep: sleep,
}
