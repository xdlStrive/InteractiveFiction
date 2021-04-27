import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
// import store from '@/store'
// import { getToken } from '@/utils/auth'

const request = axios.create({
  baseUrl: '',
  timeout: 5000
})

// request 拦截器
request.interceptors.request.use(
  config => {
    // 发出请求前执行事件
    // if (store.getters.token) {
    //   // 让每个请求携带token
    //   // ['X-Token'] 是自定义headers key
    //   // 请根据实际情况修改
    //   config.headers.authorization = getToken()
    // }
    return config
  },
  error => {
    // 处理请求错误
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response 拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 如果自定义code不是20000，则将其判断为错误
    if (res.code !== 20000) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: 无效Token; 50012: 该账号已登录; 50014: Token 过期;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        ElMessageBox.confirm('您已注销，您可以取消以停留在此页，或重新登录', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          // store.dispatch('user/resetToken').then(() => {
          //   location.reload()
          // })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('错误' + error) // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export { request }