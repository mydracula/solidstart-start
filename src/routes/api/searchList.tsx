import { APIEvent, json } from "solid-start/api";
import { generateQueryString, handleMusicTime } from '~/utils/index'


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


// http://search.kuwo.cn/r.s?all=%E5%91%A8%E6%9D%B0%E4%BC%A6&ft=music&itemset=web_2013&client=kt&pn=0&rn=100&rformat=json&encoding=utf8



// http://search.kuwo.cn/r.s?newsearch=1&alflac=1&cluster=0&vermerge=1&show_copyright_off=1&pcmp4=1&ver=mbox&vipver=MUSIC_8.7.5.0_BCS34&plat=pc&devid=119153077&all=%E5%91%A8%E6%9D%B0%E4%BC%A6&ft=music&itemset=web_2013&client=kt&pn=1&rn=20&rformat=json&encoding=utf8&newsearch=1&alflac=1&cluster=0&vermerge=1&show_copyright_off=1&pcmp4=1&ver=mbox&vipver=MUSIC_8.7.5.0_BCS34&plat=pc&devid=119153077

export async function POST(context: APIEvent) {
    const body: { keyword: string, page: number } = await context.request.json()
    const { keyword, page } = body
    const values = generateQueryString({
        newsearch: 1,
        alflac: 1,
        cluster: 0,
        vermerge: 1,
        show_copyright_off: 1,
        pcmp4: 1,
        ver: 'mbox',
        vipver: 'MUSIC_8.7.5.0_BCS34',
        plat: 'pc',
        devid: '119153077',
        all: decodeURI(keyword),
        ft: 'music',
        itemset: 'web_2013',
        client: 'kt',
        pn: page - 1,
        rn: 20,
        rformat: 'json',
        encoding: 'utf8'
    })


    const rawRes = (await (await fetch(`http://search.kuwo.cn/r.s?${values}`, {
        headers: {

        },
        method: "GET"
    })).text()).replace(/'/g, '"')
    const jsonRes = JSON.parse(rawRes)


    const getImage = (song: any) => {
        let pic = ''
        if (song['web_albumpic_short'] !== '') {
            if (song['web_albumpic_short'].includes('120')) {
                pic = `https://img4.kuwo.cn/star/albumcover/${song['web_albumpic_short'].replace('120', '300')}`;
            } else {
                pic = `https://img4.kuwo.cn/star/albumcover/${song['web_albumpic_short']}`;
            }
        } else {
            if (song['web_artistpic_short'].includes('120')) {
                pic = `https://img1.kuwo.cn/star/starheads/${song['web_artistpic_short'].replace('120', '300')}`;
            } else {
                pic = `https://img1.kuwo.cn/star/starheads/${song['web_artistpic_short']}`;
            }
        }
        return pic
    }



    jsonRes.list = jsonRes.abslist.map((i: any) => {
        return {
            name: i.NAME,
            artist: i.ARTIST,
            album: i.ALBUM,
            songTimeMinutes: handleMusicTime(i.DURATION),
            duration: i.DURATION,
            albumpic: getImage(i),
            rid: i.DC_TARGETID
        }
    })
    return json({
        code: 200,
        message: 'success',
        data: jsonRes.list,
        abslist: jsonRes.abslist,
        paging: {
            page,
            pageSize: 20,
            total: jsonRes.HIT,
            pages: Math.ceil(jsonRes.HIT / 20)
        }
    })
}
