import axios from 'axios'
import store from '@/store'

const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL, // api的base_url  在config中分别设置开发环境和生产环境
    timeout: 20000, // request timeout
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    }
});
// 请求拦截器
service.interceptors.request.use(config => {
    config.headers['JWT'] = store.getters.JWT;
    config.headers['Content-Type'] = "application/json; charset=UTF-8";
    config.headers['UID'] = store.getters.uid;
    config.url = config.url.replace('[uid]', store.getters.uid || '');

    if (config.method === 'post' || config.method === 'put') {
        config.data = config.params || config.data;
        config.params = null;
    }
    console.log('正式进入请求,替换[uid]-------')
    console.log(config)
    return config;
}, error => {
    alert(error)
    return Promise.reject(error)
})

// response 拦截器
service.interceptors.response.use(res => {
    console.log('请求成功，进入response-------')
    console.log(res)
    const { data, status } = res;

    if (status == 200) {
        if (data.code == '5102' || data.code == '5103' || data.code == '5104') {
            return { code: 'needToken' };
        } else {
            return data;
        }
    }
    //模拟返回
    return res;
}, error => {
    if (error.toString().indexOf('Network Error') != -1) {
        alert('网络异常，请检查您的网络！')
    }
    
    return Promise.reject(error)
})


export default service;