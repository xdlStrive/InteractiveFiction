import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  // 登录
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  // 仪表盘
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '仪表盘', icon: 'dashboard' }
    }]
  },
  // 文章管理
  {
    path: '/article',
    component: Layout,
    name: 'Article',
    meta: { title: '文章管理', icon: 'documentation' },
    children: [
      {
        path: 'create',
        name: 'CreateArticles',
        component: () => import('@/views/article/create'),
        meta: { title: '新增文章', icon: 'edit' }
      },
      {
        path: 'revise/:id', // 表示路径格式为edit/:id(数字)，\\d+表示必须为数字类型，如果掺入其他字符（包括英文）会报404
        name: 'ReviseArticles',
        component: () => import('@/views/article/revise'),
        meta: { title: '修改文章', noCache: true, activeMenu: '/article/list' },
        hidden: true
      },
      {
        path: 'list',
        name: 'ArticleList',
        component: () => import('@/views/article/list'),
        meta: { title: '章节列表', icon: 'list' }
      }
    ]
  },
  // 选择列表
  {
    path: '/select',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'select',
        component: () => import('@/views/select/index'),
        meta: { title: '选择列表', icon: 'list' }
      }
    ]
  },
  // 用户管理
  {
    path: '/userMGT',
    component: Layout,
    children: [{
      path: 'user',
      name: 'user',
      component: () => import('@/views/userMGT/user'),
      meta: { title: '用户管理', icon: 'user' }
    }]
  },
  // 开发记录
  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: '开发记录', icon: 'example' },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/timeline/index'),
        meta: { title: '开发时间轴', icon: 'table' }
      }
    ]
  },
  // 外链
  {
    path: '/external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.gitee.io/vue-element-admin-site/zh/',
        meta: { title: '外部链接', icon: 'link' }
      }
    ]
  },
  // 404页必须放在末尾！！！
  { path: '*', redirect: '/404', hidden: true },
  // 404错误
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

const createRouter = () => new Router({
  // 路由模式: 'history', // 需要服务支持
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // 重置路由
}

export default router
