import { APIEvent, json } from "solid-start/api";

import { generateQueryString } from '~/utils/index'


export async function POST(context: APIEvent) {
    const body: { keyword: string } = await context.request.json()
    const { keyword } = body
    const values = generateQueryString({
        MusicTipCount: 10,
        keyword,
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


    console.log(rawRes);


    return new Response(JSON.stringify({
        code: 200,
        message: 'success',
        data: rawRes.data,
    }));
}
