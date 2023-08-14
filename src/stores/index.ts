import { createEffect } from 'solid-js'
import { createSignal, createMemo, createRoot } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

export const [store, setStore] = createStore({
  innerHeight: -1,
  isMobile: false,
  loading: true,
  musicList: [],
  isPlay: false,
  currentIndex: -1,
  currentTime: null,
  musicId: 0,
  musicDetail: {
    songTimeMinutes: '00:00',
    duration: 0,
    name: null,
    artist: null,
    albumpic: null,
    lrc: [],
    kw: null,
    lyrIndex: 0
  }
}) as any

export const [source, setSource] = createSignal('')
export const [playing, setPlaying] = createSignal(false)
export const [volume, setVolume] = createSignal(0.35)
