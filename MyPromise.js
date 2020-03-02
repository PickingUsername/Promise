(function (window) {
    //
    const PENDING = "pending"
    const RESOLVED = "resolved"
    const REJECTED = "rejected"

    class Promise {
        constructor(excutor) {
            this.status = PENDING
            this.data = undefined
            this.callbacks = [] //格式为{resolvedCallback,rejectedCallback}

            const resolve = (value) => {
                if (this.status !== PENDING) {
                    return
                }
                this.status = RESOLVED
                this.data = value
                if (this.callbacks.length > 0) {
                    this.callbacks.forEach((callback) => {
                        setTimeout(() => {
                            callback.resolvedCallback(this.data)
                        }, 0);
                    })
                }
            }
            const reject = (reason) => {
                if (this.status !== PENDING) {
                    return
                }
                this.status = REJECTED
                this.data = reason
                if (this.callbacks.length > 0) {
                    this.callbacks.forEach((callback) => {
                        setTimeout(() => {
                            callback.rejectedCallback(this.data)
                        }, 0);
                    })
                }
            }

            try {
                excutor(resolve, reject)
            } catch (error) {
                reject(error)
            }
        }

        then(resolvedCallback, rejectedCallback) {
            resolvedCallback = typeof resolvedCallback === "function" ? resolvedCallback : value => value
            rejectedCallback = typeof rejectedCallback === "function" ? rejectedCallback : reason => {
                throw reason
            }

            return new Promise((resolve, reject) => {
                const handle = (callback) => {
                    try {
                        const result = callback(this.data)
                        if (result instanceof Promise) {
                            result.then(resolve, reject)
                        } else {
                            resolve(result)
                        }
                    } catch (error) {
                        reject(error)
                    }
                }

                if (this.status === PENDING) {
                    this.callbacks.push({
                        resolvedCallback: (value) => {
                            handle(resolvedCallback)
                        },
                        rejectedCallback: () => {
                            handle(rejectedCallback)
                        }
                    })
                } else if (this.status === RESOLVED) {
                    setTimeout(() => {
                        handle(resolvedCallback)
                    }, 0);
                } else {
                    setTimeout(() => {
                        handle(rejectedCallback)
                    }, 0);
                }
            })
        }

        catch (rejectedCallback) {
            return this.then(undefined, rejectedCallback)
        }

        static all(promises) {
            return new Promise((resolve,reject)=>{
                let count = 0
                let results=new Array(promises.length)
                promises.forEach((promise,index)=>{
                    //当传入的数组中不全是promise时，将飞promise的元素通过resolve包装成一个promise
                    Promise.resolve(promise).then((value)=>{
                        results[index] = value
                        count++
                        if(count === promises.length){
                            resolve(results)
                        }
                    },(reason)=>{
                        reject(reason)
                    })
                })
            })
        }

        static race(promises) {
            return new Promise((resolve,reject)=>{
                promises.forEach((promise)=>{
                    Promise.resolve(promise).then((value)=>{
                        resolve(value)
                    },(reason)=>{
                        reject(reason)
                    })
                })
            })
        }

        static resolve(value){
            return new Promise((resolve,reject)=>{
                if(value instanceof Promise){
                    value.then(resolve,reject)
                }else{
                    resolve(value)
                }
            })
        }

        static reject(reason){
            return new Promise((resolve,reject)=>{
                reject(reason)
            })
        }
    }
        


    window.Promise = Promise
}(window))