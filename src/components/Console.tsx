import { createEffect, createSignal, For, onMount, Show, createResource, Accessor, Resource, type ResourceReturn } from "solid-js"
import './console.css'

export default function Search(props: {
    slug: string
}) {
    const [loading, setLoading] = createSignal<any>(true)

    const [pageList, setPageList] = createSignal<any>()
    const [pagination, setPagination] = createSignal({
        page: 1,
        pageSize: 20,
        total: 0,
        pages: 1,
    })
    const [songList, { mutate }] = createResource(props.slug, getSongList) as ResourceReturn<any>
    const getPageList = (paging: any) => {
        const { pages, page } = paging
        if (pages < 4) return new Array(pages).fill(1).map((num, index) => num + index)
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
                if ((1 + pages) / 2 === page) return Array.from({ length: pages }, (v, i) => i + 1)
            }
            if (page + 1 === pages - 1) return [1, '...', page - 1, page, page + 1, pages]
            if (page - 1 === 1 + 1) return [1, page - 1, page, page + 1, '...', pages]
        }
        if (diff > 2) {
            if (pages <= 4) return [1, '...', pages - 1, pages]
            return [1, '...', page - 1, page, page + 1, '...', pages]
        }
    }
    async function getSongList() {
        setLoading(true)
        const { data, paging } = await fetch("/api/search", {
            method: "POST",
            body: JSON.stringify({
                keyword: props.slug,
                page: pagination().page
            }),
        }).then(rep => rep.json())
        setPagination(paging)
        setPageList(getPageList(paging))
        return new Promise((resolve, reject) => {
            setLoading(false)
            resolve(data);
        });
    }
    const commonReq = async (copy: any) => {
        mutate([])
        setPagination(copy)
        const rep = await getSongList()
        mutate(rep)
    }
    const previous = async (b: Boolean) => {
        if (b) {
            const copy = pagination()
            copy.page--
            commonReq(copy)
        }
    }
    const next = async (b: Boolean) => {
        if (b) {
            const copy = pagination()
            copy.page++
            commonReq(copy)
        }
    }
    const jump = async (v: number | string) => {
        if (v === pagination().page || v === '...') return
        const copy = pagination()
        copy.page = v as number
        commonReq(copy)
    }



    return (
        <div class="min-h-[100px]">
            <div class="btns mt-[32px] mb-[40px] flex" classList={{ 'hidden': songList.loading }}>
                <button class="play bg_primary w-[150px] bg-[#ffe12c] flex items-center justify-center px-[30px] h-[40px] mr-[10px] text-center rounded-[22px] border-none text-[16px] cursor-pointer"><i class="iconfont icon-icon_play_"></i><span >播放全部</span></button>
            </div>
            <div classList={{ 'relative': loading() }}>
                <div classList={{ 'hidden': songList.loading }}>
                    <div class="h-[46px] leading-[46px] bg-[#fafafa] text-[#999]">
                        <ul class="flex items-center">
                            <li class="head_num w-[13.13%] pl-[2.81%] min-w-[180px]">序号</li>
                            <li class="head_name w-[28.2%]">歌曲</li>
                            <li class="head_artist w-[24%]">歌手</li>
                            <li class="head_album flex-1">专辑</li>
                            <li class="head_time w-[5.8%]">时长</li>
                        </ul>
                    </div>
                    <ul class="song_list">
                        <For each={songList()}>
                            {(song, i) => (
                                <li class="h-[70px] leading-[22px] text-[#666] flex items-center hover:bg-[#f5f5f5] group">
                                    <div class="w-[13.13%] relative pl-[3.18%] min-w-[180px] pr-[20px] flex items-center">
                                        <div class="rank_num"><span>{(pagination().page - 1) * 20 + i() + 1}</span></div>
                                        <img src="https://h5static.kuwo.cn/upload/image/4f768883f75b17a426c95b93692d98bec7d3ee9240f77f5ea68fc63870fdb050.png" class="ml-[30%] w-[54px] h-[54px] flex-shrink-0 lazyload" data-src={song.albumpic} />
                                    </div>
                                    <div class="w-[28.2%] pr-[2.43%] flex items-center text-[#333]">
                                        <a href="javascript:;" class="cursor-pointer text-[#333] shrink overflow-hidden" innerHTML={song.name}></a>
                                    </div>
                                    <div class="w-[24%] overflow-hidden text-ellipsis whitespace-nowrap pr-[1%]">
                                        <span class="cursor-pointer" innerHTML={song.artist}></span>
                                    </div>
                                    <div class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                        <span class="cursor-pointer" innerHTML={song.album}></span>
                                    </div>
                                    <div class="w-[5.8%] pr-[3.93%] group-hover:hidden">
                                        <span class="cursor-pointer">{song.songTimeMinutes}</span>
                                    </div>
                                    <div class="w-[17.7%] pl-[4.28%] justify-between mr-[3.93%] text-[20px] hidden group-hover:flex"><i class="icon-[carbon--play]"></i> <i class="icon-[carbon--music-add]"></i> <i class="icon-[carbon--favorite]"></i> <i class="icon-[carbon--download]"></i></div>
                                </li>
                            )}
                        </For>
                    </ul>
                </div>
                <div class="loading-mask" classList={{ '!hidden': !loading() }}><div class="loading-wrap absolute top-[10%] left-0 right w-[stretch]"><div class="load h-[22px] leading-[22px] text-center"><span class="side1"></span> <span class="side2"></span> <span class="mid"></span> <span class="side2"></span> <span class="side1"></span></div> </div></div>
                <nav class="pagination text-center text-[14px] mt-[48px] items-center justify-center flex">
                    <div class="w-[42px] h-[42px] leading-[42px]" classList={{ 'page_up': pagination().page > 1 }} onClick={() => previous(pagination().page > 1)}>
                        <i class="select-none icon-[carbon--chevron-left]  text-center  m-0 text-[#999] cursor-default opacity-[5] text-[18px] align-middle"></i>
                    </div>
                    <ul class="flex overflow-hidden items-center">
                        <For each={pageList()}>{(page, i) =>
                            <li classList={{ 'page_current': page === pagination().page, 'page_item': page != '...' }} class="cursor-default text-[14px] mx-[5px] user-select leanding-[20px]" onClick={() => jump(page)}>
                                <span class="select-none w-[42px] h-[42px] text-center leading-[42px] block text-[#999]">{page}</span>
                            </li>
                        }</For>
                    </ul>
                    <div class="w-[42px] h-[42px] leading-[42px] group" classList={{ 'page_down': pagination().page !== pagination().pages }} onClick={() => next(pagination().page < pagination().pages)}>
                        <i class="select-none icon-[carbon--chevron-right]  text-center  m-0 text-[#999] cursor-default opacity-[5] text-[18px] align-middle"></i>
                    </div>
                </nav>
            </div>

        </div>
    )
}

