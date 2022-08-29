import request from '@/utils/request'

type userInfo = { // 定义login函数参数类型
  username: string,
  password: string
}

// 用户注册接口
export function userRegister(data: userInfo) {
  return request({
    url: '/api/users/register',
    method: 'post',
    data
  })
}

// 用户登录接口
export function userLogin(data: userInfo) {
  return request({
    url: '/api/users/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfoApi(params: string) {
  return request({
    url: '/api/users/profile',
    method: 'get',
    params
  })
}

// 获取存档
export function fetchArchive() {
  return request({
    url: '/api/users/fetchArchive',
    method: 'get'
  })
}

// 存档
export function saveArchive(data) {
  return request({
    url: '/api/users/update',
    method: 'post',
    data
  })
}

// 登出接口
export function logoutApi(params: string) {
  return request({
    url: '/api/users/logout',
    method: 'get'
  })
}
