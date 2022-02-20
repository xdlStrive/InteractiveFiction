import { defineStore } from 'pinia'
import { getToken, setTokens, removeToken } from '@/utils/auth'
// import { userLogin, getInfoApi, logoutApi } from '@/api/user'
import router, { resetRouter } from '@/router'

type userInfo = { // 定义login函数参数类型
  username: string,
  password: string
}

// 定义并导出状态容器，参数1为该容器的
export default defineStore('userInfo', {
  state: () => {
    return {
      token: getToken(),
      name: '',
      avatar: ''
    }
  },
  getters: {

  },
  actions: {
    setToken(token: string) {
      this.token = token
      setTokens(token)
    },
    // 获取用户信息
    // getInfo() {
    //   return new Promise((resolve, reject) => {
    //     getInfoApi(this.token).then(response => {
    //       const { data } = response // 对象的解构赋值要注意值与值之间的对应
    //       if (!data) {
    //         reject('验证失败，请重新登录！')
    //       }
    //       const { _id, roles, username, avatar } = data
    //       // 角色必须是非空数组
    //       if (!roles || roles.length <= 0) {
    //         reject('getInfo: 角色必须是非空数组！')
    //       }

    //       // commit('SET_ID', _id)
    //       // commit('SET_NAME', username)
    //       // commit('SET_AVATAR', avatar)
    //       // commit('SET_ROLES', roles)
    //       // commit('SET_INTRODUCTION', introduction)
    //       resolve(data) // 执行的是login.vue页面的dispatch('user/getInfo')后面的then中的方法，传的data就是then方法的res参数
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },
    // 登录方法
    login(userData: Partial<userInfo>) {
      this.$state = {
        ...this.$state,
        ...userData,
      }
    },
    // async login({ username, password }: loginParams) {
    //   return await userLogin({ username: username.trim(), password: password.trim() }).then(res => {
    //     setToken(res.token)
    //   }).catch(err => {
    //     console.log(err);
    //   })
    // },

    // 用户登出
    logout() {
      return new Promise((resolve, reject) => {
        logoutApi(this.token).then(() => {
          // commit('SET_TOKEN', '')
          // commit('SET_ROLES', [])
          // commit('SET_NAME', '') // 需要清空store.getter中的name
          removeToken()
          resetRouter()
          // reset visited views and cached views
          // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
          // dispatch('tagsView/delAllViews', null, { root: true })
          resolve('')
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 移除token
    resetToken() {
      return new Promise(resolve => {
        // commit('SET_TOKEN', '')
        // commit('SET_ROLES', [])
        removeToken()
        router.push('/login')
        resolve('')
      })
    },
  }
})