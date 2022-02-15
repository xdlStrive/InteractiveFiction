import { RouterOptions, createRouter, createWebHashHistory, RouteRecordRaw, RouterScrollBehavior, createWebHistory } from 'vue-router'

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
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  // 书页
  {
    path: '/book',
    name: 'book',
    component: () => import('@/views/index/index.vue')
  },
  // 安全屋
  {
    path: '/safe-house',
    name: 'safe-house',
    component: () => import('@/views/userProfile/index.vue')
  },
  {
    path: '/:pathMatch(.*)*', // vue3中路径通配符*被移除，改为正则匹配
    name: '404 not-find',
    // component: () => import()
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: defaultRoutes as RouteRecordRaw[],
  // scrollBehavior: (() => ({ y: 0 })) as RouterScrollBehavior
})

export function resetRouter() {
  const newRouter = createRouter({} as RouterOptions)
  router.resolve = newRouter.resolve // 重置路由
}

export default router