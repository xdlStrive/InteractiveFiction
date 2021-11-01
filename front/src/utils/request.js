import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseUrl: '',
  timeout: 5000
})

// request 拦截器
service.interceptors.request.use(
  config => {
    // 发出请求前执行事件
    if (store.getters.token) {
      // 让每个请求携带token
      config.headers.authorization = getToken()
    }
    return config
  },
  error => {
    // 处理请求错误
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果自定义code不是20000，则将其判断为错误
    if (res.code !== 20000) {
      

      // 50008: 无效Token; 50012: 该账号已登录; 50014: Token 过期;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        ElMessageBox.confirm('您已注销，您可以取消以停留在此页，或重新登录', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      } else if (res.code === 50010) { // 账号被冻结
        ElMessage({
          message: res.msg || 'Error',
          type: 'warning',
          duration: 3 * 1000
        })
      } else {
        ElMessage({
          message: res.msg || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('错误' + error)
    ElMessage({ // 返回错误
      message: error.response.data.msg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service