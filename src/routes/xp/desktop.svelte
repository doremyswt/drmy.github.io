<script>
    import TaskBar from "./task_bar.svelte";
    import WorkSpace from "./work_space.svelte";
    import ContextMenu from "../../lib/components/xp/ContextMenu.svelte";
    import axios from "axios";
    import { get, set, keys } from "idb-keyval";
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import {
        zIndex,
        hardDrive,
        wallpaper,
        queueCommand,
    } from "../../lib/store";
    import Welcome from "./welcome.svelte";
    import * as utils from "../../lib/utils";
    let dispatcher = createEventDispatcher();

    let io_worker;

    let unsubscribers = [
        hardDrive.subscribe(async (value) => {
            clearInterval(io_worker);
            io_worker = setTimeout(async () => {
                console.log('update hardDrive');
                await set("hard_drive", $hardDrive);
            }, 1000);
        }),
        wallpaper.subscribe(async (value) => {
            if (value == null) return;
            await set("wallpaper", value);
        }),
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

    let show_welcome = true;

    onMount(async () => {
        //load other pure js lib
        loadjs([
            "https://www.gstatic.com/charts/loader.js",
            "/js/mammoth.browser.min.js",
            "https://unpkg.com/panzoom@9.4.0/dist/panzoom.min.js",
            "https://unpkg.com/@ruffle-rs/ruffle"
        ]);
    });

    onDestroy(() => {
        for (let fn of unsubscribers) {
            fn();
        }
        clearInterval(io_worker);
    });
</script>

<div id="desktop" class="absolute inset-0 p-0">
    <div class="absolute z-0 left-0 right-0 top-0 overflow-hidden" style:bottom="calc(30px + env(safe-area-inset-bottom))">
        <WorkSpace />
    </div>

    <TaskBar />
    <ContextMenu />
</div>

{#if show_welcome}<Welcome on:done={() => show_welcome = false} />{/if}
