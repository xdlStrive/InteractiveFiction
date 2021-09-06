import request from '@/utils/request'

export function fetchAphorism() {
  return request({
    url: '/aphorism/fetch',
    method: 'get'
  })
}

export function addAphorism(data) {
  return request({
    url: '/aphorism/add',
    method: 'post',
    data: data
  })
}
