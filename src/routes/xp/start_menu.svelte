<script>
    import { mount } from 'svelte';
    import {hardDrive, queueProgram } from '../../lib/store';
    import * as utils from '../../lib/utils';
    const { click_outside } = utils;

    let col_1 = [
        {
            name: 'Internet Explorer',
            icon: '/images/xp/icons/InternetExplorer6.png',
            path: './programs/internet_explorer.svelte',
            font: 'bold'
        },
        {
            name: 'Paint',
            icon: '/images/xp/icons/Paint.png',
            path: './programs/paint.svelte',
        },
    ]

    let col_2 = [
        {
            name: 'My Computer',
            icon: '/images/xp/icons/MyComputer.png',
            path: './programs/my_computer.svelte',
            font: 'bold'
        },
        null,
        {
            name: 'Control Panel',
            icon: '/images/xp/icons/ControlPanel.png',
            path: './programs/my_computer.svelte'
        },
        {
            name: 'Display Properties',
            icon: '/images/xp/icons/DisplayProperties.png',
            path: './programs/display_properties.svelte',
        },
    ]

    let programs = [
        {
            name: 'Games',
            top: '-300px',
            icon: '/images/xp/icons/StartMenuPrograms.png',
            items: [{"name":"Adventure Miner","icon":"/images/xp/icons/AdventureMiner.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/adventure-miner","name":"Adventure Miner","icon":"/images/xp/icons/AdventureMiner.png"}},{"name":"Age of War","icon":"/images/xp/icons/AgeOfWar.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/age-of-war","name":"Age of War","icon":"/images/xp/icons/AgeOfWar.png"}},{"name":"Army Warfare","icon":"/images/xp/icons/ArmyWarfare.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/army-warfare","name":"Army Warfare","icon":"/images/xp/icons/ArmyWarfare.png"}},{"name":"Big Farm","icon":"/images/xp/icons/BigFarm.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/goodgame-big-farm","name":"Big Farm","icon":"/images/xp/icons/BigFarm.png"}},{"name":"Bubble Pop","icon":"/images/xp/icons/BubblePop.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/bubble-pop-classic","name":"Bubble Pop","icon":"/images/xp/icons/BubblePop.png"}},{"name":"Cursed Treasure","icon":"/images/xp/icons/CursedTreasure.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/cursed-treasure-2","name":"Cursed Treasure","icon":"/images/xp/icons/CursedTreasure.png"}},{"name":"Day D Tower Rush","icon":"/images/xp/icons/DayD.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/day-d-tower-rush","name":"Day D Tower Rush","icon":"/images/xp/icons/DayD.png"}},{"name":"DualForce Idle","icon":"/images/xp/icons/DualForceIdle.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/dualforce-idle","name":"DualForce Idle","icon":"/images/xp/icons/DualForceIdle.png"}},{"name":"Empire","icon":"/images/xp/icons/Empire.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/goodgame-empire","name":"Empire","icon":"/images/xp/icons/Empire.png"}},{"name":"Grand Prix","icon":"/images/xp/icons/GrandPrix.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/crazy-grand-prix","name":"Grand Prix","icon":"/images/xp/icons/GrandPrix.png"}},{"name":"Highway Racer","icon":"/images/xp/icons/HighwayRacer.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/highway-racer","name":"Highway Racer","icon":"/images/xp/icons/HighwayRacer.png"}},{"name":"Infiltrating the Airship","icon":"/images/xp/icons/Infiltrate.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/infiltrating-the-airship","name":"Infiltrating the Airship","icon":"/images/xp/icons/Infiltrate.png"}},{"name":"MineCraft","icon":"/images/xp/icons/MineCraft.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/mine-craft-io","name":"MineCraft","icon":"/images/xp/icons/MineCraft.png"}},{"name":"Minesweeper","icon":"/images/xp/icons/Minesweeper.png","path":"./programs/minesweeper.svelte","size":7860},{"name":"Santa Parkour","icon":"/images/xp/icons/SantaParkour.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/santa-parkour","name":"Santa Parkour","icon":"/images/xp/icons/SantaParkour.png"}},{"name":"Skydom","icon":"/images/xp/icons/Skydom.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/skydom","name":"Skydom","icon":"/images/xp/icons/Skydom.png"}},{"name":"Solitaire","icon":"/images/xp/icons/Solitaire.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/solitaire-frvr","name":"Solitaire","icon":"/images/xp/icons/Solitaire.png"}},{"name":"Space Battle","icon":"/images/xp/icons/SpaceBattle.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/space-battle","name":"Space Battle","icon":"/images/xp/icons/SpaceBattle.png"}},{"name":"StickWar","icon":"/images/xp/icons/StickWar.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/stick-war","name":"StickWar","icon":"/images/xp/icons/StickWar.png"}},{"name":"Teacher Simulator","icon":"/images/xp/icons/TeacherSimulator.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/teacher-simulator","name":"Teacher Simulator","icon":"/images/xp/icons/TeacherSimulator.png"}},{"name":"Train Master","icon":"/images/xp/icons/TrainMaster.png","path":"./programs/webapp.svelte","webapp":{"background":"#111827","url":"https://www.crazygames.com/embed/train-master","name":"Train Master","icon":"/images/xp/icons/TrainMaster.png"}}]
        },
    ]

    let programs_open = false;
    let ap_open = false;   // All Programs desktop flyout visible
    let open_l2 = null;   // name of open level-2 item (e.g. "Accessories")
    let open_l3 = null;   // name of open level-3 item (e.g. "System Tools")
    let l2_timer = null;
    let l3_timer = null;

    function hide(){
        let el = document.querySelector('#start-menu');
        if(!el.classList.contains('hidden')){
            el.classList.add('hidden');
        }
        programs_open = false;
        ap_open = false;
        open_l2 = null;
        open_l3 = null;
        clearTimeout(l2_timer);
        clearTimeout(l3_timer);
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
        let panel;
        panel = mount(ShutDownPanel, {
            target: document.querySelector('#desktop'),
            props: { get_self: () => panel }
        });
        hide();
    }

