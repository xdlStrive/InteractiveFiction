import { request } from '@/utils/request'

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

