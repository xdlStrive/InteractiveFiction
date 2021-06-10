import request from '@/utils/request'

export function addBranch(data) {
  return request({
    url: '/branch/add',
    method: 'post',
    data
  })
}
