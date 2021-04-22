import request from '@/utils/request'

export function addChapter(data) {
  return request({
    url: '/chapter/add',
    method: 'post',
    data
  })
}

export function modifyChapter(data) {
  return request({
    url: '/chapter/modify',
    method: 'post',
    data
  })
}

// 查询全部章节列表
export function fetchAllChapterList(query) {
  return request({
    url: '/chapter/allChapterList',
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

// 查询一章章节
export function fetchOneChapter(query) {
  return request({
    url: '/chapter/oneChapter',
    method: 'get',
    params: query
  })
}

// export function postArticleImg(data) {
//   return request({
//     url: '/article/images',
//     method: 'post',
//     headers: { 'Content-Type': 'multipart/form-data' },
//     data
//   })
// }

// export function postArticle(data) {
//   return request({
//     url: '/article/document',
//     method: 'post',
//     data
//   })
// }

// export function fetchArticle(query) {
//   return request({
//     url: '/article/article',
//     method: 'get',
//     params: query
//   })
// }

// export function reviseArticle(data) {
//   return request({
//     url: '/article/revise',
//     method: 'put',
//     data
//   })
// }

// export function deleteArticle(data) {
//   return request({
//     url: '/article/delete',
//     method: 'delete',
//     data
//   })
// }
