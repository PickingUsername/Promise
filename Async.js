function spawn(genF) {
    //step表示一个周期,周期内应该做两件事1.在传入的函数中调用gen.next()恢复执行2.将promise的成功回调绑定为step
    //step接收一个具体的事件操作函数（next函数在这里执行，成功时next失败时throw）
    //promise.catch返回的这个promise被next.value引用，catch中的回调函数决定他的状态！一般catch中都不会返回值所以next.value会变成resolved
    //不加catch会导致foo返回的promise变成rejected，但是又没有指定他的失败回调，所以会抛出异常
    //就像let a = Promise.reject()也会抛出异常
    return new Promise(function (resolve, reject) {
        const gen = genF();

        function step(nextF) {
            let next;
            try {
                next = nextF();
            } catch (e) {
                return reject(e);
            }
            if (next.done) {
                return resolve(next.value);
            }
            Promise.resolve(next.value).then(function (v) {
                step(function () {
                    return gen.next(v);
                });
            }, function (e) {

                step(function () {
                    return gen.throw(e);
                });
            });
        }
        step(function () {
            return gen.next(undefined);
        });
    });
}

function* foo() {
    yield new Promise((res, rej) => {
        setTimeout(() => {
            rej(1)
        }, 1000).catch((e) => {
            console.log(e)
        })
    })
}