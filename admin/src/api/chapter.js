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

export function fetchChapterList(query) {
  return request({
    url: '/chapter/list',
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
