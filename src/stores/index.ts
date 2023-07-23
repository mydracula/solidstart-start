import { createSignal, createMemo, createRoot } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

export const [plays, setPlays] = createStore([])

export const increment = (play: any) => {
  setPlays(
    produce((t: any) => {
      t.push(play)
    })
  )
}
