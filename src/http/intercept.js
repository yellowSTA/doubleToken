import store from '../store/index.js'
import { staticToken, superToken, } from './token'
import request from '@/http/request.js'

const quee = []
let wait = false;

//请求入口
export default async function intercept(config) {
    console.log('请求入口-------')
    console.log(config)
    let status = await checkStaticToken()
    if (status) {
        return new Promise(resolve => {
            resolve(add(config))
        })
    }

}

//拓展请求方式
['get','post','put','patch','delete','head','options'].forEach(el => {
    intercept[el] = function(url, data, config = {}) {
        const options = {
            url,
            method: el,
            ...config
        }
        if(el == 'POST' || el == 'PUT') {
            options.data = data;
        } else {
            options.params = data;
        }
        options.url = replaceUrl(options.url, data);
        return intercept(options)
    }
})


/**
 * url特殊变量替换
 * @param {string} url -要请求的url
 * @param {object} params -需要替换进url的值
 */
function replaceUrl(url, params) {
    const reg = /\[[a-zA-Z]+\]/g;
    let flag = true;
    let n = 10; //防止无限循环

    while(flag && n > 0) {
        let result = reg.exec(url); //匹配url是否有[***]这种特殊变量
        let item = result ? result[0] : null;
        if(item == '[uid]') { continue; } //如果有[uid]特殊变量，跳过，[uid]会在request的时候处理
        if(item !== null) {
            let key = item.replace('[','').replace(']','');
            let val = params[key]; //有特殊变量，还需要特殊的值去替换
            params[key]=null;
            if(val) {
                url = url.replace(item, val);
            } else {
                console.warn(item + '没有传入对应的值')
            }
        } else {
            flag = false;
        }
        n--;
    }
    return url;
}

//往队列添加
function add(config) {
    return new Promise((resolve, reject) => {
        quee.push({
            resolve,
            config,
            reject,
            count: 0 //防止无限请求
        })
        if(!wait) {
            wait = true;
            run();
        }
    })
    
}

/**
 * 执行队列请求
 * 规则：
 * 所有请求都在队列中排序，run的时候永远只执行队列第一项，
 * 当请求完成（返回错误或返回正确，都算请求完成），让第一项出队列，继续run，这样就能按顺序执行所有请求，
 * 有一个wait参数来标识队列是否正在执行中，如果true就让后面进来的请求排队，false就立即执行当前请求
 */
async function run() {
    let item = quee[0];
    // 如果url上有[uid]标识，但又不存在UID，拒绝请求
    if(item.config.url.indexOf('[uid]') > -1 && !store.getters.uid) {
        console.warn('url上有[uid]标识，但又不存在UID，拒绝请求');
        item.resolve({code: '500', msg: '没有UID，不发起请求'});
        checkQuee();
        return false;
    }
    //如果重复请求超过三次，防止无限请求，需要停止
    if(item.count > 3) {
        checkQuee();
        return false;
    }
    request(item.config).then(res => {
        if (res && res.code == 'needToken') {
            item.count++;
            //如果有UID，是动态令牌过期，否则就是只需要静态令牌
            if(store.getters.uid) {
                checkSuperToken().then(status => {
                    if(status) {//如果获取动态令牌成功，继续跑队列
                        run()
                    } else {//否则获取到静态->动态令牌之后继续跑队列,如果获取token失败，出队列继续往下走
                        store.dispatch("token", "");
                        getAllToken().then(token => { 
                            token ? run() : checkQuee();
                        })
                    }
                })
            } else {
                store.dispatch("token", "");
                checkStaticToken().then(status => { //获取静态令牌成功继续跑队列，失败什么都不能请求，索性清空队列，
                    if(status) {
                        run()
                    } else {
                        quee.splice(0, quee.length);
                        wait = false;
                        item.resolve({code: '5104',data:'',msg:'获取静态令牌失败'});
                    }
                })
            }
            
            return false;
        }
        checkQuee();
        item.resolve(res)
    }).catch(err => { //如果当前请求失败，则继续执行后面的请求
        quee.splice(0, 1);
        quee.length ? run() : wait = false;
        item.reject(err);
    })
}

//检查队列
function checkQuee() {
    quee.splice(0, 1) //请求成功后将该项移除队列
    quee.length ? run() : wait = false; //如果队列有数据则继续跑，否则通知队列已经执行完毕
}

//请求静态令牌
async function checkStaticToken() {
    if (!store.getters.JWT) {
        var res = await staticToken()
        if (res.code == '0000') {
            store.dispatch("token", res.data);
            return true;
        } else {
            return false;
        }
    }
    return true;
}

//请求动态令牌
async function checkSuperToken() {
    var res = await superToken()
    if (res.code == '0000') {
        store.dispatch("token", res.data);
        return true;
    } else {
        store.dispatch("token", '');
        return false;
    }
}

//获取所有令牌
async function getAllToken() {
    let staticT = await staticToken();
    if(staticT.code != '0000') {
        return false;
    }
    store.dispatch("token", staticT.data);

    let dynamic = await superToken();
    if(dynamic.code != '0000') {
        return false;
    }
    store.dispatch("token", dynamic.data);
    return true;
}

