import request from '@/utils/request'

export function fetchAphorism() {
  return request({
    url: '/aphorism/fetch',
    method: 'get'
  })
}

export function fetchAphorismList() {
  return request({
    url: '/aphorism/fetchList',
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

export function modifyAphorism(data) {
  return request({
    url: '/aphorism/modify',
    method: 'post',
    data: data
  })
}

export function deleteAphorism(data) {
  return request({
    url: '/aphorism/delete',
    method: 'delete',
    data: data
  })
}
