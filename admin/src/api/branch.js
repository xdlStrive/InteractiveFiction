import request from '@/utils/request'

export function addBranch() {
  return request({
    url: '/branch/add',
    method: 'post'
  })
}
