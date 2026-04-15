
<script>
   import { onMount } from 'svelte';
   import { hardDrive, wallpaper } from '../lib/store';
   import { bliss_wallpaper, SortOptions, SortOrders } from '../lib/system';
   import { get, set } from 'idb-keyval';
   import axios from 'axios';
   import Welcome from './xp/welcome.svelte';

   let page = null;

   onMount(async () => {
    load_hard_drive();
    load_wallpaper();
    await load_page('./xp/desktop.svelte');
   })

   const USER_FIELDS = ['desktop_css_transform', 'sort_option', 'sort_order', 'view_mode'];

   async function load_hard_drive() {
    let hard_drive = (await axios({ method: 'get', url: '/json/hard_drive.json' })).data;
    let cached = await get('hard_drive');
    if (cached != null) {
        for (let key of Object.keys(hard_drive)) {
            if (cached[key] != null) {
                for (let field of USER_FIELDS) {
                    if (cached[key][field] != null) {
                        hard_drive[key][field] = cached[key][field];
                    }
                }
            }
        }
    }
    migrate_files_format(hard_drive);
    hardDrive.set(hard_drive);
   }

   function migrate_files_format(drive) {
    let now = (new Date()).getTime();
    for (let key of Object.keys(drive)) {
        let obj = drive[key];
        if (obj.children == null) { obj.children = [...(obj.files||[]), ...(obj.folders||[])]; delete obj.files; delete obj.folders; }
        if (obj.date_created == null) obj.date_created = now;
        if (obj.date_modified == null) obj.date_modified = now;
        if (obj.sort_option == null) obj.sort_option = SortOptions.NONE;
        if (obj.sort_order == null) obj.sort_order = SortOrders.ASCENDING;
    }
   }

   async function load_wallpaper() {
    $wallpaper = await get('wallpaper');
    if ($wallpaper == null) {
        $wallpaper = bliss_wallpaper;
        await set('wallpaper', bliss_wallpaper);
    }
   }


   async function load_page(url){
    //manually import modules cause Vite hasn't supported dynamically import with variables yet
    if(url == './boot_manager.svelte'){
        page = (await import('./boot_manager.svelte')).default;

    }
    else if(url == './+page.svelte'){
        page = (await import('./+page.svelte')).default;

    }
    else if(url == './installation/95/installing.svelte'){
        page = (await import('./installation/95/installing.svelte')).default;

    }
    else if(url == './installation/95/product_key_windows.svelte'){
        page = (await import('./installation/95/product_key_windows.svelte')).default;

    }
    else if(url == './installation/dos/copying.svelte'){
        page = (await import('./installation/dos/copying.svelte')).default;

    }
    else if(url == './installation/dos/eula.svelte'){
        page = (await import('./installation/dos/eula.svelte')).default;

    }
    else if(url == './installation/dos/format.svelte'){
        page = (await import('./installation/dos/format.svelte')).default;

    }
    else if(url == './installation/dos/partition.svelte'){
        page = (await import('./installation/dos/partition.svelte')).default;

    }
    else if(url == './installation/dos/restart.svelte'){
        page = (await import('./installation/dos/restart.svelte')).default;

    }
    else if(url == './installation/dos/starting.svelte'){
        page = (await import('./installation/dos/starting.svelte')).default;

    }
    else if(url == './installation/dos/welcome.svelte'){
        page = (await import('./installation/dos/welcome.svelte')).default;

    }
    else if(url == './xp/desktop.svelte'){
        page = (await import('./xp/desktop.svelte')).default;

    }
    else if(url == './xp/program_tray.svelte'){
        page = (await import('./xp/program_tray.svelte')).default;

    }
    else if(url == './xp/programs/display_properties.svelte'){
        page = (await import('./xp/programs/display_properties.svelte')).default;

    }
    else if(url == './xp/programs/internet_explorer.svelte'){
        page = (await import('./xp/programs/internet_explorer.svelte')).default;

    }
    else if(url == './xp/programs/my_computer.svelte'){
        page = (await import('./xp/programs/my_computer.svelte')).default;

    }
    else if(url == './xp/starting.svelte'){
        page = (await import('./xp/starting.svelte')).default;

    }
    else if(url == './xp/system_tray.svelte'){
        page = (await import('./xp/system_tray.svelte')).default;

    }
    else if(url == './xp/task_bar.svelte'){
        page = (await import('./xp/task_bar.svelte')).default;

    }
    else if(url == './xp/wallpaper.svelte'){
        page = (await import('./xp/wallpaper.svelte')).default;

    } else if(url == './xp/shutdown.svelte'){
        page = (await import('./xp/shutdown.svelte')).default;

    } else if(url == './xp/blackout.svelte'){
        page = (await import('./xp/blackout.svelte')).default;

    }
    
   }


</script>

<svelte:head>
    <title>drmy's XP Desktop</title>
</svelte:head>

{#if page}
<svelte:component this={page} on:load_page={(e) => load_page(e.detail.url)}></svelte:component>
{:else}
<Welcome on:done={() => {}} />
{/if}
