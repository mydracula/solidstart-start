// @ts-nocheck
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import './tool.scss'
import { setStore, store, source, setSource, setPlaying, playing, volume, setVolume } from '~/stores/index'
import { produce } from 'solid-js/store';
import { handleMusicTime, fetchKw, fetchLrc, debounce, scrollIntoView } from '~/utils/index'
import ClickOutside from './ClickOutside';
import { createAudio } from '@solid-primitives/audio';
import SoundBar from './SoundBar'



export default function Tool() {
    const [barStatus, setBarStatus] = createSignal(true)
    const [audio, controls] = createAudio(source, playing, volume)

    const musicDetail = createMemo(() => store.musicDetail)
    const lrcData = createMemo(() => musicDetail().lrc);
    const lyrIndex = createMemo(() => musicDetail().lyrIndex)
    const [playerShow, setPlayerShow] = createSignal(true)
    // const toolShow = createMemo((prev) => {
    //     if (store.musicList.length) return true
    //     if (prev === true) return true
    //     return false
    // }, false)
    const [playType, setPlayType] = createSignal('order')
    const playTypeClass = createMemo(() => {
        switch (playType()) {
            case 'order':
                return 'icon-[carbon--partition-auto]';
            case 'single':
                return 'icon-[carbon--repeat-one]';
            case 'random':
                return 'icon-[carbon--partition-repartition]';
            default:
                break;
        }
    })

    const lyrIndexY = createMemo(() => {
        if (store.loading) return 0
        return -1 * lyrIndex() ? -1 * lyrIndex() + 1 : -1 * lyrIndex()
    });
    const [lastSecond, setLastSecond] = createSignal(0)
    const [barWidth, setBarWidth] = createSignal(0)
    // 防止重复点击bar
    const [firstTime, setFirstTime] = createSignal(0)

    audio.player.ontimeupdate = function () {
        if (store.loading) return
        let curTime = this.currentTime;
        const findIndex = () => {
            const index =
                lrcData()?.findIndex((item: { time: number; }) => {
                    return item.time > curTime
                }) - 1
            return index < 0 ? 0 : index
        }
        setStore('musicDetail', produce((current: any) => {
            current.lyrIndex = findIndex()
        }))
        curTime = Math.floor(curTime);




        if (barStatus()) {
            const barTime = curTime / audio.duration || 0
            setBarWidth(Math.floor(barTime * 100))
        }
        if (curTime !== lastSecond()) {
            setLastSecond(curTime)
            setStore('currentTime', curTime)
        }
    }


    const togglePlay = () => setPlaying(!playing())

    const changeMusic = async (type: string, del?: boolean) => {
        if (!store.musicList.length || store.loading) return
        let musicList = store.musicList
        let currentMusicIndex = musicList.findIndex(((i: any) => i.rid == store.musicId))
        setStore('currentTime', 0)


        if (type === 'pre') {
            let preIndex;
            if (playType() == "order") {
                preIndex = currentMusicIndex - 1 < 0 ? musicList.length - 1 : currentMusicIndex - 1;
            } else if (playType() == "single") {
                preIndex = currentMusicIndex;
            } else if (playType() == "random") {
                if (musicList.length == 1) {
                    preIndex = currentMusicIndex;
                } else {
                    preIndex = currentMusicIndex;
                    while (preIndex == currentMusicIndex) {
                        preIndex = Math.floor(Math.random() * musicList.length);
                    }
                }
            }
            setStore('currentIndex', preIndex)
            const musicDetail = musicList[preIndex]
            setBarWidth(0)
            setStore("musicId", musicDetail.rid)
            setStore("loading", true)


            const kw = await fetchKw(musicDetail.rid)
            setSource(kw)
            scrollIntoView(document.querySelector(`.playlist ol li[data-rid='${musicDetail.rid}']`) as HTMLElement)
            setStore(produce((current: any) => {
                const curDetail = Object.assign({}, musicDetail)
                curDetail.lyrIndex = 0
                current.musicDetail = curDetail
            }))
            setStore("loading", false)
        } else if (type == "next") {
            let nextIndex;
            if (playType() == "order") {
                nextIndex = currentMusicIndex + 1 == musicList.length ? 0 : currentMusicIndex + 1;
            } else if (playType() == "single") {
                nextIndex = currentMusicIndex;
            } else if (playType() == "random") {
                if (musicList.length == 1) {
                    nextIndex = currentMusicIndex;
                } else {
                    nextIndex = currentMusicIndex;
                    while (nextIndex == currentMusicIndex) {
                        nextIndex = Math.floor(Math.random() * musicList.length);
                    }
                }
            }
            setStore('currentIndex', nextIndex)
            const musicDetail = musicList[nextIndex]
            setBarWidth(0)
            setStore("musicId", musicDetail.rid)
            setStore("loading", true)

            if (del) {
                setStore(produce((curent: any) => {
                    curent.musicList.splice(currentMusicIndex, 1);
                }))
            }
            const kw = await fetchKw(musicDetail.rid)
            setSource(kw)
            setStore(produce(async (current: any) => {
                const curDetail = Object.assign({}, musicDetail)
                if (!('lrc' in curDetail)) {
                    const lrc = await fetchLrc(musicDetail.rid)
                    curDetail.lrc = lrc
                    console.log(2222);

                }
                curDetail.lyrIndex = 0
                current.musicDetail = curDetail
                console.log(3);
            }))
            scrollIntoView(document.querySelector(`.playlist ol li[data-rid='${musicDetail.rid}']`) as HTMLElement)
            setStore("loading", false)
        }

    }

    audio.player.onended = () => changeMusic('next')


    const changePlayType = () => {
        const curType = playType() === 'order' ? 'single' : playType() == 'single' ? 'random' : 'order'
        setPlayType(curType)
    }

    const showPlayer = (e) => document.querySelector('.player-info')?.classList.add('show')



    const curPlayClick = async (e: any) => {
        if (e.target.className.indexOf('deleteMusic') != -1) return
        e.preventDefault()
        const rid = e.currentTarget.dataset.rid


        if (store.musicId != rid) {
            setStore("loading", true)
            setBarWidth(0)
            setStore('musicId', rid)
            const kw = await fetchKw(rid)
            setSource(kw)
            setPlaying(true)
            const musicDetail = store.musicList.find(i => i.rid == rid)
            setStore(produce(async (current: any) => {
                const curDetail = Object.assign({}, musicDetail)
                if (!('lrc' in curDetail)) {
                    const lrc = await fetchLrc(musicDetail.rid)
                    curDetail.lrc = lrc
                }
                curDetail.lyrIndex = 0
                current.musicDetail = curDetail
            }))
            scrollIntoView(e.target as HTMLElement)
            setStore("loading", false)
            return
        }
        setBarStatus(false)
        let dragging = true;
        const li = e.currentTarget
        const startX = e.clientX
        const liOffsetLeft = li.getBoundingClientRect().left;
        const curWidth = Math.round((startX - liOffsetLeft) / li.clientWidth * 100)
        const onDragging = (e: any) => {
            dragging = true
            const diff = Math.round((e.clientX - startX) / li.clientWidth * 100)
            const newWidth = Math.max(0, Math.min(diff + curWidth, 100))
            setStore('currentTime', (newWidth * musicDetail().duration) / 100)
            setBarWidth(newWidth)
        }
        // bar
        const onDragEnd = (e: any) => {
            if (dragging) {

                setTimeout(() => {
                    setBarStatus(true)
                    dragging = false
                    const diff = Math.round((e.clientX - startX) / li.clientWidth * 100)
                    const newWidth = diff + curWidth
                    const lastTime = (newWidth * musicDetail().duration) / 100
                    if (lastTime === firstTime()) return
                    setStore('currentTime', lastTime)
                    controls.seek(lastTime);
                    setBarWidth(newWidth)
                    setFirstTime(lastTime)
                }, 0);
                window.removeEventListener('mousemove', onDragging);
                window.removeEventListener('touchmove', onDragging);
                window.removeEventListener('mouseup', onDragEnd);
                window.removeEventListener('touchend', onDragEnd);
                window.removeEventListener('contextmenu', onDragEnd);
            }

        }

        window.addEventListener('mousemove', onDragging);
        window.addEventListener('touchmove', onDragging);
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('contextmenu', onDragEnd);
    }

    const clear = () => {
        setPlaying(false)
        setStore(produce((current: any) => {
            current.loading = true
            current.musicList = []
            current.musicId = 0
            current.currentIndex = -1
            current.currentTime = null
            current.musicDetail = {
                songTimeMinutes: '00:00',
                duration: 0,
                name: null,
                artist: null,
                albumpic: null,
                lrc: [],
                kw: null,
                lyrIndex: 0
            }
        }))
    }



    const deleteMusic = async (e: Event) => {
        const { rid, index } = (e.target as HTMLInputElement).dataset
        const { musicId, musicList, loading } = store

        if (rid == musicId) {
            if (musicList.length != 1) {
                await changeMusic('next', true);
            } else {
                clear()
                return
            }
        } else {
            setStore(produce((curent: any) => {
                curent.musicList.splice(index, 1);
            }))
        }
    }

    const closeModel = (e, el) => {


        // 没有打开 点其他关闭

        if (document.querySelector('.player-info')?.classList.contains('show')) {
            document.querySelector('.player-info')?.classList.add('hide')
            setTimeout(() => {
                document.querySelector('.player-info')?.classList.remove('hide')
                document.querySelector('.player-info')?.classList.remove('show')
            }, 300);
        }


    }


    createEffect(() => {
        console.log(audio.state);

    })

    return (
        <div id="tool" classList={{ 'playing': playing(), 'cursor-pointer': true }}>
            <div class="item player" onClick={showPlayer} style="width: 30px;height: 30px;display: flex;align-items: center;justify-content: center;">
                <div class="icon-[carbon--music]" show="model"></div>
            </div>
            <div class={`player-info`}  use: ClickOutside={closeModel}>
                <div class="preview max-[765px]:flex-col  max-[765px]:!px-[10px]">
                    <div class="cover">
                        <div class="disc" style={{ 'animation-play-state': playing() ? 'running' : 'paused' }}>
                            <img src={musicDetail().albumpic} />
                        </div>
                    </div>
                    <div class='info'>
                        <h4 innerHTML={musicDetail().name}></h4>
                        <span innerHTML={musicDetail().artist}></span>

                        <Show
                            when={!store.loading}
                            fallback={<span class='loading'>加载中...</span>}
                        >
                            <div class="lrc">
                                <div class="inner" style={`transform: translateY(${lyrIndexY()}rem);`}>
                                    <For each={lrcData()}>
                                        {(lrc, i) => (
                                            <p classList={{ current: i() === musicDetail().lyrIndex }}>{lrc.lineLyric}</p>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </Show>


                    </div>
                </div>
                <div class="controller  max-[765px]:px-0" >
                    <div class={`btn1 btn ${playTypeClass()}`} onClick={changePlayType}></div>
                    <div class="icon-[carbon--skip-back-outline] btn2 btn" onClick={() => changeMusic('pre')}></div>
                    <div class={`${playing() ? 'icon-[carbon--pause-outline]' : 'icon-[carbon--play-outline]'} btn3 btn`} onClick={togglePlay}></div>
                    <div class="icon-[carbon--skip-forward-outline] btn4 btn" onClick={() => changeMusic('next')}></div>
                    <SoundBar></SoundBar>
                </div>
                <div class='playlist'>
                    <div class='border-b-[1px] border-[rgba(253,253,253,0.7)] h-[35px]'>
                        <ul class='h-[100%] w-fit'>
                            <li onClick={clear} class='text-[#333] text-[12px] py-[5px] px-[20px] flex items-center h-[inherit] hover:text-[#f9d2e1] hover:font-bold  cursor-pointer '>
                                <span class='icon-[carbon--trash-can] mr-[1px]'></span>
                                <span>清空列表</span>
                            </li>
                        </ul>
                    </div>

                    <ol>

                        <For each={store.musicList} fallback={<div>Loading...</div>}>
                            {(item, index) => (
                                <li title={`${item.name} - ${item.artist}`} data-rid={item.rid} draggable="true" class={`${store.musicId === item.rid ? 'curPlay' : ''} group`} onMouseDown={curPlayClick}>
                                    <Show
                                        when={store.musicId === item.rid}
                                        fallback={<div class='index'>{index() + 1}</div>}
                                    >
                                        <div class='playicon'>
                                            <span class={store.musicId === item.rid ? 'icon-[carbon--play-filled]' : ''}></span>
                                        </div>
                                    </Show>

                                    <div class='deleteMusic hidden group-hover:flex cursor-pointer absolute top-0 text-[16px] h-[100%] left-[18px] items-center text-[#f9d2e1] bg-[#FDFDFD] z-[2]' data-rid={item.rid} data-index={index()} onClick={deleteMusic}>
                                        <div class='deleteMusic icon-[carbon--trash-can]' data-rid={item.rid} data-index={index()}></div>
                                    </div>



                                    <span class="info">
                                        <span class='overflow-hidden text-ellipsis whitespace-nowrap max-w-[12rem] inline-block' innerHTML={item.name}></span>
                                        <span style={{ 'display': store.musicId === item.rid ? 'none' : 'block' }} innerHTML={item.artist}></span>
                                    </span>
                                    <Show
                                        when={store.musicId === item.rid}
                                    >
                                        <div class="progress" data-dtime={handleMusicTime(audio.state === 'playing' ? audio.duration : 0)} data-ptime={handleMusicTime(store.currentTime)}>
                                            <div class="bar" style={{ 'width': `${barWidth()}%` }}></div>
                                        </div>
                                    </Show>

                                </li>
                            )}
                        </For>
                    </ol>
                </div>
            </div>
        </div >
    )
}
