<script>
    import TaskBar from "./task_bar.svelte";
    import WorkSpace from "./work_space.svelte";
    import ContextMenu from "../../lib/components/xp/ContextMenu.svelte";
    import { onMount, onDestroy, tick } from "svelte";
    import { queueCommand, crtEffect, wallpaper, hardDrive, queueProgram } from "../../lib/store";
    import { get } from "svelte/store";
    import { set } from "idb-keyval";

    // ── Crash state ──
    let crashed = false;
    let crash_pct = 0;
    let crash_interval = null;
    let crash_countdown = null;

    let flash_opacity = 0;
    let flash_visible = false;

    let crack_visible = false;
    let fire_visible = false;
    let crack_canvas;

    let blackout_visible = false;
    let rekt_text = '';
    let went_black = false;

    function go_black() {
        if (went_black) return;
        went_black = true;
        crack_visible = false;
        fire_visible = false;
        flash_visible = false;
        flash_opacity = 0;
        crashed = false;
        blackout_visible = true;
        start_rekt_typing();
    }

    const ROAST_STOP = [
        'ISSUE_ENCOUNTERED_IN_USER_BRAIN',
        'TOO_MANY_VIRUSES_CLICKED',
        'FREE_IPAD_OFFER_ACCEPTED',
        'UNLICENSED_ANIME_WALLPAPER_DETECTED',
        'USER_COMMON_SENSE_NOT_FOUND',
    ];
    const roast_code = ROAST_STOP[Math.floor(Math.random() * ROAST_STOP.length)];

    // ── Glitch overlay ──
    let glitch_canvas;
    let glitch_active = false;
    let glitch_level = 0;
    let _glitch_raf = null;

    function start_glitch(level) {
        glitch_level = level;
        glitch_active = true;
        if (_glitch_raf) return;
        tick().then(() => {
            if (!glitch_canvas) return;
            let frame = 0;
            const ctx = glitch_canvas.getContext('2d');
            function resize() {
                glitch_canvas.width = window.innerWidth;
                glitch_canvas.height = window.innerHeight;
            }
            resize();
            window.addEventListener('resize', resize, { passive: true });
            function loop() {
                _glitch_raf = requestAnimationFrame(loop);
                const W = glitch_canvas.width, H = glitch_canvas.height;
                ctx.clearRect(0, 0, W, H);
                frame++;
                const intensity = glitch_level / 3;
                const skip = Math.max(1, Math.round(6 - glitch_level * 1.5));
                if (frame % skip !== 0) return;
                const numBands = Math.floor(4 + intensity * 14);
                for (let i = 0; i < numBands; i++) {
                    const y = Math.random() * H;
                    const h = 2 + Math.random() * Math.max(4, intensity * 22);
                    const shift = (-1 + Math.random() * 2) * intensity * 38;
                    ctx.fillStyle = `rgba(255,0,0,${0.06 + intensity * 0.18})`;
                    ctx.fillRect(shift, y, W, h);
                    ctx.fillStyle = `rgba(0,255,255,${0.06 + intensity * 0.18})`;
                    ctx.fillRect(-shift, y + 1, W, h);
                }
                const numBlocks = Math.floor(intensity * 28);
                for (let i = 0; i < numBlocks; i++) {
                    const x = Math.random() * W;
                    const y = Math.random() * H;
                    const bw = 4 + Math.random() * Math.max(8, intensity * 60);
                    const bh = 2 + Math.random() * Math.max(4, intensity * 14);
                    ctx.fillStyle = `rgba(${(Math.random()*255)|0},${(Math.random()*255)|0},${(Math.random()*255)|0},${0.18+intensity*0.44})`;
                    ctx.fillRect(x, y, bw, bh);
                }
                if (intensity >= 0.9 && Math.random() < 0.08) {
                    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
                    ctx.fillRect(0, 0, W, H);
                }
            }
            loop();
        });
    }

    function stop_glitch() {
        if (_glitch_raf) { cancelAnimationFrame(_glitch_raf); _glitch_raf = null; }
        glitch_active = false;
    }

    // ── Popups ──
    let popups = [];
    let popup_z = 1000;

    function spawn_popup(data) {
        const { id, title, message, source, opts = {} } = data;
        const x = 80 + Math.random() * (window.innerWidth - 380);
        const y = 80 + Math.random() * (window.innerHeight - 200);
        popups = [...popups, { id, title, message, source, opts, x, y, z: popup_z++ }];
        const ie = document.querySelector('iframe');
        if (ie) ie.contentWindow.postMessage({ type: 'forum-popup-ack', id }, '*');
    }

    function close_popup(id) {
        popups = popups.filter(p => p.id !== id);
    }

    // Build a selector for an element inside the popup body so the iframe can find
    // the matching element in its detached ghost and dispatch the event.
    function popup_selector_for(el, root) {
        let cur = el;
        while (cur && cur !== root) {
            const attrs = cur.attributes ? Array.from(cur.attributes) : [];
            const data = attrs.find(a => a.name.startsWith('data-'));
            if (data) {
                return data.value ? `[${data.name}="${data.value}"]` : `[${data.name}]`;
            }
            if (cur.className && typeof cur.className === 'string') {
                const cls = cur.className.split(/\s+/).filter(Boolean);
                const pick = cls.find(c => c.startsWith('popup-') || c.startsWith('bonzi-'));
                if (pick) return '.' + pick;
            }
            if (cur.tagName === 'BUTTON' || cur.tagName === 'A' || cur.tagName === 'INPUT') {
                // fallback: index among siblings of same tag
                const parent = cur.parentElement;
                if (parent) {
                    const sibs = Array.from(parent.children).filter(s => s.tagName === cur.tagName);
                    const idx = sibs.indexOf(cur);
                    return cur.tagName.toLowerCase() + ':nth-of-type(' + (idx + 1) + ')';
                }
            }
            cur = cur.parentElement;
        }
        return null;
    }

    function relay_popup_event(e, popup_id) {
        const iframe = document.querySelector('iframe');
        if (!iframe || !iframe.contentWindow) return;
        const root = e.currentTarget;
        const target = e.target;
        const selector = popup_selector_for(target, root);
        if (!selector) return;
        const msg = { type: 'forum-popup-event', id: popup_id, eventType: e.type, selector };
        if (e.type === 'input' || e.type === 'change') msg.value = target.value;
        if (e.type === 'keydown') msg.key = e.key;
        iframe.contentWindow.postMessage(msg, '*');
    }

    let drag_popup = null;
    let drag_ox = 0, drag_oy = 0;

    let popup_dragging = false;

    function popup_mousedown(e, popup) {
        e.preventDefault();
        drag_popup = popup.id;
        drag_ox = e.clientX - popup.x;
        drag_oy = e.clientY - popup.y;
        popup_dragging = true;
        popups = popups.map(p => p.id === popup.id ? { ...p, z: popup_z++ } : p);
    }

    function on_mousemove(e) {
        if (!drag_popup) return;
        popups = popups.map(p => p.id === drag_popup ? { ...p, x: e.clientX - drag_ox, y: e.clientY - drag_oy } : p);
    }

    function on_mouseup() {
        drag_popup = null;
        popup_dragging = false;
    }

    // ── Message handler ──
    function on_message(e) {
        if (!e.data) return;
        const { type } = e.data;
        if (type === 'bonzi-glitch') {
            start_glitch(e.data.level);
        } else if (type === 'forum-popup-spawn') {
            spawn_popup(e.data);
        } else if (type === 'forum-popup-close') {
            close_popup(e.data.id);
        } else if (type === 'bonzi-crash') {
            handle_crash();
        } else if (type === 'request-fullscreen') {
            requestSiteFullscreen();
        }
    }

    function requestSiteFullscreen() {
        const root = document.documentElement;
        if (document.fullscreenElement) return;
        const req = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
        if (typeof req === 'function') try { req.call(root); } catch {}
    }

    function handle_crash() {
        if (crashed) return;
        crashed = true;
        crash_pct = 0;
        crash_countdown = null;
        stop_glitch();

        // play crash sound on the desktop side (forum iframe no longer plays it when in iframe mode)
        const crash_audio = new Audio('/remake/current-site/SFX-XP/computer_crash.mp3');
        crash_audio.volume = 0.3;
        crash_audio.play().catch(() => {});
        crash_audio.addEventListener('ended', go_black);

        crash_interval = setInterval(() => {
            crash_pct = Math.min(100, crash_pct + (0.55 + Math.random() * 1.2));
            if (crash_pct >= 100) {
                clearInterval(crash_interval);
                crash_interval = null;
                crash_countdown = 3;
                const cd = setInterval(() => {
                    crash_countdown--;
                    if (crash_countdown <= 0) {
                        clearInterval(cd);
                        trigger_explosion();
                    }
                }, 1000);
            }
        }, 95);
    }

    // ── Screen crack ──
    function draw_crack() {
        if (!crack_canvas) return;
        crack_canvas.width = window.innerWidth;
        crack_canvas.height = window.innerHeight;
        const ctx = crack_canvas.getContext('2d');
        const W = crack_canvas.width, H = crack_canvas.height;
        const ix = W * 0.42, iy = H * 0.38;

        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 18; i++) {
            const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const len = Math.max(W, H) * (0.5 + Math.random() * 0.8);
            ctx.beginPath();
            ctx.moveTo(ix, iy);
            const steps = 4 + Math.floor(Math.random() * 5);
            for (let s = 0; s < steps; s++) {
                const frac = (s + 1) / steps;
                ctx.lineTo(
                    ix + Math.cos(angle) * len * frac + (Math.random() - 0.5) * 40,
                    iy + Math.sin(angle) * len * frac + (Math.random() - 0.5) * 40
                );
            }
            ctx.stroke();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            const branchAngle = angle + (Math.random() - 0.5) * 1.2;
            const bx = ix + Math.cos(angle) * len * 0.4;
            const by = iy + Math.sin(angle) * len * 0.4;
            ctx.beginPath(); ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(branchAngle) * len * 0.25, by + Math.sin(branchAngle) * len * 0.25);
            ctx.stroke();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        for (let r = 12; r < 90; r += 18) {
            ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI * 2);
            ctx.globalAlpha = 0.8 - r / 90 * 0.6;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2, na = ((i + 1) / 12) * Math.PI * 2;
            const len = 60 + Math.random() * 140;
            ctx.beginPath(); ctx.moveTo(ix, iy);
            ctx.lineTo(ix + Math.cos(a) * len, iy + Math.sin(a) * len);
            ctx.lineTo(ix + Math.cos(na) * len, iy + Math.sin(na) * len);
            ctx.closePath();
            ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.25})`; ctx.fill();
        }
        ctx.filter = 'blur(1px)';
        ctx.strokeStyle = 'rgba(0,200,255,0.25)'; ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2, len = Math.max(W, H) * 0.6;
            ctx.beginPath(); ctx.moveTo(ix + 2, iy + 1);
            ctx.lineTo(ix + Math.cos(a) * len + 2, iy + Math.sin(a) * len + 1);
            ctx.stroke();
        }
        ctx.filter = 'none';
        for (let y = 0; y < H; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, y, W, 1); }
    }

    // ── Typing sound (XP Menu Command) ──
    function play_type_sound() {
        const snd = new Audio('/remake/current-site/SFX-XP/Windows XP Menu Command.wav');
        snd.volume = 0.35;
        snd.play().catch(() => {});
    }

    function start_rekt_typing() {
        const full = 'GET REKT LOL';
        let idx = 0;
        const typeNext = () => {
            if (idx >= full.length) return;
            rekt_text = full.slice(0, ++idx);
            play_type_sound();
            setTimeout(typeNext, 85);
        };
        setTimeout(typeNext, 2000);
    }

    // ── Explosion sequence ──
    function trigger_explosion() {
        const boom = new Audio('/remake/current-site/SFX-XP/explosion.mp3');
        boom.volume = 0.08;
        boom.play().catch(() => {});

        // crack ~300ms after explosion
        setTimeout(() => { crack_visible = true; tick().then(draw_crack); }, 300);
        // fire ~600ms after explosion
        setTimeout(() => { fire_visible = true; }, 600);

        // White flash: timing matches forum.html triggerCrashFlash logic
        const durationMs = (boom.duration || 3.6) * 1000;
        const total = Math.max(durationMs || 3600, 2400);
        const hold = Math.min(Math.max(total * 0.62, 1800), total - 300);
        const fadeDur = Math.max(300, total - hold);

        flash_visible = true;
        flash_opacity = 1;

        setTimeout(() => {
            const fadeStart = Date.now();
            const fadeOut = () => {
                const t = (Date.now() - fadeStart) / fadeDur;
                if (t < 1) {
                    flash_opacity = 1 - t;
                    requestAnimationFrame(fadeOut);
                } else {
                    flash_opacity = 0;
                    flash_visible = false;
                }
            };
            requestAnimationFrame(fadeOut);
        }, hold);
    }

    import Welcome from "./welcome.svelte";

    let unsubscribers = [
        queueCommand.subscribe((cmd) => {
            if (cmd != null && cmd != "") {
                switch (cmd) {
                    case "shutdown":
                    case "restart":
                        window.location.reload();
                        queueCommand.set(null);
                        break;
                    default: break;
                }
            }
        }),
    ];

    let show_welcome = true;

    onMount(async () => {
        crtEffect.set(localStorage.getItem('crt_effect') === 'true');
        unsubscribers.push(crtEffect.subscribe(v => localStorage.setItem('crt_effect', String(v))));
        unsubscribers.push(wallpaper.subscribe(v => { if (v) set('wallpaper', v); }));
        loadjs([
            "https://www.gstatic.com/charts/loader.js",
            "/js/mammoth.browser.min.js",
            "https://unpkg.com/panzoom@9.4.0/dist/panzoom.min.js",
            "https://unpkg.com/@ruffle-rs/ruffle"
        ]);
    });

    onDestroy(() => {
        for (let fn of unsubscribers) fn();
        if (crash_interval) clearInterval(crash_interval);
        stop_glitch();
    });
</script>


<svelte:window on:message={on_message} on:mousemove={on_mousemove} on:mouseup={on_mouseup} />

<div id="desktop" class="absolute inset-0 p-0" inert={crashed || blackout_visible || undefined}>
    <div class="absolute z-0 left-0 right-0 top-0 overflow-hidden" style:bottom="calc(30px + env(safe-area-inset-bottom))">
        <WorkSpace />
    </div>
    <TaskBar />
    <ContextMenu />
</div>

{#if show_welcome}<Welcome on:done={() => {
    show_welcome = false;
    const hd = get(hardDrive);
    if (hd?.['drmyGalleryFolder01']) {
        queueProgram.set({
            path: './programs/my_computer.svelte',
            fs_item: hd['drmyGalleryFolder01'],
            window_options: {
                exec_path: './programs/my_computer.svelte::gallery',
                width: window.innerWidth * 0.8,
                height: window.innerHeight * 0.7,
                top: 200,   // null = centered
                left: 250,  // null = centered
            }
        });
    }
}} />{/if}

<!-- Drag overlay to capture mouse over iframes -->
{#if popup_dragging}
<div class="fixed inset-0" style="z-index:999999;cursor:move;" on:mousemove={on_mousemove} on:mouseup={on_mouseup}></div>
{/if}

<!-- Draggable desktop popups from forum.html -->
{#each popups as popup (popup.id)}
<div
    class="fixed select-none virus-popup {popup.opts.variant === 'info' ? 'retro-info' : ''} {popup.opts.className || ''}"
    style="left:{popup.x}px;top:{popup.y}px;z-index:{popup.z};{popup.opts.width ? 'width:'+popup.opts.width+';' : ''}--popup-head:{popup.opts.headColor||'#000080'};--popup-border:{popup.opts.borderColor||'#f4f4f4'};{popup.opts.glitchShift != null ? '--glitch-shift:'+popup.opts.glitchShift+';' : ''}"
>
    <div
        role="presentation"
        class="virus-popup-head"
        on:mousedown={(e) => popup_mousedown(e, popup)}
    >
        <span>{popup.title || 'Alert'}</span>
        <span class="virus-popup-close" on:click={() => close_popup(popup.id)}>[x]</span>
    </div>
    <div
        role="presentation"
        class="virus-popup-body"
        on:click={(e) => relay_popup_event(e, popup.id)}
        on:input={(e) => relay_popup_event(e, popup.id)}
        on:change={(e) => relay_popup_event(e, popup.id)}
        on:keydown={(e) => relay_popup_event(e, popup.id)}
    >
        {#if popup.opts.html}
            {@html popup.opts.html}
        {:else}
            {popup.message || ''}
            {#if popup.source}
                <small>source: {popup.source}</small>
            {/if}
        {/if}
    </div>
</div>
{/each}

<!-- Glitch canvas overlay -->
{#if glitch_active}
<canvas
    bind:this={glitch_canvas}
    class="fixed inset-0 pointer-events-none"
    style="z-index:9000;"
></canvas>
{/if}

<!-- BSOD — VT323 IBM BIOS-style font, zero antialiasing -->
{#if crashed}
<div
    class="fixed inset-0 z-[99999] select-none overflow-auto"
    style="
        background:#0000aa;
        color:#fff;
        font-family:'DOS-V ANK16',monospace;
        font-size:16px;
        line-height:1.6;
        padding:clamp(16px,4vw,48px) clamp(16px,6vw,80px);
        -webkit-font-smoothing:none;
        -moz-osx-font-smoothing:unset;
        font-smooth:never;
        text-rendering:optimizeSpeed;
        image-rendering:pixelated;
        cursor:default;
        letter-spacing:0;
    "
>
    <p style="max-width:720px;">A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
    <br>
    <p style="max-width:720px;">The end-user has been diagnosed with a severe case of clicking on suspicious ads.</p>
    <br>
    <p style="max-width:720px;">
        If this is the first time you've seen this Stop error screen, maybe log off the internet.<br>
        If this screen appears again, seek professional help immediately.
    </p>
    <br>
    <p style="max-width:720px;">
        Check to make sure you are not, in fact, a gullible person. Disable your urge to click<br>
        suspicious popup ads. If you need to use Safe Mode to recover your dignity, press F8.
    </p>
    <br>
    <p style="max-width:720px;">Technical information:</p>
    <br>
    <p>*** STOP: 0x000000{Math.floor(Math.random()*9999).toString(16).toUpperCase().padStart(4,'0')} ({roast_code})</p>
    <br>
    <p style="max-width:720px;">
        Beginning dump of user's common sense...<br>
        Physical memory dump complete.<br>
        Contact your nearest responsible adult for further assistance.
    </p>
    <br><br>
    {#if crash_countdown === null}
    <p>Collecting crash info... {Math.floor(crash_pct)}%</p>
    <div style="width:min(320px,80vw);height:6px;background:rgba(255,255,255,0.25);margin-top:6px;">
        <div style="height:100%;background:#fff;width:{crash_pct}%;"></div>
    </div>
    {:else}
    <p>Restarting in {crash_countdown}...</p>
    {/if}
</div>
{/if}

<!-- Screen crack canvas -->
{#if crack_visible}
<canvas
    bind:this={crack_canvas}
    class="fixed inset-0 pointer-events-none"
    style="z-index:999997;"
></canvas>
{/if}

<!-- Fire overlay -->
{#if fire_visible}
<div class="fixed inset-0 pointer-events-none" style="z-index:999998;">
    <img src="/remake/current-site/SFX-XP/Fire.gif" alt="" style="width:100%;height:100%;object-fit:cover;" />
</div>
{/if}

<!-- White flash -->
{#if flash_visible}
<div class="fixed inset-0 pointer-events-none" style="z-index:999999;background:white;opacity:{flash_opacity};"></div>
{/if}

<!-- Blackout + GET REKT LOL — stays forever -->
{#if blackout_visible}
<div
    class="fixed inset-0"
    style="
        z-index:9999999;
        background:#000;
        cursor:default;
        user-select:none;
        display:flex;
        align-items:flex-end;
        padding:18px 22px;
    "
>
    <span style="
        display:block;
        color:#00ff41;
        font-family:'DOS-V ANK16',monospace;
        font-size:16px;
        line-height:1.6;
        letter-spacing:0;
        -webkit-font-smoothing:none;
        -moz-osx-font-smoothing:unset;
        font-smooth:never;
        text-rendering:optimizeSpeed;
        white-space:pre;
    ">{rekt_text}<span class="cursor-blink">_</span></span>
</div>
{/if}

{#if $crtEffect}
<div class="pointer-events-none fixed inset-0 z-[9999]" style="
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
"></div>
{/if}

<style>
    @font-face {
        font-family: 'IBM VGA';
        src: url('/fonts/Web437_IBM_VGA_8x14.woff') format('woff');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'DOS-V ANK16';
        src: url('/fonts/Web437_DOS-V_re_ANK16.woff') format('woff');
        font-weight: normal;
        font-style: normal;
    }
    .cursor-blink {
        animation: blink 0.6s step-start infinite;
    }
    @keyframes blink {
        50% { opacity: 0; }
    }

    /* ── Virus popup styles (bridged from forum.html) ── */
    :global(.virus-popup){
        width:clamp(220px,24vw,300px);
        background:#c0c0c0;
        border:2px outset #f4f4f4;
        color:#111;
        font-family:'VT323',monospace;
        box-shadow:8px 8px 0 rgba(0,0,0,.22);
        animation:virus-pop .12s steps(2,end);
        border-color:var(--popup-border,#f4f4f4);
    }
    :global(.virus-popup.popup-glitchy){overflow:hidden;transform:skewX(-1deg);}
    :global(.virus-popup.popup-glitchy)::before{
        content:'';position:absolute;inset:0;pointer-events:none;
        background:repeating-linear-gradient(180deg,rgba(255,255,255,.06) 0 8px,rgba(0,0,0,.2) 8px 12px,transparent 12px 20px);
        mix-blend-mode:screen;opacity:.9;
    }
    :global(.virus-popup.popup-glitchy .virus-popup-head),
    :global(.virus-popup.popup-glitchy .virus-popup-body){transform:translateX(calc((var(--glitch-shift,0))*1px));}
    :global(.virus-popup.popup-glitchy .virus-popup-body){
        clip-path:polygon(0 0,100% 0,100% 14%,0 18%,0 31%,100% 28%,100% 48%,0 52%,0 67%,100% 64%,100% 82%,0 86%,0 100%,100% 100%);
    }
    :global(.virus-popup-head){
        display:flex;justify-content:space-between;align-items:center;
        background:var(--popup-head,#000080);color:#fff;font-size:15px;
        padding:3px 6px;cursor:move;user-select:none;
    }
    :global(.virus-popup-close){cursor:pointer;min-width:22px;text-align:center;}
    :global(.virus-popup-body){padding:10px 10px 12px;font-size:19px;line-height:1.15;}
    :global(.virus-popup-body small){display:block;font-size:15px;color:#b00000;margin-top:5px;}
    :global(.virus-popup.retro-info){background:#efe7d0;}
    :global(.virus-popup.retro-info .virus-popup-body small){color:#6f4711;}
    :global(.virus-popup.popup-empty .virus-popup-body){min-height:72px;}
    :global(.virus-popup.popup-empty .virus-popup-body > *){display:none;}
    :global(.virus-popup.popup-empty .virus-popup-head span:first-child){opacity:.45;}
    :global(.popup-actions){display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
    :global(.popup-btn){border:2px outset #d8d0c0;background:#f2ead6;color:#111;font-family:'VT323',monospace;font-size:18px;padding:4px 10px;cursor:pointer;}
    :global(.popup-btn:active){border-style:inset;}
    :global(.popup-status){margin-top:8px;font-size:17px;color:#5e3100;}
    :global(.popup-meter){width:100%;height:16px;border:2px inset #bcb4a4;background:#fff8e9;margin-top:8px;overflow:hidden;}
    :global(.popup-meter-fill){height:100%;width:0;background:linear-gradient(90deg,#00aa44,#66ff99);}
    :global(.popup-grid){display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px;}
    :global(.popup-card){border:1px solid #8b6914;background:#fff7dc;padding:6px;font-size:16px;}
    :global(.popup-list){margin-top:8px;border:1px solid #8b6914;background:#fff9ee;padding:6px;display:flex;flex-direction:column;gap:4px;max-height:140px;overflow:auto;}
    :global(.popup-mail){font-size:15px;border-bottom:1px dotted #bba16c;padding-bottom:3px;}
    :global(.popup-reels){display:flex;gap:6px;justify-content:center;margin-top:8px;}
    :global(.popup-reel){width:56px;border:2px inset #cfc3ab;background:#fff;font-size:32px;text-align:center;padding:8px 0;}
    :global(.popup-note){margin-top:8px;font-size:15px;color:#7a0048;}
    :global(.bonzi-setup){border:2px outset #b66cff;background:linear-gradient(180deg,#f7e8ff,#ead2ff);padding:10px;}
    :global(.bonzi-stage){display:flex;gap:12px;align-items:flex-start;margin-top:8px;}
    :global(.bonzi-canvas-wrap){width:192px;height:154px;flex-shrink:0;border:2px inset #a87cd6;background:linear-gradient(180deg,#f9f2ff,#efe0ff);display:flex;align-items:center;justify-content:center;}
    :global(.bonzi-canvas){width:180px;height:135px;display:block;image-rendering:pixelated;}
    :global(.bonzi-speech){flex:1;min-height:98px;background:#330066;color:#ffccff;padding:8px 10px;font-size:16px;border:2px solid #aa00ff;line-height:1.35;}
    :global(.bonzi-actions){display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
    :global(.bonzi-actions .popup-btn){min-width:88px;}
    :global(.bonzi-mini-status){margin-top:8px;font-size:16px;color:#6a1294;}
    :global(.bonzi-menu-copy){border:2px outset #b66cff;background:linear-gradient(180deg,#f7e8ff,#ead2ff);padding:10px;}
    :global(.bonzi-menu-copy h3){font-family:VT323,monospace;font-size:30px;color:#6a1294;margin-bottom:6px;}
    :global(.bonzi-menu-copy p){font-size:16px;line-height:1.3;color:#4d1f73;}
    @keyframes -global-virus-pop{0%{transform:scale(.85)}100%{transform:scale(1)}}
</style>
