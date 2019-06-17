import { JSEncrypt } from 'jsencrypt'
import store from '@/store'
import axios from 'axios'
import Cookies from 'js-cookie';

// RSA加密公钥
const pubKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCVq7n9eWgCZHqVYjAzTUqQ7IV1r0925TPxu13mBdRoI2J1aaGdv+CC08DDIUtpmex2PUen5WgkJoUKY/h9aY/CCbBsiwtxaEUfUOeJuP/LAOugdi/taF337jniZEXM77Gtzq6XpMmw9BAvjJomoxzWh+4CjEyZtKtn6fvWisO7HwIDAQAB";

// 按规则生成唯一标识
function guid() {
    return 'xxxxxxxx-xxxx-8xxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 获取静态token
export function staticToken() {
    const uuid = guid();
    const psd = `guest#${uuid}`;
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    let encryptPsd = encrypt.encrypt(psd);

    const config = {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'YF-JWT': store.getters.JWT || '',
            'YF-UID': store.getters.uid || ''
        }
    }
    const url = process.env.VUE_APP_BASE_URL + "/guest/login";
    const formData = {
        accountType: "guest",
        account: uuid,
        password: encryptPsd
    }

    return new Promise((resolve) => {
        console.log('请求暂停,正在获取token-------')
        
        axios.post(url, formData, config).then(res => {
            console.log(res)
            const { data, status } = res;
            if (status == 200 && data) {
                resolve(data)
            }
        })
    })

}

// 获取动态token
export function superToken() {
    //使用静默登录获取动态token
    let formData = {
        phone: '18665961978',
        pwd: 'Cookies.get("staticpsd")', //从cookie中获取加密过的用户密码
    };
    const config = {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'YF-JWT': store.getters.JWT || '',
            'YF-UID': store.getters.uid || ''
        }
    }
    const url = process.env.VUE_APP_BASE_URL + "/user/login/static";

    return new Promise((resolve) => {
        axios.post(url, formData, config).then(res => {
            const { data, status } = res;
            if (status == 200 && data) {
                resolve(data)
            }}
        )
    })
}