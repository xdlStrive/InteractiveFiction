import { userLogin } from '@/api/user'
import { getToken, setToken } from '@/utils/auth'

const state = {
  token: getToken(),
  name: '',
  avatar: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  }
}

const actions = {
  // 登录方法
  login({ commit }, { username, password }) {
    return new Promise((resolve, reject) => {
      userLogin({ username: username.trim(), password: password }).then(res => {
        commit('SET_TOKEN', res.token)
        setToken(res.token)
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  },
  // getInfo() {
  //   return new Promise((resolve, reject) => {

  //   })
  // }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}