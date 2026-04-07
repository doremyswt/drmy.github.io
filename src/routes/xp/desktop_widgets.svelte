<script>
    import { onMount } from 'svelte';


    let stickyText = `drawing,\n\ndon't forget to eat and drink water`;

    let sticky = { top: 18, right: 220, left: null };
    let clockWidget = { top: 18, right: 60, left: null };
    let commissionsWidget = { top: 18, right: 420, left: null };
    let hourAngle = 0;
    let minuteAngle = 0;
    let secondAngle = 0;
    let dragState = null;
    let dragMoved = false;

    function handleCommissionsClick() {
        if (!dragMoved) {
            window.open('https://vgen.co/doremy', '_blank', 'noopener');
        }
    }

    onMount(() => {
        updateClock();
        const interval = window.setInterval(updateClock, 1000);
        return () => {
            window.clearInterval(interval);
            stopDrag();
        };
    });

    function saveStickyText() {
        // no-op: positions and text are not persisted
    }

    function updateClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        hourAngle = hours * 30 + minutes * 0.5;
        minuteAngle = minutes * 6 + seconds * 0.1;
        secondAngle = seconds * 6;
    }

    function widgetStyle(pos) {
        return pos.left != null
            ? `top:${pos.top}px;left:${pos.left}px;right:auto;`
            : `top:${pos.top}px;right:${pos.right}px;left:auto;`;
    }

    function startDrag(type, event, node) {
        dragMoved = false;
        const rect = node.getBoundingClientRect();
        dragState = {
            type,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            width: rect.width
        };
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
    }

    function onDrag(event) {
        if (!dragState) return;
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
        const maxX = window.innerWidth - dragState.width;
        const maxY = window.innerHeight - 30 - 32; // 30px taskbar + 32px minimum visible
        const next = {
            left: Math.max(0, Math.min(maxX, dragState.startLeft + dx)),
            top: Math.max(0, Math.min(maxY, dragState.startTop + dy)),
            right: null
        };
        if (dragState.type === 'sticky') {
            sticky = next;
        } else if (dragState.type === 'commissions') {
            commissionsWidget = next;
        } else {
            clockWidget = next;
        }
    }

    function stopDrag() {
        dragState = null;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
    }
</script>

<div
    class="widget-sticky"
    style={widgetStyle(sticky)}
>
    <div
        class="widget-sticky-header"
        on:mousedown={(event) => startDrag('sticky', event, event.currentTarget.parentElement)}
    >
        <span>sticky note</span>
    </div>
    <textarea
        class="widget-sticky-content"
        bind:value={stickyText}
        on:input={saveStickyText}
        spellcheck="false"
    />
</div>

<div
    class="widget-clock"
    style={widgetStyle(clockWidget)}
    on:mousedown={(event) => startDrag('clock', event, event.currentTarget)}
