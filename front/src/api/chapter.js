import request from '@/utils/request'

// 查询一章章节
export function fetchOneChapter(query) {
  return request({
    url: '/chapter/oneChapter',
    method: 'get',
    params: query
  })
}

// 查询某卷的章节列表
export function fetchVolumesChapterList(query) {
  return request({
    url: '/chapter/volumesList',
    method: 'get',
    params: query
  })
}