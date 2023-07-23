import { APIEvent, json } from "solid-start/api";


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
    const body: { id: string } = await context.request.json()
    const { id } = body

    const rawRes = await (await fetch(
        `http://rldm.sang.pub/api.php?id=${id}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "GET"
        }
    )).text()

    return new Response(JSON.stringify({
        code: 200,
        message: 'success',
        kw: rawRes
    }));
}
