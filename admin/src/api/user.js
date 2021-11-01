import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/users/profile',
    method: 'get'
  })
}

// 登出接口
export function logout() {
  return request({
    url: '/users/logout',
    method: 'get'
  })
}

// 获取全部用户列表
export function fetchUsersList() {
  return request({
    url: '/users/fetchList',
    method: 'get'
  })
}

// 冻结用户
export function frozenUser(data) {
  return request({
    url: '/users/update',
    method: 'post',
    data
  })
}
