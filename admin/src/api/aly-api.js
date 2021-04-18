import request from '@/utils/request'

export function getCPUUtilizationList(params) {
  return request({
    url: '/alyapi/cpuutilization',
    method: 'get',
    params
  })
}

export function getCPUUtilizationLast(data) {
  return request({
    url: '/alyapi/cpuutilization1',
    method: 'post',
    data
  })
}
