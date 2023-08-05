import { A } from '@solidjs/router';
import Search from './Search';
import ThemeToggle from './ThemeToggle';
import { onMount } from 'solid-js';


export default function Common() {

    onMount(() => {
        document.body.addEventListener("vibisilitychange", () => {

            document.body.focus()

        });

        document.body.addEventListener('keydown', (e) => {
            console.log(e.currentTarget, e.target, '=>>');
        })

    })

    return (
        <>
            <A
                href="/search/"
                class="min-[766px]:hidden select-none cursor-pointer w-[91.467vw] h-[8.533vw] bg-[#f2f4f5] rounded-[5.333vw] box-border justify-center flex items-center mx-auto my-[5vw]"
            >
                <div class="w-[4.533vw] h-[4.533vw]">
                    <img
                        src="//h5static.kuwo.cn/www/kuwo-m/img/search@2x.a3b9c58.png"
                    />
                </div>
                <div
                    class="ml-[1.93vw] text-[1.8666vw] font-['PingFangSC-Regular'] font-[400] mt-[0.267vw] text-[#a1a4b3] text-center leading-normal"
                >
                    搜索你想听的歌曲
                </div>
            </A>
            <div
                class="border-b-[1px] border-solid border-[#f0f0f0] max-[765px]:hidden"
            >
                <div
                    class="max-w-[1640px] mx-auto px-[7.5rem] flex items-center justify-between"
                >
                    <div class="flex items-center">
                        <A href="/">
                            <img
                                class="logo relative top-[-4px] w-[131px] h-[39px] mr-[39px]"
                                src="https://h5static.kuwo.cn/www/kw-www/img/logo.7bf8751.png"
                            />
                        </A>
                        <ul
                            class="flex h-[4.1875rem] leading-[4.1785rem] max-[1060px]:w-[1px] max-[1060px]:overflow-hidden max-[1060px]:invisible"
                        >
                            <li class="mr-[4px] font-[600] bg-[#ffe443]">
                                <a
                                    href="javascript:;"
                                    class="px-[14px] text-[#333] w-full h-full inline-block align-middle"
                                >发现音乐
                                </a>
                            </li>
                            <li class="mr-[4px] font-[200]">
                                <a
                                    href="javascript:;"
                                    class="px-[14px] w-full h-full inline-block"
                                >下载客户端
                                </a>
                            </li>
                            <li class="mr-[4px] font-[200]">
                                <a
                                    href="javascript:;"
                                    class="px-[14px] w-full h-full inline-block"
                                >音乐现场
                                </a>
                            </li>
                            <li class="mr-[4px] font-[200]">
                                <a
                                    href="javascript:;"
                                    class="px-[14px] w-full h-full inline-block"
                                >VIP会员
                                </a>
                            </li>
                            <li class="mr-[4px] font-[200]">
                                <a
                                    href="javascript:;"
                                    class="px-[14px] w-full h-full inline-block"
                                >酷我畅听
                                </a>
                            </li>
                            <li class="mr-[4px] font-[200]">
                                <a
                                    href="javascript:;"
                                    class="px-[14px] w-full h-full inline-block"
                                >更多
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="right relative flex items-center">
                        <Search />
                        <div class="pl-[28px]"><ThemeToggle /></div>
                    </div>
                </div>
            </div>
        </>

    )
}