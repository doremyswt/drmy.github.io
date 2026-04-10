<script>
    import Window from '../../../lib/components/xp/Window.svelte';
    import { unmount } from 'svelte';
    import { runningPrograms } from '../../../lib/store';

    export let id;
    export let exec_path;
    export let get_self = () => null;
    export let url;
    export let title = '';
    export let icon = '/images/xp/icons/InternetExplorer6.png';
    export let window_options = null;
    export let window;

    export function destroy(){
        runningPrograms.update(programs => programs.filter(p => p != get_self()));
        unmount(get_self());
    }

    let ws = document.querySelector('#work-space');
    const wsW = ws.offsetWidth - 40;
    const wsH = ws.offsetHeight - 40;

    // Default: 3:4 (portrait), unresizable
    let _w, _h, _resizable = false;
    const aspect = window_options?.aspect;
    if (aspect === '1:1') {
        _h = Math.min(wsH, wsW);
        _w = _h;
        _resizable = window_options?.resizable ?? true;
    } else {
        // 3:4
        _h = Math.min(wsH, Math.round(wsW * 4 / 3));
        _w = Math.round(_h * 3 / 4);
        _resizable = window_options?.resizable ?? false;
    }

    export let options = {
        title: title || url?.split('/').pop() || 'Window',
        width: _w,
        height: _h,
        min_width: _w,
        min_height: _h,
        resizable: _resizable,
        icon,
        id,
        exec_path
    };
</script>

<Window {options} bind:this={window} on_click_close={destroy}>
    <div slot="content" class="absolute inset-0">
        <!-- svelte-ignore a11y-missing-attribute -->
        <iframe src={url} class="w-full h-full border-none" frameborder="0" allowfullscreen allow="gamepad *;"></iframe>
    </div>
</Window>

<svelte:options accessors={true}></svelte:options>
