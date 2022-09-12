import request from '@/utils/request'

export function addBranch(data) {
  return request({
    url: '/api/branch/add',
    method: 'post',
    data
  })
}

export function modifyBranch(data) {
  return request({
    url: '/api/branch/modify',
    method: 'post',
    data
  })
}

export function fetchBranch(data) {
  return request({
    url: '/api/branch/fetch',
    method: 'post',
    data
  })
}
