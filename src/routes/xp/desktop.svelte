<script>
    import TaskBar from "./task_bar.svelte";
    import WorkSpace from "./work_space.svelte";
    import ContextMenu from "../../lib/components/xp/ContextMenu.svelte";
    import axios from "axios";
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import {
        zIndex,
        hardDrive,
        queueCommand,
        queueProgram,
    } from "../../lib/store";
    import StartMenu from "./start_menu.svelte";
    import Welcome from "./welcome.svelte";
    import * as utils from "../../lib/utils";
    let dispatcher = createEventDispatcher();

    const GALLERY_FOLDER_ID = 'drmyGalleryFolder01';

    let io_worker;
    let hasTriggeredEmbeddedCrash = false;
    let showBsod = false;

    // ── Forum popup bridge ────────────────────────────────────────────────
    // forum.html posts 'forum-popup-spawn' messages when it wants to show a
    // popup. We render them here in the top-level DOM so they can be dragged
    // freely outside the iframe boundary.
    let forumPopups = [];
    let _popZ = 6000;

    function handleEmbeddedMessage(event) {
        if (event.origin && event.origin !== window.location.origin) return;

        const data = event.data;
        if (data == null || typeof data !== "object") return;

        // ── bonzi crash (existing) ──
        if (data.type === "bonzi-crash") {
            if (hasTriggeredEmbeddedCrash) return;
            hasTriggeredEmbeddedCrash = true;
            showBsod = true;
            return;
        }

        // ── forum popup spawn ──
        if (data.type === "forum-popup-spawn") {
            const opts = data.opts || {};
            const bodyHtml = opts.html || (
                (data.message || "") +
                (opts.showSource === false ? "" : `<small style="display:block;font-size:15px;color:#b00000;margin-top:5px">source: ${data.source || ""}</small>`)
            );
            const w = window.innerWidth;
            const h = window.innerHeight;
            const popW = parseInt(opts.width) || 280;
            let x, y;
            if (opts.centered) {
                x = Math.max(16, (w - popW) / 2);
                y = Math.max(32, (h - 160) / 2);
            } else {
                x = 20 + Math.random() * Math.max(120, w - popW - 40);
                y = 40 + Math.random() * Math.max(120, h - 220);
            }
            const popup = {
                id: data.id,
                title: data.title,
                bodyHtml,
                headColor: opts.headColor || "#000080",
                borderColor: opts.borderColor || "#f4f4f4",
                extraClass: [
                    opts.variant === "info" ? "retro-info" : "",
                    opts.className || "",
                    opts.glitchShift != null ? "popup-glitchy" : "",
                ].filter(Boolean).join(" "),
                isInfo: opts.variant === "info",
                glitchShift: opts.glitchShift,
                width: opts.width || null,
                closeOnBody: !!opts.closeOnBody,
                autoCloseMs: opts.autoCloseMs || null,
                x, y,
                z: ++_popZ,
            };
            forumPopups = [...forumPopups, popup];
            if (popup.autoCloseMs) {
                setTimeout(() => closeForumPopup(popup.id), popup.autoCloseMs);
            }
            return;
        }

        // ── forum popup externally closed (from iframe stub.remove()) ──
        if (data.type === "forum-popup-close") {
            closeForumPopup(data.id);
            return;
        }
    }

    function closeForumPopup(id) {
        forumPopups = forumPopups.filter(p => p.id !== id);
        // Notify the iframe so it can fire cleanup/onClose callbacks.
        const iframe = document.querySelector("iframe[src*='forum']");
        iframe?.contentWindow?.postMessage({ type: "forum-popup-ack", id }, "*");
    }

    function focusForumPopup(id) {
        forumPopups = forumPopups.map(p =>
            p.id === id ? { ...p, z: ++_popZ } : p
        );
    }

    function startDragForumPopup(ev, id) {
        if (ev.target.closest(".forum-popup-close")) return;
        focusForumPopup(id);
        const popup = forumPopups.find(p => p.id === id);
        if (!popup) return;
        ev.preventDefault();
        const startX = ev.clientX, startY = ev.clientY;
        const origX = popup.x, origY = popup.y;
        // Disable pointer events on the iframe so mousemove isn't swallowed.
        const iframe = document.querySelector("iframe[src*='forum']");
        if (iframe) iframe.style.pointerEvents = "none";
        function move(e) {
            forumPopups = forumPopups.map(p =>
                p.id === id
                    ? { ...p, x: Math.max(0, origX + (e.clientX - startX)), y: Math.max(0, origY + (e.clientY - startY)) }
                    : p
            );
        }
        function up() {
            if (iframe) iframe.style.pointerEvents = "";
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        }
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    }

    // ─────────────────────────────────────────────────────────────────────

    let unsubscribers = [
        queueCommand.subscribe((cmd) => {
            if (cmd != null && cmd != "") {
                switch (cmd) {
                    case "shutdown":
                        dispatcher("load_page", {
                            url: "./xp/shutdown.svelte",
                        });
                        queueCommand.set(null);
                        break;
                    case "restart":
                        dispatcher("load_page", {
                            url: "./xp/shutdown.svelte",
                        });
                        break;
                    default:
                        break;
                }
            }
        }),
    ];

    let welcome_scene;

    onMount(async () => {
        loadjs(
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.1/jquery.min.js',
            {
                success: () => loadjs([
                    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js',
                    'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css',
                    "https://www.gstatic.com/charts/loader.js",
                    "/js/mammoth.browser.min.js",
                    "https://unpkg.com/panzoom@9.4.0/dist/panzoom.min.js",
                    "https://unpkg.com/@ruffle-rs/ruffle"
                ])
            }
        );

        window.addEventListener("message", handleEmbeddedMessage);
        welcome_scene.self = welcome_scene;

        // Open gallery on every load as soon as hardDrive is ready.
        // Use a flag instead of calling unsubGallery() inside the callback —
        // the callback fires synchronously before subscribe() has returned,
        // so unsubGallery would be undefined and throw.
        let galleryOpened = false;
        const unsubGallery = hardDrive.subscribe(data => {
            if (!galleryOpened && data[GALLERY_FOLDER_ID]) {
                galleryOpened = true;
                queueProgram.set({
                    path: './programs/my_computer.svelte',
                    fs_item: data[GALLERY_FOLDER_ID]
                });
            }
        });
        unsubscribers.push(unsubGallery);
    });

    onDestroy(() => {
        window.removeEventListener("message", handleEmbeddedMessage);
        for (let fn of unsubscribers) fn();
        clearInterval(io_worker);
    });
