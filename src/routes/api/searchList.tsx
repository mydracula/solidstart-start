import { APIEvent, json } from "solid-start/api";
import { generateQueryString } from '~/utils/index'


export const config = {
    runtime: "edge",
    regions: [
        "hkg1",
        "sin1",
        "kix1",
        "icn1",
        "bom1",
        "hnd1",
        "arn1",
        "bru1",
        "cdg1",
        "cle1",
        "cpt1a",
        "dub1",
        "fra1",
        "gru1",
        "iad1",
        "lhr1",
        "pdx1",
        "sfo1",
        "syd1"
    ]
}



export async function POST(context: APIEvent) {
    const body: { keyword: string, page: number } = await context.request.json()
    const { keyword, page } = body
    const values = generateQueryString({
        key: decodeURI(keyword),
        pn: page,
        rn: 20,
        httpsStatus: 1,
        plat: 'web_www'
    })


    const rawRes = await (await fetch(
        `http://www.kuwo.cn/api/www/search/searchMusicBykeyWord?${values}`,
        {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Referer": "http://www.kuwo.cn/search/list?",
                "Cookie": "Hm_Iuvt_cdb524f42f0ce19b169b8072123a4727=6GZ27pK4diBJayHxFrRNzJWKbbyMWzAW",
                "Secret": "681b205ecdf4a63dda52af0ac59fd1857bc7abc6c7a76bc01a1e759cf3c3566c0417bbca"
            },
            method: "GET"
        }
    )).json()

    console.log(rawRes);


    return new Response(JSON.stringify({
        code: 200,
        message: 'success',
        data: rawRes.data.list,
        paging: {
            page,
            pageSize: 20,
            total: rawRes.data.total,
            pages: Math.ceil(rawRes.data.total / 20)
        }
    }));
}
