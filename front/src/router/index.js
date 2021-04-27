import { createRouter, createWebHashHistory } from 'vue-router'

export const defaultRoutes = [
  // 登录
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
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