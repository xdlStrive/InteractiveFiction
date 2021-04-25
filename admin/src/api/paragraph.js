import request from '@/utils/request'

export function addParagraph(data) { // 上传段落接口
  return request({
    url: '/paragraph/add',
    method: 'post',
    data
  })
}

export function modifyParagraph(data) {
  return request({
    url: '/paragraph/modify',
    method: 'post',
    data
  })
}
