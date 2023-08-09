export function generateQueryString (params: Record<string, any>) {
  let queryString = ''
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key]
      if (queryString !== '') {
        queryString += '&'
      }
      queryString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    }
  }
  return queryString
}

export const handleMusicTime = (time: string | number) => {
  if (!time) return '00:00'
  // 如果超过了100000 基本都是毫秒为单位的了 先转成秒的
  time = parseInt(time as string)
  if (time > 10000) {
    time = Math.floor(time / 1000)
  } else {
    time = Math.floor(time)
  }
  let m = Math.floor(time / 60)
  let s = Math.floor(time % 60)
  m = (m < 10 ? '0' + m : m) as number
  s = (s < 10 ? '0' + s : s) as number
  return m + ':' + s
}

export const fetchKw = async (id: number) => {
  const { kw } = await (
    await fetch('/api/searchSong', {
      method: 'POST',
      body: JSON.stringify({
        id
      })
    })
  ).json()
  return kw
}

export const fetchLrc = async (id: number) => {
  const { lrc } = await (
    await fetch('/api/searchLrc', {
      method: 'POST',
      body: JSON.stringify({
        id
      })
    })
  ).json()
  return lrc
}
