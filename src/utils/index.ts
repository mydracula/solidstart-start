import { createEffect, createSignal, onCleanup } from 'solid-js'
import { createStore, produce, SetStoreFunction, Store } from 'solid-js/store'
import { store, setStore, setSource, setPlaying, playing } from '~/stores'

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

export const fetchList = async (body: any) => {
  const { data, paging } = await fetch('/api/searchList', {
    method: 'POST',
    body: JSON.stringify(body)
  }).then(rep => rep.json())
  return {
    data,
    paging
  }
}

export function debounce (fn: Function, delay = 500) {
  let timer: number | null = null
  return function () {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      // @ts-ignore
      fn.apply(this, arguments)
      timer = null
    }, delay)
  }
}

export function scrollIntoView (el: HTMLElement) {
  el!.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  })
}

export function getIsMobile () {
  setStore(
    'isMobile',
    window.matchMedia('only screen and (max-width: 765px)').matches
  )
  setStore('innerHeight', window.innerHeight)


  window.addEventListener('resize', () => {
    setStore(
      'isMobile',
      window.matchMedia('only screen and (max-width: 765px)').matches
    )
    // setStore('innerHeight', window.innerHeight)
  })
}

export function createLocalMusicList<T extends object> (name: string, init: T) {
  const localState = localStorage.getItem(name)
  setStore(
    produce((current: any) => {
      current.musicList = localState ? JSON.parse(localState) : init
    })
  )
  createEffect(() =>
    localStorage.setItem(name, JSON.stringify(store.musicList))
  )
}

export const getPageList = (paging: any) => {
  const { pages, page } = paging
  if (pages < 4)
    return new Array(pages).fill(1).map((num, index) => num + index)
  const startDiff = Math.abs(page - 1)
  const endDiff = Math.abs(page - pages)
  const diff = startDiff <= endDiff ? startDiff : endDiff
  if (diff == 0) {
    if (page === pages) return [1, '...', pages - 1, pages]
    return [1, 2, '...', pages]
  }
  if (diff == 1) {
    if (pages <= 4) return Array.from({ length: pages }, (v, i) => i + 1)
    if (pages - 1 === page) return [1, '...', page - 1, page, pages]
    return [1, 2, 3, '...', pages]
  }
  if (diff == 2) {
    if (pages <= 5) {
      if ((1 + pages) / 2 === page)
        return Array.from({ length: pages }, (v, i) => i + 1)
    }
    if (page + 1 === pages - 1)
      return [1, '...', page - 1, page, page + 1, pages]
    if (page - 1 === 1 + 1) return [1, page - 1, page, page + 1, '...', pages]
  }
  if (diff > 2) {
    if (pages <= 4) return [1, '...', pages - 1, pages]
    return [1, '...', page - 1, page, page + 1, '...', pages]
  }
}

export const searchPageHook = (fn?: Function) => {
  const [songList, setSongList] = createSignal([]) as any
  const [loading, setLoading] = createSignal(true)
  const [pageList, setPageList] = createSignal() as any
  const [pagination, setPagination] = createSignal({
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 1
  })
  async function getSongList (text: string) {
    setLoading(true)
    const { data, paging } = await fetchList({
      keyword: text,
      page: pagination().page
    })
    setPagination(paging)
    setPageList(getPageList(paging))

    return new Promise((resolve, reject) => {
      setLoading(false)
      fn && fn()
      resolve(data)
    })
  }

  const getSearchResults = async (text: string) =>
    setSongList(await getSongList(text))

  const play = async (song: any) => {
    if (song.rid === store.musicId) return
    setStore('loading', true)
    const isExist = store.musicList.find((i: any) => i.rid === song.rid)
    if (isExist) {
      const kw = await fetchKw(song.rid)
      setSource(kw)
      setPlaying(true)
      setStore(
        produce(async (current: any) => {
          const musicDetail = Object.assign({}, isExist)
          if (!('lrc' in musicDetail)) {
            const lrc = await fetchLrc(song.rid)
            musicDetail.lrc = lrc
          }
          musicDetail.lyrIndex = 0
          current.musicDetail = musicDetail
        })
      )
      setStore('loading', false)
      return
    }
    const kw = await fetchKw(song.rid)
    setSource(kw)
    setPlaying(true)
    setStore(
      'musicList',
      produce((m: any) => {
        m.unshift(song)
      })
    )
    setStore('musicId', song.rid)
    setStore(
      produce((current: any) => {
        current.musicDetail = song
      })
    )
    const { lrc } = await (
      await fetch('/api/searchLrc', {
        method: 'POST',
        body: JSON.stringify({
          id: song.rid
        })
      })
    ).json()
    setStore(
      'musicDetail',
      produce((current: any) => {
        current.lrc = lrc
        current.lyrIndex = 0
      })
    )
    setStore('loading', false)
  }

  const addToPlaylist = (song: any) => {
    const isExist = store.musicList.find((i: any) => i.rid === song.rid)
    if (isExist) return
    setStore(
      'musicList',
      produce((m: any) => {
        m.push(song)
      })
    )
  }

  const playAll = async () => {
    const musicList = store.musicList
    const filterList = songList().filter((item: { rid: number }) => {
      return !musicList.some((i: { rid: number }) => i.rid === item.rid)
    })
    const newList = musicList.concat(filterList)
    if (!playing()) {
      await play(newList[0])
    }
    setStore('musicList', newList)
  }

  return {
    play,
    addToPlaylist,
    pageList,
    setSongList,
    setPagination,
    getSearchResults,
    getSongList,
    songList,
    pagination,
    playAll
  }
}
