(function (window) {
    const PENDING = "pending"
    const RESOLVED = "resolved"
    const REJECTED = "rejected"

    function Promise(excutor) {
        //Promise内部属性
        this.status = PENDING //初始状态为pending
        this.data = undefined //用于存储结果数据
        this.callbacks = [] //每个元素的结构：{onResolved(){},onRejected(){}}

        //定义resolve函数
        const resolve = (value) => {
            //如果当前状态不为pending，直接结束
            if (this.status !== PENDING) {
                return
            }
            //将状态改为resolve
            this.status = RESOLVED
            //保存数据
            this.data = value
            //如果有待执行的回调函数，应该将回调函数放入任务队列中(用settimeout)
            if (this.callbacks.length > 0) {
                setTimeout(() => {
                    this.callbacks.forEach(callbacksObj => {
                        callbacksObj.onResolved(value)
                    })
                }, 0)
            }
        }

        const reject = (reason) => {
            //如果当前状态不为pending，直接结束
            if (this.status !== PENDING) {
                return
            }
            //将状态改为rejected
            this.status = REJECTED
            //保存数据
            this.data = reason
            //如果有待执行的回调函数，应该将回调函数放入任务队列中(用settimeout)
            if (this.callbacks.length > 0) {
                setTimeout(() => {
                    this.callbacks.forEach(callbacksObj => {
                        callbacksObj.onRejected(reason)
                    })
                }, 0)
            }
        }
        //立即执行执行器函数,其包含两个参数一个resolve,一个reject
        //如果执行器函数抛出异常，应该捕获异常，并把Promise设置为失败
        try {
            excutor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    //Promise原型对象then方法
    //指定成功或失败的回调函数
    //返回一个新的Promise
    Promise.prototype.then = (onResolved, onRejected) => { //指定默认失败回调，从而实现异常穿透
        onResolved = typeof onResolved === "function" ? onResolved : value => value
        onRejected = typeof onRejected === "function" ? onRejected : reason => {
            throw reason
        }
        return new Promise((resolve, reject) => {
            //处理回调函数
            const handle = (callback) => {
                try {
                    const result = callback(this.data) //调用第一个回调函数并保存其返回值
                    if (result instanceof Promise) {
                        result.then(resolve, reject) //result成功时会调用第一个回调函数并传入value，失败时会调用第二个回调函数并传入reason
                    } else {
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            //判断当前Promise对象状态
            if (this.status === PENDING) {
                this.callbacks.push({
                    //要将onResolved和onRejected函数包装一下再保存到callbacks中
                    //then函数要保证其返回的Promise完全受其两个参数（回调函数）的返回值result的控制
                    //一个promise受另一个promise完全控制的代码为：result.then(resolve,reject)
                    onResolvedPacked() {
                        handle(onResolved)
                    },
                    onRejectedPacked() {
                        handle(onRejected)
                    }
                })
            } else if (this.status === RESOLVED) {
                //当前Promise对象状态为Resolved时
                setTimeout(() => {
                    //1.如果抛出异常
                    //2.如果返回值不是Promise，调用resolve(value)
                    //3.如果回调函数返回的是Promise，return的Promise的结果就是该Promise的结果
                    handle(onResolved)
                })
            } else {
                //当前Promise对象状态为Rejected时
                setTimeout(() => {
                    //1.如果抛出异常
                    //2.如果返回值不是Promise，调用resolve(value)
                    //3.如果回调函数返回的是Promise，return的Promise的结果就是该Promise的结果
                    handle(onRejected)
                })
            }
        })
    }
    //Promise原型对象then方法
    //指定失败的回调函数
    //返回一个新的Promise
    Promise.prototype.catch = (onRejected) => {
        return this.then(undefined, onRejected)
    }

    //Peomise函数对象resolve方法
    //返回一个成功的Promise，成功值为value
    Promise.resolve = function (value) {
        return new Promise((resolve, reject) => {
            //value是promise
            if (value instanceof Promise) {
                value.then(resolve,reject)
            } else { 
                resolve(value)
            }
        })
    }
    //Peomise函数对象reject方法
    //返回一个失败的Promise，
    Promise.reject = function (reason) {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    //Peomise函数对象all方法
    //只有当所有Promise全部成功时成功，只要有一个失败就失败
    Promise.all = function (promises) {
        //计数器
        let count = 0
        //用来保存所有的promise的结果
        const values = new Array(promises.length)
        return new Promise((resolve, reject) => {
            //遍历所有的promise
            //通过then获取promise的状态
            promises.forEach((p, index) => {
                Promise.resolve(p).then((value) => {
                    count++
                    values[index] = value
                    if (count === promises.length) {
                        resolve(values)
                    }
                }, (reason) => {
                    reject(reason)
                })
            })
        })
    }

    //Peomise函数对象race方法
    //结果由第一个完成的Promise的结果决定
    Promise.race = function (promises) {
        return new Promise((resolve, reject) => {
            promises.forEach((p) => {
                Promise.resolve(p).then((value) => {
                    resolve(value)
                }, (reason) => {
                    reject(reason)
                })
            })
        })
    }
    //向外暴露Promise
    window.Promise = Promise
})(window)