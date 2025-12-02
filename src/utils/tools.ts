export function getNormalPath(p: string) {
  if (p.length === 0 || !p || p == 'undefined') {
    return p
  }
  let res = p.replace('//', '/')
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1)
  }
  return res
}

export function isHttp(path: string) {
  return /^(https?:|mailto:|tel:)/.test(path)
}