</script>

<div id="start-menu" class="absolute left-0 w-[390px] max-w-full z-20 flex flex-col shadow-lg rounded-t-md hidden"
    style="bottom: 100%; background-color: rgb(66, 130, 214);"
    use:click_outside on:click_outside={hide}>
    <div class="h-[3px] absolute top-0 left-[3px] right-[3px]" style="background: linear-gradient(to right, transparent 0px, rgba(255, 255, 255, 0.3) 1%, rgba(255, 255, 255, 0.5) 2%, rgba(255, 255, 255, 0.5) 95%, rgba(255, 255, 255, 0.3) 98%, rgba(255, 255, 255, 0.2) 99%, transparent 100%);
    box-shadow: rgb(14 96 203) 0px -1px 1px inset;"></div>

    <div class="w-full h-[70px] rounded-t-md shrink-0"
        style:background-image="linear-gradient(rgb(24, 104, 206) 0%, rgb(14, 96, 203) 12%, rgb(14, 96, 203) 20%, rgb(17, 100, 207) 32%, rgb(22, 103, 207) 33%, rgb(27, 108, 211) 47%, rgb(30, 112, 217) 54%, rgb(36, 118, 220) 60%, rgb(41, 122, 224) 65%, rgb(52, 130, 227) 77%, rgb(55, 134, 229) 79%, rgb(66, 142, 233) 90%, rgb(71, 145, 235) 100%)">
    </div>

    <div class="shrink-0 h-[2px] w-full" style:background-image="linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(218, 136, 74) 50%, rgba(0, 0, 0, 0) 100%)">
    </div>

    <div class="bg-slate-50 mx-0.5 relative flex flex-row">

        <!-- ── Left column ── -->
        <div class="w-1/2 flex flex-col shrink-0 px-1">
            {#each col_1 as item}
                {#if item == null}
                    <div class="my-0.5 mx-auto w-5/6 h-[2px] bg-slate-200 shrink-0"></div>
                {:else}
                    <div class="flex flex-row items-center shrink-0 p-1 group/c1 hover:bg-blue-500"
                        on:mouseenter={() => { ap_open = false; open_l2 = null; open_l3 = null; }}
                        on:click={() => launch(item)}>
                        <div class="w-8 h-8 bg-contain mr-1" style:background-image="url({item.icon})"></div>
                        <div class="text-[11px] group-hover/c1:text-white text-black {item.font == 'bold' ? 'font-bold' : ''}">{item.name}</div>
                    </div>
                {/if}
            {/each}
        </div>

        <!-- ── Right column ── -->
        <div class="w-1/2 flex flex-col shrink-0 px-1 bg-blue-200">
            {#each col_2 as item}
                {#if item == null}
                    <div class="my-0.5 mx-auto w-5/6 h-[1px] bg-blue-100 shrink-0"></div>
                {:else}
                    <div class="flex flex-row items-center shrink-0 p-1 group/c2 hover:bg-blue-500" on:click={() => launch(item)}>
                        <div class="w-7 h-7 bg-contain mr-1" style:background-image="url({item.icon})"></div>
                        <div class="text-[11px] group-hover/c2:text-white text-slate-800 {item.font == 'bold' ? 'font-bold' : ''}">{item.name}</div>
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