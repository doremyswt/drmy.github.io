<script>
    import { queueProgram } from '../../lib/store';
    import * as utils from '../../lib/utils';
    const { click_outside } = utils;

    const galleryShortcut = {
        name: 'Gallery',
        icon: '/images/xp/icons/MyPictures.png',
        path: './programs/my_computer.svelte',
        fs_item: {id: 'drmyGalleryFolder01'},
        font: 'bold'
    };

    let col_1 = [
        {
            name: 'Paint',
            icon: '/images/xp/icons/Paint.png',
            path: './programs/paint.svelte',
        },
        {
            name: 'Minesweeper',
            icon: '/images/xp/icons/Minesweeper.png',
            path: './programs/minesweeper.svelte',
        },
    ];

    let col_2 = [
        {
            name: 'My Computer',
            icon: '/images/xp/icons/MyComputer.png',
            path: './programs/my_computer.svelte',
            font: 'bold'
        },
        galleryShortcut
    ];

    let programs = [
        {
            name: 'Paint',
            icon: '/images/xp/icons/Paint.png',
            path: './programs/paint.svelte',
        },
        {
            name: 'Minesweeper',
            icon: '/images/xp/icons/Minesweeper.png',
            path: './programs/minesweeper.svelte',
        },
        {
            name: 'My Computer',
            icon: '/images/xp/icons/MyComputer.png',
            path: './programs/my_computer.svelte',
            font: 'bold'
        },
        galleryShortcut
    ];

    function hide(){
        let el = document.querySelector('#start-menu');
        if(!el.classList.contains('hidden')){
            el.classList.add('hidden');
        }
    }

    function launch(item){
        console.log(item);
        let {path, fs_item, webapp, link } = item;
        if(link){
            open_link(link);

        } else if(path){
            queueProgram.set({
                path, 
                fs_item,
                webapp
            })
        }
        hide();
    }

    function open_link(link){
        queueProgram.set({
            path: './programs/internet_explorer.svelte',
            fs_item: {url: link}
        })
    }

    async function show_shutdown_panel(){
        const ShutDownPanel = (await import('./shutdown_panel.svelte')).default;
        let panel = new ShutDownPanel({
            target: document.querySelector('#desktop')
        });
        panel.self = panel;
        hide();
    }

</script>

