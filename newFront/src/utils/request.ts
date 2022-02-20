/*
  2月7日问题：userinfo中用到了api方法，而api又调用了request，导致在userinfo加载完成前就加载了request；
  但在request中又调用了userinfo，导致了未加载完成userinfo之前，就使用了userinfo的情况，导致报错。
*/
import axios from 'axios'
import userInfo from '@/store/userInfo'
import { getToken } from './auth'

const userInfoStore = userInfo()
console.log(import.meta.env.BASE_URL)
// 创建axios实例
const service = axios.create({
  baseUrl: import.meta.env.BASE_URL,
  timeout: 5000 // 超时时间
})


// request 拦截器
service.interceptors.request.use(
  (config) => {
    // 发出请求前执行事件
    if (userInfoStore.token) { // 检查是否储存有token
      // 让每个请求携带token
      config.headers.authorization = getToken()
    }
    return config
  },
  error => {
    // 处理请求错误
    console.log(error)
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
        ElMessageBox.confirm('您已注销，您可以取消以停留在此页，或重新登录', '登出提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          userInfoStore.resetToken().then(() => {
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