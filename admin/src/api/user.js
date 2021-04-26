import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/users/profile',
    method: 'get',
    params: { token }
  })
}

// 登出接口
export function logout() {
  return request({
    url: '/users/logout',
    method: 'post'
  })
}

// 获取全部用户列表
export function fetchUsersList() {
  return request({
    url: '/users/fetchList',
    method: 'get'
  })
}
