import request from '@/utils/request'

export function postTimelineItem(data) {
  return request({
    url: '/timeline/create',
    method: 'post',
    data
  })
}

export function fetchTimelineList() {
  return request({
    url: '/timeline/fetchList',
    method: 'get'
  })
}
