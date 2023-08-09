import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import './tool.scss'
import { setStore, store } from '~/stores/index'
import { produce } from 'solid-js/store';
import { handleMusicTime, fetchKw, fetchLrc } from '~/utils/index'



export default function Tool() {
    let slider: any;
    let audioPlayer: any;
    const musicDetail = createMemo(() => store.musicDetail)
    const lrcData = createMemo(() => musicDetail().lrc);
    const audioPlayerSrc = createMemo(() => store.musicDetail.kw)
    const lyrIndex = createMemo(() => musicDetail().lyrIndex)
    const [showClass, setShowClass] = createSignal(true)
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
    const [volume, setVolume] = createSignal(35)
    const [oldVolume, setOldVolume] = createSignal(0)
    const [mute, setMute] = createSignal(false)
    const muteClass = createMemo(() => mute() ? "icon-[carbon--volume-mute]" : "icon-[carbon--volume-up]");
    const lyrIndexY = createMemo(() => {
        if (store.loading) return 0
        return -1 * lyrIndex() ? -1 * lyrIndex() + 1 : -1 * lyrIndex()
    });
    const [lastSecond, setLastSecond] = createSignal(0)
    const [secondX, setSecondX] = createSignal(0)
    const [barSatus, setBarStatus] = createSignal(true)
    // 防止重复点击bar
    const [firstTime, setFirstTime] = createSignal(0)


    // =============
    // 正在拖拉
    const [dragging, setDdragging] = createSignal(false)
    // 是否点击按钮
    const [isClick, setIsClick] = createSignal(false)
    // 是否悬浮
    const [hovering, setHovering] = createSignal(false)
    // 开始的clientX
    const [startX, setStartX] = createSignal(0)
    // 开始的位置
    const [startPosition, setStartPosition] = createSignal(0)
    // 最新的位置=> startPosition + ((currentX-startX)/sliderSize)*100
    const [newPosition, setNewPosition] = createSignal(0)
    // 当前的clientX 
    const [currentX, setCurrentX] = createSignal(0)
    // 宽度
    const [sliderSize, setSliderSize] = createSignal(0)
    // size
    const resetSize = () => setSliderSize(slider.clientWidth)
    // 转为宽度字符串
    const currentPosition = createMemo(() => {
        return `${volume()}%`;
    })
    // =============
    createEffect(async () => {

    })
    // 通过最小值最大值步长计算精度
    const precision = createMemo(() => {
        let precisions = [0, 100, 1].map(item => {
            let decimal = ('' + item).split('.')[1];
            return decimal ? decimal.length : 0;
        });
        return Math.max.apply(null, precisions);
    })

    const setPosition = (percent: number | null) => {
        if (percent === null || isNaN(percent)) return;
        if (percent < 0) {
            percent = 0;
        } else if (percent > 100) {
            percent = 100;
        }
        const lengthPerStep = 1;
        const steps = Math.round(percent / lengthPerStep);
        let value = steps * lengthPerStep * 100 * 0.01;
        value = parseFloat(value.toFixed(precision()));
        audioPlayer.volume = value / 100
        setVolume(value)
    }

    const onSliderClick = (event: any) => {
        if (dragging()) return
        resetSize()
        const sliderOffsetLeft = slider.getBoundingClientRect().left;
        setPosition((event.clientX - sliderOffsetLeft) / sliderSize() * 100);
        volume() === 0 ? setMute(true) : setMute(false)
    }

    const handleMouseEnter = () => {
        setHovering(true)
    }
    const handleMouseLeave = () => {
        setHovering(false)
    }

    const onDragStart = (event: any) => {
        setDdragging(true)
        setIsClick(true)
        if (event.type === 'touchstart') {
            event.clientY = event.touches[0].clientY;
            event.clientX = event.touches[0].clientX;
        }
        setStartX(event.clientX)
        setStartPosition(parseFloat(currentPosition()))
        setNewPosition(startPosition())
    }

    const onDragging = (event: any) => {
        if (dragging()) {
            setIsClick(false)
            resetSize()
            let diff = 0;
            if (event.type === 'touchmove') {
                event.clientY = event.touches[0].clientY;
                event.clientX = event.touches[0].clientX;
            }
            setCurrentX(event.clientX)
            diff = (currentX() - startX()) / sliderSize() * 100;
            setNewPosition(startPosition() + diff)
            setPosition(newPosition())
            volume() === 0 ? setMute(true) : setMute(false)
        }
    }
    const onDragEnd = () => {
        if (dragging()) {
            /*
             * 防止在 mouseup 后立即触发 click，导致滑块有几率产生一小段位移
             * 不使用 preventDefault 是因为 mouseup 和 click 没有注册在同一个 DOM 上
             */
            setTimeout(() => {
                setDdragging(false)

                if (!isClick()) {
                    setPosition(newPosition())
                    volume() === 0 ? setMute(true) : setMute(false)
                }
            }, 0);
            window.removeEventListener('mousemove', onDragging);
            window.removeEventListener('touchmove', onDragging);
            window.removeEventListener('mouseup', onDragEnd);
            window.removeEventListener('touchend', onDragEnd);
            window.removeEventListener('contextmenu', onDragEnd);
        }
    }


    const onButtonDown = (event: any) => {
        event.preventDefault();
        onDragStart(event);
        window.addEventListener('mousemove', onDragging);
        window.addEventListener('touchmove', onDragging);
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('contextmenu', onDragEnd);
    }

    const setExternalPlayback = (e: any) => {
        if (e.target.className.indexOf('hahahah') != -1) return
        setMute(!mute())
        if (mute()) {
            setOldVolume(volume())
            setVolume(0)
        } else {
            setVolume(oldVolume())
        }
        audioPlayer.volume = volume() / 100
    }


    const audioTime = (e: any) => {
        if (store.loading) return
        let curTime = e.target.currentTime;
        const findIndex = () => {
            const index =
                lrcData()?.findIndex((item: { time: number; }) => {
                    return item.time > curTime
                }) - 1
            return index < 0 ? 0 : index
        }

        if (barSatus()) setStore('currentTime', curTime)
        setStore('musicDetail', produce((current: any) => {
            current.lyrIndex = findIndex()
        }))
        curTime = Math.floor(curTime);


        if (curTime !== lastSecond()) {
            setLastSecond(curTime)
            setSecondX(Math.floor((curTime / musicDetail().duration) * 100))
        }
    }

    const onPlay = () => {
        const currentIndex = store.musicList.findIndex((i: any) => i.rid === musicDetail().rid)
        setStore("musicId", musicDetail().rid)
        setStore("currentIndex", currentIndex)
        setStore("isPlay", true)
    }
    const onPause = () => {
        setStore("isPlay", false)
    }
    const togglePlayback = () => store.isPlay ? audioPlayer.pause() : audioPlayer.play()


    const changeMusic = async (type: string, del?: boolean) => {
        if (!store.musicList.length || store.loading) return
        audioPlayer.pause()
        setSecondX(0)

        let musicList = store.musicList
        let currentMusicIndex = musicList.findIndex(((i: any) => i.rid == store.musicId))
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


            setStore("loading", true)
            const { kw } = await (await fetch("/api/searchSong", {
                method: "POST",
                body: JSON.stringify({
                    id: musicDetail.rid,
                }),
            })).json()
            setStore(produce((current: any) => {
                const curDetail = Object.assign({}, musicDetail)
                curDetail.kw = kw
                curDetail.lyrIndex = 0
                current.musicDetail = curDetail
            }))
            setStore("loading", false)
        } else if (type == "next") {
            let nextIndex;
            if (playType() == "order") {
                console.log(musicList[currentMusicIndex]);

                nextIndex = currentMusicIndex + 1 == musicList.length ? 0 : currentMusicIndex + 1;
            } else if (playType() == "single") {
                nextIndex = currentMusicIndex;
            } else if (playType() == "random") {
                if (musicList.length == 1) {
                    nextIndex = currentMusicIndex;
                } else {
                    // Math.floor(Math.random()*n); 可均衡获取0到n-1的随机整数。
                    nextIndex = currentMusicIndex;
                    while (nextIndex == currentMusicIndex) {
                        nextIndex = Math.floor(Math.random() * musicList.length);
                    }
                }
            }
            setStore('currentIndex', nextIndex)
            const musicDetail = musicList[nextIndex]
            setStore("musicId", musicDetail.rid)
            setStore("loading", true)

            if (del) {
                setStore(produce((curent: any) => {
                    curent.musicList.splice(currentMusicIndex, 1);
                }))
            }
            const kw = await fetchKw(musicDetail.rid)
            setStore(produce(async (current: any) => {
                const curDetail = Object.assign({}, musicDetail)
                if (!('lrc' in curDetail)) {
                    const lrc = await fetchLrc(musicDetail.rid)
                    curDetail.lrc = lrc
                }
                curDetail.kw = kw
                curDetail.lyrIndex = 0
                current.musicDetail = curDetail
            }))
            setStore("loading", false)
        }

    }

    const changePlayType = () => {
        const curType = playType() === 'order' ? 'single' : playType() == 'single' ? 'random' : 'order'
        setPlayType(curType)
    }

    const showPlayer = () => {
        if (!store.musicList.length) {
            setShowClass(true)
            return
        }
        if (showClass()) {
            document.querySelector('.player-info')?.classList.add('hide')
            setTimeout(() => setShowClass(!showClass()), 300);
            return
        }
        setShowClass(!showClass())
    }


    const curPlayClick = async (e: any) => {
        if (e.target.className.indexOf('deleteMusic') != -1) return
        e.preventDefault()
        const index = e.currentTarget.dataset.index
        if (store.currentIndex != index) {
            setStore("loading", true)
            audioPlayer.pause()
            setSecondX(0)
            setStore('currentIndex', index)
            const musicDetail = store.musicList[index]
            setStore('musicId', musicDetail.rid)

            const kw = await fetchKw(musicDetail.rid)
            setStore(produce(async (current: any) => {
                const curDetail = Object.assign({}, musicDetail)
                if (!('lrc' in curDetail)) {
                    const lrc = await fetchLrc(musicDetail.rid)
                    curDetail.lrc = lrc
                }
                curDetail.kw = kw
                curDetail.lyrIndex = 0
                current.musicDetail = curDetail
            }))
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
        }
        // bar
        const onDragEnd = (e: any) => {
            if (dragging) {

                setTimeout(() => {
                    dragging = false
                    const diff = Math.round((e.clientX - startX) / li.clientWidth * 100)
                    const newWidth = diff + curWidth
                    const lastTime = (newWidth * musicDetail().duration) / 100
                    if (lastTime === firstTime()) return
                    audioPlayer.currentTime = (newWidth * musicDetail().duration) / 100
                    setBarStatus(true)
                    setSecondX(newWidth)
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
        audioPlayer.pause()
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
                audioPlayer.pause()
                clear()
                return
            }
        } else {
            setStore(produce((curent: any) => {
                curent.musicList.splice(index, 1);
            }))
        }
    }

    onMount(() => audioPlayer.volume = volume() / 100)
    return (
        <div id="tool" classList={{ 'playing': store.isPlay }}>
            <div class="item player" onClick={showPlayer}>
                <div class="icon-[carbon--music]"></div>
                <audio ref={audioPlayer} onEnded={() => changeMusic('next')} src={audioPlayerSrc()} onTimeUpdate={audioTime} autoplay onPlay={onPlay} onPause={onPause}></audio>
            </div>

            <div class={`player-info ${(showClass() && store.musicList.length) ? 'show' : ''}`}>
                <div class="preview">
                    <div class="cover">
                        <div class="disc" style={{ 'animation-play-state': store.isPlay ? 'running' : 'paused' }}>
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
                <div class="controller">

                    <div class={`btn1 btn ${playTypeClass()}`} onClick={changePlayType}></div>
                    <div class="icon-[carbon--skip-back-outline] btn2 btn" onClick={() => changeMusic('pre')}></div>
                    <div class={`${store.isPlay ? 'icon-[carbon--pause-outline]' : 'icon-[carbon--play-outline]'} btn3 btn`} onClick={togglePlayback}></div>
                    <div class="icon-[carbon--skip-forward-outline] btn4 btn" onClick={() => changeMusic('next')}></div>
                    <div class='volume btn' onClick={setExternalPlayback}>
                        <div class={`${muteClass()} btn5`}></div>
                        <div class='track hahahah' ref={slider} onClick={onSliderClick}>
                            <div class="bar hahahah" style={{ width: currentPosition() }}></div>
                            <div class="el-slider__button-wrapper hahahah" style={{ left: currentPosition() }} classList={{ 'hover': hovering(), 'dragging': dragging() }}>
                                <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={onButtonDown} onTouchStart={onButtonDown} class="el-tooltip el-slider__button hahahah" onFocus={handleMouseEnter} onBlur={handleMouseLeave}
                                    classList={{ 'hover': hovering(), 'dragging': dragging() }}></div>
                            </div>
                        </div>
                    </div>
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
                                <li title={`${item.name} - ${item.artist}`} data-index={index()} draggable="true" class={`${store.musicId === item.rid ? 'curPlay' : ''} group`} onMouseDown={curPlayClick}>
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
                                        {secondX()}
                                        <span class='overflow-hidden text-ellipsis whitespace-nowrap max-w-[12rem] inline-block' innerHTML={item.name}></span>
                                        <span style={{ 'display': store.musicId === item.rid ? 'none' : 'block' }} innerHTML={item.artist}></span>
                                    </span>
                                    <Show
                                        when={store.musicId === item.rid}
                                    >
                                        <div class="progress" data-dtime={musicDetail().songTimeMinutes} data-ptime={handleMusicTime(store.currentTime)}>
                                            <div class="bar" style={{ 'width': `${secondX()}%` }}></div>
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
