import Cookies from 'js-cookie'

const TokenKey = 'user_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setTokens(token: string) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}