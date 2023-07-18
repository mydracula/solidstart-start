import { createMemo, createSignal, For, createResource, type ResourceReturn } from "solid-js"
import './search.css'
import { useNavigate } from "solid-start";
export default function Search() {
  const navigate = useNavigate();
  const [beFocused, setBeFocused] = createSignal(false)
  const [value, setValue] = createSignal<string>("")
  const [searchs] = createResource(value, getSearchTip) as ResourceReturn<any>
  const hotKey = createMemo<any>(() => beFocused() && value() && !searchs.loading && searchs().length);

  async function getSearchTip() {
    if (!value()) return
    const { data } = await fetch("/api/searchTip", {
      method: "POST",
      body: JSON.stringify({
        keyword: value()
      }),
    }).then(rep => rep.json())
    return new Promise((resolve) => {
      const searchs = data.find((i: { LableName: string }) => !i.LableName)?.RecordDatas;
      resolve(searchs);
    });
  }
  const enterTap = (key: string) => {
    if (key === 'Enter' && value()) {
      navigate(`/search/${value()}`);
    }
  }



  return (
    <div class="w-[294px] search_out absolute right-[100%] top-1/2 bg-gray-100 -translate-y-1/2 z-50  max-[1386px]:w-[33px] max-[1386px]:overflow-hidden hover:w-[294px]" classList={{ 'search_focus': beFocused() }} >
      <div>
        <div
          class="relative flex items-center pl-[8px] rounded-[2px] z-[10] bg-[#f5f5f5]"
        >
          <button
            class="icon-[carbon--search] text-[#999] text-[16px] min-w-[16px]"
          ></button>
          <input
            id="search"
            class="inline-block h-[34px] flex-[1] leading-[34px] border-none mr-[24px] pl-[10px] bg-[#f5f5f5] text-[14px] max-[1386px]:overflow-hidden"
            maxlength="128"
            type="text"
            placeholder="搜索音乐/MV/歌单/歌手"
            onInput={e => setValue(e.currentTarget.value)}
            onBlur={() => setBeFocused(false)}
            onFocus={(e) => setBeFocused(true)}
            onKeyPress={(e) => enterTap(e.key)}
          />
        </div>


        <div class="list absolute top-[0] left-[0] bg-[#fff] pt-[18px] pb-[15px] opacity-0 z-0 shadow-[0_10px_30px_0_rgba(65,67,70,.08)] rounded-[4px] transition-[top] duration-4000 ease-in-out w-[100%]" classList={{ host: hotKey() }}>


          <ul>
            <For each={searchs.latest}>{(k, i) =>
              <li class="h-[38px] leading-[38px] font-[300] bg-[#fff] px-[18px] hover:cursor-pointer hover:bg-[#f5f5f5] overflow-hidden">
                {k.HintInfo}
              </li>
            }</For>
          </ul>
        </div>
      </div>

    </div>
  )
}

