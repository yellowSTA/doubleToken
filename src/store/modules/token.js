const token = {
    state: {
        JWT: ''
    },
    mutations: {
        TOKEN(state, data) {
            state.JWT = data.JWT
        }
    },
    actions: {
        token({ commit, state }, data) {
            commit('TOKEN', data)
        }
    }
}

export default token;