import { For, Show, createEffect, createResource, onMount } from "solid-js"
import { createMemo } from "solid-js";
import { createSignal } from "solid-js"
import { searchPageHook } from '~/utils/index'
import Paging from '~/components/Paging'
import { store } from "~/stores";
import { Navigate } from "solid-start";

export default function SearchIndex() {
  const searchPageData = searchPageHook()
  const { getSearchResults, songList, pagination, playAll, play, addToPlaylist } = searchPageData
  const [value, setValue] = createSignal<string>("")
  const handleInput = async (e: Event) => {
    const val = (e.target as HTMLInputElement).value
    setValue(val)
  }

  const enterTap = async (key: string) => {
    if (key === 'Enter' && value()) {
      getSearchResults(value())
    }
  }

  return (
    <div id="search" class={`p-[20px] min-[765px]:hidden h-full`} style={`background:linear-gradient(-225deg, #e3fdf5 0, #ffe6fa 100%);`}>
      <div class="inner w-full flex flex-col h-full" style={`background: url('https://pic.ziyuan.wang/2023/08/12/75981bedf8a6e.png') no-repeat bottom right;`}>
        <div class="header flex bg-[rgba(253,253,253,0.5)] rounded-[48px] py-[8px] px-[24px] mb-[20px] text-[18px] items-center border border-[#999]">
          <div class="icon text-[#999] text-[30px] px-[10px] h-[40px] flex items-center">
            <div class="icon-[carbon--search]"></div>
          </div>
          <input type="search" value={value()} onInput={(e) => handleInput(e)} onKeyPress={(e) => enterTap(e.key)} class="w-full text-[#333] bg-transparent border-0" placeholder="搜索你想听的歌曲" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck={false} maxlength="512" />
        </div>


        <div class="results mb-[22px] p-[30px] pb-[5px]  flex-1 h-0 rounded-[5px] text-[#333] flex flex-col" style={`background:rgba(253,253,253,0.7);`} >
          <Show
            when={songList().length}
          >
            <div class="h-[44px] leading-[44px] text-[#333] flex justify-between">
              <span>找到 {pagination().total} 条结果</span>
              <span onClick={playAll}>播放全部</span>
            </div>
            <hr class="border-0 h-[2px]" style="background-image:repeating-linear-gradient(-45deg,#eff2f3,#ccc .25rem,transparent .25rem,transparent .5rem)" />

            <div id="search-hits" class="mt-[10px] flex-1 h-0 flex flex-col">
              <ol class="h-0 flex-1 overflow-y-auto olScrollBar">
                <For each={songList()}>
                  {(song, i) => (
                    <li class="my-[15px] border-b-[1px] border-[#ccc] border-dashed flex leading-[2] items-center">
                      <div class="h-[50px] mx-[10px] w-[50px]">
                        <img src="https://h5static.kuwo.cn/upload/image/4f768883f75b17a426c95b93692d98bec7d3ee9240f77f5ea68fc63870fdb050.png" class="w-full lazyload  h-full" data-src={song.albumpic} />
                      </div>
                      <div class="songName flex flex-col flex-1  overflow-hidden w-0">
                        <span class="truncate" innerHTML={song.name}></span>
                        <p class="truncate"><span innerHTML={song.artist}></span> ·  <span innerHTML={song.album}></span></p>
                      </div>
                      <div class="min-w-[100px] flex items-center justify-center">
                        <span class="icon-[carbon--play-filled] text-[#bbbbbb]  text-[22px] mr-[20px]" onClick={() => play(song)}></span>
                        <span class="icon-[carbon--add-filled] text-[#bbbbbb]  text-[22px]" onClick={() => addToPlaylist(song)}></span>
                      </div>
                    </li>
                  )}
                </For>
              </ol>

              <Paging value={value()} searchPageData={searchPageData}></Paging>
            </div>
          </Show>

        </div>

      </div>
    </div>
  );
}
