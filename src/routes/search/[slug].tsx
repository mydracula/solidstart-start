import { useParams, useRouteData } from "solid-start";
import Console from "~/components/Console";






export default function Slug() {
    const params = useParams();
    console.log(params.slug);

    return (
        <div class="max-w-[1640px] mx-auto px-[7.5rem] pjax">
            <div class="max-[765px]:hidden flex items-end mt-[43px] mb-[42px]">
                <span class="text text-[22px] font-[600] leading-[30px] mr-[40px]"
                >搜索结果
                </span>
                <div class="leading-[1]">
                    <a
                        href="javascript:;"
                        class="font-[600] text-[14px] relative inline-block h-[20px] leading-[20px] mr-[34px] text-[#333] after:left-[0] after:bottom-[1px] after:w-[100%] after:h-[6px] after:bg-[#ffe443] after:absolute after:content-[''] after:z-[-1]"
                    >单曲
                    </a><a
                        href="javascript:;"
                        class="font-[300] text-[14px] relative inline-block h-[20px] leading-[20px] mr-[34px] text-[#333]"
                    >专辑
                    </a><a
                        href="javascript:;"
                        class="font-[300] text-[14px] relative inline-block h-[20px] leading-[20px] mr-[34px] text-[#333]"
                    >MV</a>
                    <a
                        href="javascript:;"
                        class="font-[300] text-[14px] relative inline-block h-[20px] leading-[20px] mr-[34px] text-[#333]"
                    >歌单
                    </a>
                    <a
                        href="javascript:;"
                        class="font-[300] text-[14px] relative inline-block h-[20px] leading-[20px] mr-[34px] text-[#333]"
                    >歌手
                    </a>
                </div>
            </div>
            {/* <Console slug={slug} /> */}
        </div>
    )
}