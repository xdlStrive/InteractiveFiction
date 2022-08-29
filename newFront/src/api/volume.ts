import request from '@/utils/request'

export function addVolume(data) {
  return request({
    url: '/api/volume/add',
    method: 'post',
    data
  })
}

export function fetchVolumeList() {
  return request({
    url: '/api/volume/list',
    method: 'get'
  })
}
