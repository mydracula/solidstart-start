import { createMemo, createSignal, For, createResource, type ResourceReturn, createEffect } from "solid-js"
import './search.scss'
import { useNavigate } from "solid-start";
import { setStore, store } from '~/stores/index'
export default function Search() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(true)
  const [tip, setTip] = createSignal([]) as any
  const [focus, setfocus] = createSignal(false)
  const [tipShow, setTipShow] = createSignal(false)
  const [value, setValue] = createSignal<string>("")
  // const [tip, { mutate }] = createResource(value, getTip) as ResourceReturn<any>
  // const hotKey = createMemo<any>(() => focus() && value() && !tip.loading && tip().length || tipShow());

  async function getTip(val: string) {
    if (!val) return
    setLoading(true)
    const { data } = await fetch("/api/searchTip", {
      method: "POST",
      body: JSON.stringify({
        keyword: val
      }),
    }).then(rep => rep.json())
    return new Promise((resolve) => {
      const searchs = data.find((i: { LableName: string }) => !i.LableName)?.RecordDatas;
      setLoading(false)
      resolve(searchs);
    });
  }
  const enterTap = (key: string) => {
    if (key === 'Enter' && value()) {
      (document.activeElement as HTMLInputElement).blur()
      navigate(`/search/${value()}`);
    }
  }

  const enterClick = (e: MouseEvent & { currentTarget: HTMLLIElement; target: Element; }) => {
    const href = e.currentTarget.innerText
    setValue(href)
    navigate(`/search/${href}`);
    setTip([])
    setLoading(true)
    setTipShow(false)
  }

  const handleBlur = () => {
    if (!tipShow()) setTip([])
    setfocus(false)
  }



  const handleFocus = async (e: Event) => {
    const val = (e.target as HTMLInputElement).value
    const tip = await getTip(val)
    setTip(tip)
    setfocus(true)
  }

  const handleInput = async (e: Event) => {
    const val = (e.target as HTMLInputElement).value
    setValue(val)
    const tip = await getTip(val)
    setTip(tip)
  }

  return (
    <div class="w-[294px] search_out absolute right-[100%] top-1/2 bg-gray-100 -translate-y-1/2 z-50  max-[1386px]:w-[33px] max-[1386px]:overflow-hidden hover:w-[294px]" classList={{ 'search_focus': focus() || tipShow() }} >
      <div>
        <div
          class="relative flex items-center pl-[8px] rounded-[2px] z-[10] bg-[#f5f5f5]"
        >

          <button
            class="icon-[carbon--search] text-[#999] text-[16px] min-w-[16px]"
          ></button>
          <input
            id="search"
            autocomplete="off"
            class="inline-block h-[34px] flex-[1] leading-[34px] border-none mr-[24px] pl-[10px] bg-[#f5f5f5] text-[14px] max-[1386px]:overflow-hidden"
            maxlength="128"
            type="text"
            placeholder="搜索音乐/MV/歌单/歌手"
            value={value()}
            onInput={(e) => handleInput(e)}
            onBlur={(e) => handleBlur()}
            onFocus={(e) => handleFocus(e)}
            onKeyPress={(e) => enterTap(e.key)}
          />
        </div>


        <div class="list absolute top-[0] left-[0] bg-[#fff] pt-[18px] pb-[15px] opacity-0 z-0 shadow-[0_10px_30px_0_rgba(65,67,70,.08)] rounded-[4px] transition-[top] duration-4000 ease-in-out w-[100%]" classList={{ host: !loading() && tip()?.length && (focus() || tipShow()) }}>
          <ul onMouseOver={() => setTipShow(true)} onMouseOut={() => setTipShow(false)}>
            <For each={tip()}>{(k, i) =>
              <li onclick={(e) => enterClick(e)} class="select-none iddd h-[38px] leading-[38px] font-[300] bg-[#fff] px-[18px] hover:cursor-pointer hover:bg-[#f5f5f5] overflow-hidden">
                {k.HintInfo}
              </li>
            }</For>
          </ul>
        </div>
      </div>

    </div>
  )
}