<div id="start-menu" class="absolute bottom-[30px] left-0 h-[500px] w-[390px] z-20 flex flex-col shadow-lg rounded-t-md hidden"
    style:background-color="rgb(66, 130, 214)"
    use:click_outside on:click_outside={hide}>
    <div class="h-[3px] absolute top-0 left-[3px] right-[3px]" style="background: linear-gradient(to right, transparent 0px, rgba(255, 255, 255, 0.3) 1%, rgba(255, 255, 255, 0.5) 2%, rgba(255, 255, 255, 0.5) 95%, rgba(255, 255, 255, 0.3) 98%, rgba(255, 255, 255, 0.2) 99%, transparent 100%);
    box-shadow: rgb(14 96 203) 0px -1px 1px inset;"></div>

    <div class="w-full h-[70px] rounded-t-md shrink-0"
        style:background-image="linear-gradient(rgb(24, 104, 206) 0%, rgb(14, 96, 203) 12%, rgb(14, 96, 203) 20%, rgb(17, 100, 207) 32%, rgb(22, 103, 207) 33%, rgb(27, 108, 211) 47%, rgb(30, 112, 217) 54%, rgb(36, 118, 220) 60%, rgb(41, 122, 224) 65%, rgb(52, 130, 227) 77%, rgb(55, 134, 229) 79%, rgb(66, 142, 233) 90%, rgb(71, 145, 235) 100%)">
    </div>

    <div class="shrink-0 h-[2px] w-full" style:background-image="linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(218, 136, 74) 50%, rgba(0, 0, 0, 0) 100%)">
    </div>

    <div class="grow bg-slate-50 mx-0.5 flex flex-row">
        
        <div class="grow w-1/2 flex flex-col h-full shrink-0 px-1">
            {#each col_1 as item}
                {#if item == null}
                    <div class="my-0.5 mx-auto w-5/6 h-[2px] bg-slate-200 shrink-0"></div>
                {:else}
                    <div class="flex flex-row items-center grow p-1 group hover:bg-blue-500" on:click={() => launch(item)}>
                        <div class="w-8 h-8 bg-contain mr-1"
                            style:background-image="url({item.icon})">
                        </div>
                        <div class="text-[11px] group-hover:text-white text-black {item.font == 'bold' ? 'font-bold' : ''}">
                            {item.name}
                        </div>
                    </div>
                {/if}
            {/each}
            <div class="my-0.5 mx-auto w-5/6 h-[2px] bg-slate-200 shrink-0"></div>
            <div class="relative grow group">
                
                <div class="flex pl-9 py-2 items-center flex-row  group-hover:bg-blue-500">
                    <div class="font-bold text-black text-[11px] group-hover:text-white">All Programs</div>
                    <div class="w-4 h-4 ml-1 bg-contain bg-[url(/images/xp/icons/876.png)]"></div>
                </div>

                <div class="absolute left-[90%] bottom-0 w-[250px] shadow-xl border-t border-l-4 border-blue-500 hidden group-hover:block bg-slate-50">
                    <div class="absolute -left-[50px] bottom-0 w-[820px] h-[500px] ">
                        <div class="absolute left-[300px] top-0 -bottom-[100px] right-0 " on:click|self={hide}></div>
                    </div>
                    {#each programs as item}
                        {#if item == null}
                            <div class="my-0.5 mx-auto w-5/6 h-[1px] bg-slate-200 shrink-0"></div>
                        {:else}
                            <div class="flex flex-row items-center grow p-1 group-sub1 hover:bg-blue-500 relative"  on:click={() => launch(item)}>
                                <div class="w-5 h-5 bg-contain mr-1 shrink-0"
                                    style:background-image="url({item.icon})">
                                </div>
                                <div class="text-[11px]  text-slate-800 grow group-sub1-hover:text-white">
                                    {item.name}
                                </div>
                                <div class="w-[10px] shrink-0">
                                    {#if item.items != null}
                                        <svg class="fill-slate-900 group-sub1-hover:fill-slate-50 w-[10px] h-[10px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                                    {/if}
                                </div>

                                {#if item.items != null}
                                    <div class="absolute left-[100%] top-0 w-[200px] shadow-xl border-t border-b border-l-4 border-blue-500 hidden group-sub1-hover:block bg-slate-50"
                                        style:top="{item.top}">
                                        <div  on:click|self={hide} class="absolute left-0 -bottom-[50px] w-[500px]" style:height="{item.items.length * 37}px"></div>
                                        {#if item.items.length == 0}
                                            <div class="h-6 text-slate-400 text-[11px] w-full px-4 flex flex-row items-center">(Empty)</div>
                                        {/if}
                                        {#each item.items as subitem}
                                            {#if subitem == null}
                                                <div class="my-0.5 mx-auto w-5/6 h-[1px] bg-slate-200 shrink-0"></div>
                                            {:else}
                                                <div class="flex flex-row items-center grow p-1 group-sub2 hover:bg-blue-500 relative" on:click={() => launch(subitem)}>
                                                    <div class="w-5 h-5 bg-contain mr-1 shrink-0"
                                                        style:background-image="url({subitem.icon})">
                                                    </div>
                                                    <div class="text-[11px]  text-slate-800 grow group-sub2-hover:text-white">
                                                        {subitem.name}
                                                    </div>
                                                    <div class="w-[10px] shrink-0">
                                                        {#if subitem.items != null}
                                                            <svg class="fill-slate-900 group-sub2-hover:fill-slate-50 w-[10px] h-[10px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                                                        {/if}
                                                    </div>
                                                    {#if subitem.items != null}
                                                        <div class="absolute left-[100%] top-0 w-[220px] shadow-xl border-t border-b border-l-4 border-blue-500 hidden group-sub2-hover:block bg-slate-50">
                                                            {#each subitem.items as subsubitem}
                                                                {#if subsubitem == null}
                                                                    <div class="my-0.5 mx-auto w-5/6 h-[1px] bg-slate-200 shrink-0"></div>
                                                                {:else}
                                                                    <div class="flex flex-row items-center grow p-1 group-sub3 hover:bg-blue-500 relative" on:click={() => launch(subsubitem)}>
                                                                        <div class="w-5 h-5 bg-contain mr-1 shrink-0"
                                                                            style:background-image="url({subsubitem.icon})">
                                                                        </div>
                                                                        <div class="text-[11px]  text-slate-800 grow group-sub3-hover:text-white">
                                                                            {subsubitem.name}
                                                                        </div>
                                                                        <div class="w-[10px] shrink-0">
                                                                            {#if subsubitem.items != null}
                                                                                <svg class="fill-slate-900 group-sub3-hover:fill-slate-50 w-[10px] h-[10px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                                                                            {/if}
                                                                        </div>
                                                                    </div>
                                                                {/if}
                                                            {/each}
                                                        </div>
                                                    {/if}
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                {/if}

                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>

        <div class="grow w-1/2 flex flex-col h-full bg-blue-200 shrink-0 px-1">
            {#each col_2 as item}
                {#if item == null}
                    <div class="my-0.5 mx-auto w-5/6 h-[1px] bg-blue-100 shrink-0"></div>
                {:else}
                    <div class="flex flex-row items-center grow p-1 group hover:bg-blue-500" on:click={() => launch(item)}>
                        <div class="w-7 h-7 bg-contain mr-1"
                            style:background-image="url({item.icon})">
                        </div>
                        <div class="text-[11px] group-hover:text-white text-slate-800 {item.font == 'bold' ? 'font-bold' : ''}">
                            {item.name}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    </div>

    <div class="w-full h-[40px] shrink-0 flex items-center justify-end px-2" 
        style:background-image="linear-gradient(rgb(66, 130, 214) 0%, rgb(59, 133, 224) 3%, rgb(65, 138, 227) 5%, rgb(65, 138, 227) 17%, rgb(60, 135, 226) 21%, rgb(55, 134, 228) 26%, rgb(52, 130, 227) 29%, rgb(46, 126, 225) 39%, rgb(35, 116, 223) 49%, rgb(32, 114, 219) 57%, rgb(25, 110, 219) 62%, rgb(23, 107, 216) 72%, rgb(20, 104, 213) 75%, rgb(17, 101, 210) 83%, rgb(15, 97, 203) 88%)">
        <div class="p-1 rounded-sm hover:brightness-110 flex flex-row items-center" on:click={show_shutdown_panel}>
            <div class="w-6 h-6 bg-[url(/images/xp/icons/Logout.png)] bg-contain"></div>
            <span class="text-slate-50 text-[11px] ml-1">Log Off</span>
        </div>
        <div class="p-1 ml-2 rounded-sm hover:brightness-110 flex flex-row items-center" on:click={show_shutdown_panel}>
            <div class="w-6 h-6 bg-[url(/images/xp/icons/Power.png)] bg-contain" ></div>
            <span class="text-slate-50 text-[11px] ml-1">Turn Off Computer</span>
        </div>
    </div>

</div>
