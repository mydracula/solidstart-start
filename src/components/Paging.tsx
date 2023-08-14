import { For, createEffect, splitProps } from "solid-js";
import { searchPageHook } from '~/utils/index'
// import '~/components/console.scss'


export default function Paging(props: any) {
    const [local] = splitProps(props.searchPageData, ["pagination", "pageList", "setSongList", "setPagination", "getSearchResults"]);

    const commonReq = async (copy: any) => {
        local.setPagination(copy)
        local.getSearchResults(props.value)
    }
    const previous = async (b: Boolean) => {
        if (b) {
            const copy = local.pagination()
            copy.page--
            commonReq(copy)
        }
    }
    const next = async (b: Boolean) => {
        if (b) {
            const copy = local.pagination()
            copy.page++
            commonReq(copy)
        }
    }
    const jump = async (v: number | string) => {
        if (v === local.pagination().page || v === '...') return
        const copy = local.pagination()
        copy.page = v as number
        commonReq(copy)
    }




    return (
        <>
            <nav class="pagination text-center text-[14px] mt-[48px] items-center justify-center flex">
                <div class="w-[42px] h-[42px] leading-[42px]" classList={{ 'page_up': local.pagination().page > 1 }} onClick={() => previous(local.pagination().page > 1)}>
                    <i class="select-none icon-[carbon--chevron-left]  text-center  m-0 text-[#999] cursor-default opacity-[5] text-[18px] align-middle"></i>
                </div>
                <ul class="flex overflow-x-auto items-center">
                    <For each={local.pageList()}>{(page) =>
                        <li classList={{ 'page_current': page === local.pagination().page, 'page_item': page != '...' }} class="cursor-default text-[14px] mx-[5px] user-select leanding-[20px]" onClick={() => jump(page)}>
                            <span class="select-none w-[42px] h-[42px] text-center leading-[42px] block text-[#999]">{page}</span>
                        </li>
                    }</For>
                </ul>
                <div class="w-[42px] h-[42px] leading-[42px] group" classList={{ 'page_down': local.pagination().page !== local.pagination().pages }} onClick={() => next(local.pagination().page < local.pagination().pages)}>
                    <i class="select-none icon-[carbon--chevron-right]  text-center  m-0 text-[#999] cursor-default opacity-[5] text-[18px] align-middle"></i>
                </div>
            </nav>
        </>
    )
}