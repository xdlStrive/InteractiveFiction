import { createRouter, createWebHashHistory } from 'vue-router'

export const defaultRoutes = [
  // 首页
  {
    path: '/',
    redirect: '/login'
  },
  // 登录
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  // 书页
  {
    path: '/book',
    name: 'book',
    component: () => import('@/views/index/index')
  },
  // 安全屋
  {
    path: '/safe-house',
    name: 'safe-house',
    component: () => import('@/views/userProfile/index')
  },
  {
    path: '/:pathMatch(.*)*', // vue3中路径通配符*被移除，改为正则匹配
    name: '404 not-find',
    // component: () => import()
  }
]

const router = createRouter({
  scrollBehavior: () => ({ y: 0 }),
  history: createWebHashHistory(),
  routes: defaultRoutes
})

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // 重置路由
}

export default router