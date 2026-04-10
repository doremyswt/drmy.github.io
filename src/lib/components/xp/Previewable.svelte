<script>
    import * as fs from '../../fs';
    import {onMount} from 'svelte';

    export let default_icon;
    export let fs_id;
    export let size = 50;
    export let fluid = false;
    let preview_url;

    onMount(() => {
        load_preview();
    });

    async function load_preview(){
        if(preview_url != null) return;
        if(fs_id == null) return;
        let url = await fs.get_url(fs_id);
        if(!url) return;

        let image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            try {
                let scale = 0.4;
                let w = Math.round(image.naturalWidth * scale);
                let h = Math.round(image.naturalHeight * scale);
                let canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(image, 0, 0, w, h);
                preview_url = `url(${canvas.toDataURL('image/jpeg', 0.8)})`;
            } catch(_) {
                // canvas tainted (cross-origin) — fall back to full URL
                preview_url = `url(${url})`;
            }
        };
        image.onerror = () => { preview_url = `url(${url})`; };
        image.src = url;
    }
</script>

<div class="bg-contain bg-no-repeat bg-center"
    class:shrink-0={!fluid}
    class:w-full={fluid}
    style:background-image="{preview_url || default_icon}"
    style:width="{fluid ? null : size+'px'}"
    style:height="{fluid ? null : size+'px'}"
    style:aspect-ratio="{fluid ? '1' : null}">
</div>
