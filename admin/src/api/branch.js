import request from '@/utils/request'

export function addBranch(data) {
  return request({
    url: '/branch/add',
    method: 'post',
    data
  })
}

export function modifyBranch(data) {
  return request({
    url: '/branch/modify',
    method: 'post',
    data
  })
}
