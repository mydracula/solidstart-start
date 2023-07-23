import { createEffect, createMemo } from 'solid-js'
import { plays } from '~/stores/index'
import './tool.css'

export default function Tool() {
    let ref: HTMLAudioElement | ((el: HTMLAudioElement) => void) | undefined;
    const src = createMemo(() => (plays[plays.length - 1] as any)?.kw)
    createEffect(() => {
        if (plays.length > 0) {
            ref.play()

        }

    })

    return (
        <div id="tool">
            <div class="item player">
                <div class="icon-[carbon--music]"></div>
                <audio src={src()} ref={ref}></audio>
            </div>

            <div class="player-info show">
                <div class="preview">
                    <div class="cover">
                        <div class="disc">
                            <img src="https://api.i-meto.com/meting/api?server=netease&amp;type=pic&amp;id=18801648835570109&amp;auth=d7d5d96a460f41ef5eed8ee496f5b2c1d240cec8" />
                        </div>
                    </div>
                    <div class='info'>
                        <h4>歌的标题</h4>
                        <span>谁写的</span>
                        <div class="lrc">

                        </div>
                    </div>
                </div>
                <div class="controller">

                    <div class="icon-[carbon--rotate-360]  btn1 btn"></div>
                    <div class="icon-[carbon--skip-back-outline] btn2 btn"></div>
                    <div class='icon-[carbon--play-outline] btn3 btn'></div>
                    <div class="icon-[carbon--skip-forward-outline] btn4 btn"></div>
                    {/* carbon:volume-up carbon:volume-mute */}
                    <div class="icon-[carbon--volume-up] btn5 btn">
                        <div class="bar" style="width: 70%;">

                        </div>
                    </div>
                </div>
                <div class='playlist' style="height:247px">

                </div>
            </div>
        </div>
    )
}
