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
    const body: { keyword: string } = await context.request.json()
    const { keyword } = body
    const values = generateQueryString({
        MusicTipCount: 10,
        keyword: decodeURI(keyword),
        pagesize: 10
    })

    const rawRes = await (await fetch(
        `https://searchtip.kugou.com/getSearchTip?${values}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "GET"
        }
    )).json()

    return new Response(JSON.stringify({
        code: 200,
        message: 'success',
        data: rawRes.data,
    }));
}
