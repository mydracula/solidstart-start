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
                        <div>

                        </div>
                    </div>
                </div>
                <div class="controller"><div class="mode random btn"></div><div class="backward btn"></div><div class="play-pause btn"></div><div class="forward btn"></div><div class="volume on btn"><div class="bar" style="width: 70%;"></div></div></div>

            </div>
        </div>
    )
}
