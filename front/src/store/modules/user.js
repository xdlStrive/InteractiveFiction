import { userLogin, getInfo, logout } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // 登录方法
  login({ commit }, { username, password }) {
    return new Promise((resolve, reject) => {
      userLogin({ username: username.trim(), password: password }).then(res => {
        commit('SET_TOKEN', res.token)
        setToken(res.token)
        resolve() // 执行的是login.vue页面的dispatch('user/login')后面的then中的方法
      }).catch(err => {
        reject(err)
      })
    })
  },
  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response // 对象的解构赋值要注意值与值之间的对应
        if (!data) {
          reject('验证失败，请重新登录！')
        }
        const { _id, roles, username, avatar } = data
        // 角色必须是非空数组
        if (!roles || roles.length <= 0) {
          reject('getInfo: 角色必须是非空数组！')
        }

        commit('SET_ID', _id)
        commit('SET_NAME', username)
        commit('SET_AVATAR', avatar)
        // commit('SET_ROLES', roles)
        // commit('SET_INTRODUCTION', introduction)
        resolve(data) // 执行的是login.vue页面的dispatch('user/getInfo')后面的then中的方法，传的data就是then方法的res参数
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户登出
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        // commit('SET_ROLES', [])
        commit('SET_NAME', '') // 需要清空store.getter中的name
        removeToken()
        resetRouter()
        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        // dispatch('tagsView/delAllViews', null, { root: true })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 移除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      // commit('SET_ROLES', [])
      removeToken()
      router.push('/login')
      resolve()
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}