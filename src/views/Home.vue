<template>
    <div class="home">
        <p>第一次请求会拉取token，第二次就会从store中获取token；打开控制台或者network查看</p>
        <button type="button" @click="test">测试get请求</button>
    </div>
</template>

<script>
    // @ is an alias to /src
    import HelloWorld from '@/components/HelloWorld.vue'

    export default {
        name: 'home',
        created() {
            
        },
        methods: {
            test() {
                const params = {
                    sid: 186,
                    isVideo: 1
                }
                this.$get('/mall/rtb/user/[uid]/ad/[sid]', params).then(res => {
                    console.log('页面中接受的返回数据-------')
                    console.log(res)
                })
            }
        },
        components: {
            HelloWorld
        }
    }
</script>