>
    <div class="widget-clock-bezel">
        <div class="widget-clock-frame">
            <div class="widget-clock-face">
                {#each Array(12) as _, i}
                    <div class="widget-clock-mark {i % 3 === 0 ? 'mark-major' : 'mark-minor'}"
                         style="transform: rotate({i * 30}deg);">
                    </div>
                {/each}
                <div class="widget-clock-hand hour-hand"   style={`transform: translateX(-50%) rotate(${hourAngle}deg);`}></div>
                <div class="widget-clock-hand minute-hand" style={`transform: translateX(-50%) rotate(${minuteAngle}deg);`}></div>
                <div class="widget-clock-hand second-hand" style={`transform: translateX(-50%) rotate(${secondAngle}deg);`}></div>
                <div class="widget-clock-center"></div>
            </div>
        </div>
    </div>
</div>

<div
    class="widget-commissions"
    style={widgetStyle(commissionsWidget)}
    on:mousedown={(event) => startDrag('commissions', event, event.currentTarget)}
    on:click={handleCommissionsClick}
>
    <div class="widget-commissions-btn">COMMISSIONS</div>
</div>

<style>
    .widget-sticky{
        position:absolute;
        z-index:1;
        width:170px;
        min-height:140px;
        background:linear-gradient(160deg,#fff9b1 0%,#ffec6e 100%);
        box-shadow:3px 3px 10px rgba(0,0,0,.28), inset 0 -2px 0 rgba(0,0,0,.06);
        border-radius:1px 1px 2px 2px;
        user-select:none;
    }
    .widget-sticky-header{
        background:linear-gradient(180deg,#f5d800 0%,#e6c900 100%);
        padding:4px 8px;
        font:700 11px Tahoma,sans-serif;
        color:#5a4800;
        border-bottom:1px solid #c8aa00;
        cursor:grab;
    }
    .widget-sticky-content{
        width:100%;
        min-height:110px;
        resize:none;
        border:none;
        outline:none;
        background:transparent;
        padding:8px;
        box-sizing:border-box;
        font:12px/1.5 Tahoma,sans-serif;
        color:#3a3000;
    }
    .widget-clock{
        position:absolute;
        z-index:1;
        width:120px;
        height:120px;
        user-select:none;
        cursor:grab;
    }
    /* Outer metallic ring — XP silver bevel */
    .widget-clock-bezel{
        width:100%;
        height:100%;
        border-radius:999px;
        background:conic-gradient(
            #e8e8e8 0deg, #ffffff 45deg, #c0c0c0 90deg,
            #888 135deg, #c0c0c0 180deg, #ffffff 225deg,
            #e8e8e8 270deg, #c8c8c8 315deg, #e8e8e8 360deg
        );
        box-shadow:
            0 4px 12px rgba(0,0,0,.55),
            inset 0 1px 0 rgba(255,255,255,.9),
            inset 0 -1px 2px rgba(0,0,0,.3);
        padding:6px;
        box-sizing:border-box;
    }
    /* Inner darker ring */
    .widget-clock-frame{
        width:100%;
        height:100%;
        border-radius:999px;
        background:linear-gradient(145deg,#4a6fa5 0%,#1e3f6f 40%,#0d2a55 100%);
        box-shadow:inset 0 2px 4px rgba(0,0,0,.6), inset 0 -1px 2px rgba(255,255,255,.1);
        padding:5px;
        box-sizing:border-box;
    }
    /* White clock face with subtle radial gradient */
    .widget-clock-face{
        position:relative;
        width:100%;
        height:100%;
        border-radius:999px;
        background:radial-gradient(circle at 38% 32%, #ffffff 0%, #f0f4ff 55%, #dce6f5 100%);
        box-shadow:inset 0 1px 3px rgba(0,0,0,.15);
        overflow:hidden;
    }
    .widget-clock-mark{
        position:absolute;
        left:50%;
        top:4px;
        transform-origin:center 46px;
        margin-left:-1px;
        border-radius:1px;
    }
    .mark-major{
        width:3px;
        height:8px;
        background:#1a2a4a;
        margin-left:-1.5px;
    }
    .mark-minor{
        width:1.5px;
        height:5px;
        background:#6080a0;
        margin-left:-0.75px;
        top:5px;
    }
    .widget-clock-hand{
        position:absolute;
        left:50%;
        bottom:50%;
        transform-origin:center bottom;
        border-radius:3px 3px 0 0;
        pointer-events:none;
    }
    .hour-hand{
        width:5px;
        height:28px;
        background:linear-gradient(90deg,#1a2a4a,#2d4070,#1a2a4a);
        margin-left:-2.5px;
        border-radius:3px;
    }
    .minute-hand{
        width:3px;
        height:38px;
        background:linear-gradient(90deg,#1a2a4a,#2d4070,#1a2a4a);
        margin-left:-1.5px;
        border-radius:2px;
    }
    .second-hand{
        width:1.5px;
        height:42px;
        background:#cc2200;
        margin-left:-0.75px;
        border-radius:1px;
    }
    .widget-clock-center{
        position:absolute;
        left:50%;
        top:50%;
        width:7px;
        height:7px;
        margin-left:-3.5px;
        margin-top:-3.5px;
        border-radius:999px;
        background:radial-gradient(circle at 35% 35%, #ffffff 0%, #aabbdd 50%, #334466 100%);
        box-shadow:0 0 2px rgba(0,0,0,.4);
        z-index:1;
    }
    .widget-commissions{
        position:absolute;
        z-index:1;
        user-select:none;
        cursor:grab;
    }
    .widget-commissions-btn{
        display:block;
        padding:20px 45px;
        background:linear-gradient(180deg,#4ec95e 0%,#28a83c 50%,#1e8a2e 100%);
        border:4px solid;
        border-color:#8ae696 #1a6b27 #1a6b27 #8ae696;
        box-shadow:4px 4px 0 rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.4);
        color:#ffffff;
        font:bold 29px Tahoma,sans-serif;
        text-align:center;
        text-shadow:0 1px 3px rgba(0,0,0,.6);
        letter-spacing:2px;
        cursor:pointer;
        white-space:nowrap;
        animation:comm-blink 0.6s step-start infinite;
    }
    .widget-commissions:active .widget-commissions-btn{
        border-color:#1a6b27 #8ae696 #8ae696 #1a6b27;
        box-shadow:inset 2px 2px 3px rgba(0,0,0,.3);
        animation:none;
        background:linear-gradient(180deg,#1e8a2e 0%,#28a83c 100%);
    }
    @keyframes comm-blink {
        0%  { background:linear-gradient(180deg,#4ec95e 0%,#28a83c 50%,#1e8a2e 100%); border-color:#8ae696 #1a6b27 #1a6b27 #8ae696; }
        50% { background:linear-gradient(180deg,#9effa8 0%,#5de86e 50%,#3ecf52 100%); border-color:#d4ffda #2a9e3a #2a9e3a #d4ffda; }
    }
</style>
