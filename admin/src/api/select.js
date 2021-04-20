import request from '@/utils/request'

// 新增选择接口
export function newSelect(data) {
  return request({
    url: '/select/newSelect',
    method: 'post',
    data
  })
}

// 搜索选择接口
export function searchSelect(data) {
  return request({
    url: '/select/search?note=' + data,
    method: 'get'
  })
}

// 获取选择列表数据
export function fetchListData() {
  return request({
    url: '/select/fetchList',
    method: 'get'
  })
}
