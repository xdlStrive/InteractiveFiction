import store from '@/store'

function checkPermission(el, binding) {
  const { value } = binding
  const roles = store.getters && store.getters.roles

  if (value) {
    const permissionRoles = value
    const hasPermission = roles === permissionRoles

    if (hasPermission) { // 如果不满足权限，则移除该元素及其父元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`需要权限信息！！！`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
