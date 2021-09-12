import request from '@/utils/request'

export function addVolume(data) {
  return request({
    url: '/volume/add',
    method: 'post',
    data
  })
}

export function fetchVolumeList(data) {
  return request({
    url: '/volume/list',
    method: 'get',
    params: data
  })
}
