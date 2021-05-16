import request from '@/utils/request'

// 查询一章章节
export function fetchOneChapter(query) {
  return request({
    url: '/chapter/oneChapter',
    method: 'get',
    params: query
  })
}