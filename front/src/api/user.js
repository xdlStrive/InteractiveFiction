import request from '@/utils/request'

// 用户注册接口
export function userRegister(data) {
  return request({
    url: '/users/register',
    method: 'post',
    data
  })
}

// 用户登录接口
export function userLogin(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(params) {
  return request({
    url: '/users/profile',
    method: 'get',
    params
  })
}

// 获取存档
export function fetchArchive() {
  return request({
    url: '/users/fetchArchive',
    method: 'get'
  })
}

// 存档
export function saveArchive(data) {
  return request({
    url: '/users/update',
    method: 'post',
    data
  })
}

// 登出接口
export function logout() {
  return request({
    url: '/users/logout',
    method: 'get'
  })
}
