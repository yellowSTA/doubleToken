import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import token from './modules/token'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        uid: 125
    },
    getters,
    mutations: {

    },
    actions: {

    },
    modules: {
        token
    }
})