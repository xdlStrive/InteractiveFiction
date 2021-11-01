import router from '@/router'
import store from '@/store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 进度条样式
import { getToken } from '@/utils/auth' // 从cookie中获取token
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress 配置

const whiteList = ['/login'] // 在白名单重定向中

// 全局路由前置守卫
router.beforeEach(async(to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 确定用户是否已登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，则重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // 获取用户信息
          await store.dispatch('user/getInfo')
          next()
        } catch (error) {
          // 移除token并转到登录页以重新登录
          await store.dispatch('user/resetToken')
          Message.error(error || '抱歉出错了...')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else { /* 没有token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录的白名单中，直接进入
      next()
    } else {
      // 没有访问权限的其他页将重定向到登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

// 路由后置守卫
router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})
