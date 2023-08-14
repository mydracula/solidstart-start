import { createSignal, createMemo } from 'solid-js';
import { volume, setVolume } from '~/stores/index'



export default function SoundBar() {
    let slider: any;
    const [mute, setMute] = createSignal(false)
    const muteClass = createMemo(() => mute() ? "icon-[carbon--volume-mute]" : "icon-[carbon--volume-up]");
    const [oldVolume, setOldVolume] = createSignal(0)
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
        return `${volume() * 100}%`;
    })
    // =============
    // 通过最小值最大值步长计算精度
    const precision = createMemo(() => {
        let precisions = [0, 100, 1].map(item => {
            let decimal = ('' + item).split('.')[1];
            return decimal ? decimal.length : 0;
        });
        return Math.max.apply(null, precisions);
    })

    const changeMute = (e: any) => {
        if (e.currentTarget.className.indexOf('disabled') != -1) return

        setMute(!mute())
        if (mute()) {
            setOldVolume(volume())
            setVolume(0)
        } else {
            setVolume(oldVolume())
        }
    }


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
        value = parseFloat(value.toFixed(precision())) / 100;
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


    const onButtonDown = (event: any) => {
        event.preventDefault();
        onDragStart(event);
        window.addEventListener('mousemove', onDragging);
        window.addEventListener('touchmove', onDragging);
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('contextmenu', onDragEnd);
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


    return (
        <div class='volume btn' onClick={changeMute} >
            <div class={`${muteClass()} btn5`}></div>
            <div class='track disabled' ref={slider} onClick={onSliderClick}>
                <div class="bar disabled" style={{ width: currentPosition() }}></div>
                <div class="el-slider__button-wrapper disabled" style={{ left: currentPosition() }} classList={{ 'hover': hovering(), 'dragging': dragging() }}>
                    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={onButtonDown} onTouchStart={onButtonDown} class="el-tooltip el-slider__button disabled" onFocus={handleMouseEnter} onBlur={handleMouseLeave}
                        classList={{ 'hover': hovering(), 'dragging': dragging() }}></div>
                </div>
            </div>
        </div>
    )
}