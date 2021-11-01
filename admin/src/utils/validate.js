
/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) { // 验证登录名是否是这几个中的一个
  const valid_map = ['admin', 'readers', 'ceshi']
  return valid_map.indexOf(str.trim()) >= 0
}
