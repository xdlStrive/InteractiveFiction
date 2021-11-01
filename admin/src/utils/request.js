import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request 拦截器
service.interceptors.request.use(
  config => {
    // 发出请求前执行事件

    if (store.getters.token) {
      // 让每个请求携带token
      // ['X-Token'] 是自定义headers key
      // 请根据实际情况修改
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
  /**
   * 如果您想获取http信息，如标题或状态，请返回response=>response

   * 通过自定义代码确定请求状态。这里只是一个例子，您还可以通过HTTP状态码来判断状态
   */
  response => {
    const res = response.data
    // 如果自定义code不是20000，则将其判断为错误
    if (res.code !== 20000) {
      // 50008: 无效Token; 50012: 该账号已登录; 50014: Token 过期
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // 重新登录
        MessageBox.confirm('您已注销，您可以取消以停留在此页，或重新登录', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      } else if (res.code === 50010) {
        Message({
          message: res.msg || 'Error',
          type: 'warning',
          duration: 3 * 1000
        })
      } else {
        Message({
          message: res.msg || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else { // 如果状态码为20000时
      return res
    }
  },
  error => {
    console.log('错误' + error) // for debug
    Message({
      message: error.response.data.msg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