</script>

<div id="desktop" class="absolute inset-0 p-0">
    <div class="absolute z-0 left-0 right-0 top-0 bottom-[30px]">
        <WorkSpace />
    </div>

    <TaskBar />
    <StartMenu />
    <ContextMenu />
</div>

<Welcome bind:this={welcome_scene} />

{#if showBsod}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="bsod" on:click={() => { showBsod = false; hasTriggeredEmbeddedCrash = false; }}>
    <div class="bsod-inner">
        <p class="bsod-header">A problem has been detected and Windows has been shut down to prevent damage
to your computer.</p>
        <p class="bsod-code">BONZI_BUDDY_KERNEL_PANIC</p>
        <p>If this is the first time you've seen this Stop error screen,
restart your computer. If this screen appears again, follow
these steps:</p>
        <p>Check to make sure any new hardware or software is properly installed.
If this is a new installation, ask your hardware or software manufacturer
for any Windows updates you might need.</p>
        <p>If problems continue, disable or remove any newly installed hardware
or software. Disable BIOS memory options such as caching or shadowing.
If you need to use Safe Mode to remove or disable components, restart
your computer, press F8 to select Advanced Startup Options, and then
select Safe Mode.</p>
        <p class="bsod-tech">Technical information:</p>
        <p class="bsod-stop">*** STOP: 0x0000007E (0xC0000005, 0xBB5A3F2C, 0xF78DA208, 0xF78D9F08)</p>
        <p class="bsod-stop">*** bonzi.sys - Address BB5A3F2C base at BB580000, DateStamp 3d6dd67c</p>
        <p class="bsod-hint">Click anywhere to dismiss.</p>
    </div>
</div>
{/if}

<!-- Forum popups rendered at desktop level so they escape the iframe -->
{#each forumPopups as popup (popup.id)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="forum-retro-popup {popup.extraClass}"
        style="
            position: fixed;
            left: {popup.x}px;
            top: {popup.y}px;
            z-index: {popup.z};
            width: {popup.width || 'clamp(220px,24vw,300px)'};
            background: {popup.isInfo ? '#efe7d0' : '#c0c0c0'};
            border: 2px outset {popup.borderColor};
            color: #111;
            font-family: 'VT323', monospace;
            box-shadow: 8px 8px 0 rgba(0,0,0,.22);
        "
        on:mousedown={() => focusForumPopup(popup.id)}
    >
        <!-- Title bar / drag handle -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="forum-popup-titlebar"
            style="background: {popup.headColor};"
            on:mousedown={(e) => startDragForumPopup(e, popup.id)}
        >
            <span>{popup.title}</span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
                class="forum-popup-close"
                on:mousedown|stopPropagation
                on:click={() => closeForumPopup(popup.id)}
            >[x]</span>
        </div>
        <!-- Body -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="forum-popup-body"
            on:click={() => popup.closeOnBody && closeForumPopup(popup.id)}
        >
            {@html popup.bodyHtml}
        </div>
    </div>
{/each}

<style>
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

    .bsod {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #0000aa;
        color: #fff;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.6;
        cursor: default;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
    }
    .bsod-inner {
        max-width: 640px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .bsod-header {
        font-weight: bold;
    }
    .bsod-code {
        background: #aaaaaa;
        color: #0000aa;
        padding: 2px 6px;
        display: inline-block;
        font-weight: bold;
    }
    .bsod-tech {
        font-weight: bold;
        margin-top: 8px;
    }
    .bsod-stop {
        font-size: 12px;
    }
    .bsod-hint {
        margin-top: 24px;
        font-size: 12px;
        opacity: 0.7;
        font-style: italic;
    }

    .forum-retro-popup {
        animation: forum-pop .12s steps(2, end);
    }
    .forum-popup-titlebar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
        font-size: 15px;
        padding: 3px 6px;
        cursor: move;
        user-select: none;
    }
    .forum-popup-close {
        cursor: pointer;
        min-width: 22px;
        text-align: center;
    }
    .forum-popup-close:hover {
        background: #ff0000;
    }
    .forum-popup-body {
        padding: 10px 10px 12px;
        font-size: 19px;
        line-height: 1.15;
    }
    @keyframes forum-pop {
        from { transform: scale(0.85); opacity: 0; }
        to   { transform: scale(1);    opacity: 1; }
    }
</style>
