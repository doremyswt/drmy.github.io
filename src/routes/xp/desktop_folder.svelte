<script>
    import { contextMenu, selectingItems, clipboard, hardDrive, clipboard_op, queueProgram } from '../../lib/store'
    import * as utils from '../../lib/utils';
    import { doctypes, icons, desktop_folder, previewable_exts } from '../../lib/system';
    const {click_outside, long_press, double_tap} = utils;
    import RecycleBin from '../../lib/components/xp/RecycleBin.svelte';
    import Previewable from '../../lib/components/xp/Previewable.svelte';
    

    let id = desktop_folder;
    
    $: items =  $hardDrive[id] == null ? 
        [] : 
        $hardDrive[id]
        .children
        .map(id => $hardDrive[id])
        .filter(el => el != null);

    let is_focus = true;
    let item_long_pressed = false;
    let node_ref;
    let cell_size = 80;
    let _positions_assigned = false;

    $: if (items.length && node_ref && !_positions_assigned) {
        _positions_assigned = true;
        // defer so node_ref has dimensions
        setTimeout(assign_missing_positions, 100);
    }


    // Drag state: shared between rubber-band select and icon repositioning
    let _drag_start = null; // {x, y, on_item, item_el, item_fs_id, item_tx, item_ty}
    let _drag_moved = false;
    let rb_visible = false;
    let rb_left = 0, rb_top = 0, rb_width = 0, rb_height = 0;

    function parse_translate(str) {
        if (!str) return {x: 0, y: 0};
        let m = str.match(/translate(?:3d)?\(([^,]+)px,\s*([^,)]+)px/);
        return m ? {x: parseFloat(m[1]), y: parseFloat(m[2])} : {x: 0, y: 0};
    }

    function on_mousedown(e) {
        if (e.button !== 0) return;
        _drag_moved = false;
        let item_el = e.target.closest('.fs-item');
        if (item_el) {
            let t = parse_translate(item_el.style.transform);
            _drag_start = {x: e.clientX, y: e.clientY, on_item: true, item_el, item_fs_id: item_el.getAttribute('fs-id'), item_tx: t.x, item_ty: t.y};
        } else {
            _drag_start = {x: e.clientX, y: e.clientY, on_item: false};
        }
    }

    function on_mousemove(e) {
        if (!_drag_start) return;
        let dx = e.clientX - _drag_start.x, dy = e.clientY - _drag_start.y;
        if (!_drag_moved && dx*dx + dy*dy < 25) return;
        _drag_moved = true;
        if (_drag_start.on_item) {
            _drag_start.item_el.style.transform = `translate(${_drag_start.item_tx + dx}px, ${_drag_start.item_ty + dy}px)`;
        } else {
            rb_visible = true;
            let cr = node_ref.getBoundingClientRect();
            let [sx, sy, cx, cy] = [_drag_start.x, _drag_start.y, e.clientX, e.clientY];
            let rbc = {left: Math.min(sx,cx), right: Math.max(sx,cx), top: Math.min(sy,cy), bottom: Math.max(sy,cy)};
            rb_left = rbc.left - cr.left; rb_top = rbc.top - cr.top;
            rb_width = rbc.right - rbc.left; rb_height = rbc.bottom - rbc.top;
            let sel = [];
            for (let el of node_ref.querySelectorAll('.fs-item')) {
                let r = el.getBoundingClientRect();
                if (r.left < rbc.right && r.right > rbc.left && r.top < rbc.bottom && r.bottom > rbc.top) {
                    let fid = el.getAttribute('fs-id');
                    if ($hardDrive[fid] != null) sel.push(fid);
                }
            }
            $selectingItems = sel;
        }
    }

    function snap_to_grid(px) { return Math.round(px / cell_size) * cell_size; }

    // Returns a map of "snapped_x,snapped_y" -> fid for all items except the excluded one.
    function get_occupied_slots(exclude_fid) {
        let slots = new Map();
        for (let item of items) {
            if (item.id === exclude_fid) continue;
            if (!item.desktop_css_transform) continue;
            let t = parse_translate(item.desktop_css_transform);
            let sx = snap_to_grid(t.x), sy = snap_to_grid(t.y);
            slots.set(`${sx},${sy}`, item.id);
        }
        return slots;
    }

    // Find the next free grid slot scanning column-first (top-to-bottom, left-to-right)
    function next_free_slot(occupied) {
        const maxCols = Math.max(1, Math.floor((node_ref?.offsetWidth || 800) / cell_size));
        for (let col = 0; col < maxCols; col++) {
            for (let row = 0; row < 20; row++) {
                let x = col * cell_size, y = row * cell_size;
                if (!occupied.has(`${x},${y}`)) return {x, y};
            }
        }
        return {x: 0, y: 0};
    }

    // Assign grid positions to all items, respecting already-valid ones
    function assign_missing_positions() {
        const maxX = Math.max(0, (node_ref?.offsetWidth  || 800) - cell_size);
        const maxY = Math.max(0, (node_ref?.offsetHeight || 600) - cell_size);

        let occupied = new Map();
        // First pass: collect items that have a valid, in-bounds, snapped position
        let valid_items = new Set();
        for (let item of items) {
            if (item.desktop_css_transform) {
                let t = parse_translate(item.desktop_css_transform);
                let sx = snap_to_grid(t.x), sy = snap_to_grid(t.y);
                // must be in bounds and on-grid
                if (sx >= 0 && sy >= 0 && sx <= maxX && sy <= maxY && !occupied.has(`${sx},${sy}`)) {
                    occupied.set(`${sx},${sy}`, item.id);
                    valid_items.add(item.id);
                }
            }
        }
        // Second pass: assign positions to items without a valid position
        hardDrive.update(drive => {
            for (let item of items) {
                if (!valid_items.has(item.id)) {
                    let {x, y} = next_free_slot(occupied);
                    let tx = `translate(${x}px, ${y}px)`;
                    drive[item.id].desktop_css_transform = tx;
                    occupied.set(`${x},${y}`, item.id);
                }
            }
            return drive;
        });
    }

    function on_mouseup() {
        if (!_drag_start) return;
        if (_drag_start.on_item && _drag_moved) {
            let fid = _drag_start.item_fs_id;
            if ($hardDrive[fid] != null) {
                let t = parse_translate(_drag_start.item_el.style.transform);
                let sx = snap_to_grid(t.x);
                let sy = snap_to_grid(t.y);
                // clamp to desktop bounds
                const maxX = Math.max(0, (node_ref?.offsetWidth  || 800) - cell_size);
                const maxY = Math.max(0, (node_ref?.offsetHeight || 600) - cell_size);
                sx = Math.max(0, Math.min(maxX, sx));
                sy = Math.max(0, Math.min(maxY, sy));
                let occupied = get_occupied_slots(fid);
                // find nearest free slot
                outer: for (let r = 0; r <= 30; r++) {
                    for (let dy = -r; dy <= r; dy++) {
                        for (let dx = -r; dx <= r; dx++) {
                            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                            let cx = sx + dx * cell_size;
                            let cy = sy + dy * cell_size;
                            if (cx < 0 || cy < 0 || cx > maxX || cy > maxY) continue;
                            if (!occupied.has(`${cx},${cy}`)) { sx = cx; sy = cy; break outer; }
                        }
                    }
                }
                let tx = `translate(${sx}px, ${sy}px)`;
                _drag_start.item_el.style.transform = tx;
                hardDrive.update(drive => {
                    if (drive[fid]) drive[fid].desktop_css_transform = tx;
                    return drive;
                });
            }
        }
        rb_visible = false;
        _drag_start = null;
    }


    function on_rightclick(ev, item){
        let selected = $selectingItems.includes(item.id);
        if (!selected) {
            if(ev.metaKey || ev.ctrlKey){
                $selectingItems = [...$selectingItems, item.id];
            } else {
                $selectingItems = [item.id];
            }
        }

        contextMenu.set(null);

        let originator = {item};
        originator.open = (id) => {open(id)};
        originator.rename = () => { rename()}

        contextMenu.set({x: ev.x, y: ev.y, type: 'FSItem', originator: originator});
    }

    

    function show_void_menu(ev){
        let originator= {id};
        contextMenu.set({x: ev.x, y: ev.y, type: 'Desktop', originator});
    }

    function clear_selection(){
        $selectingItems = [];
    }


    let _last_open = 0;
    function open(id){
        // debounce: double_tap and dblclick may both fire on mobile
        const now = Date.now();
        if (now - _last_open < 400) return;
        _last_open = now;

        is_focus = false;
        clear_selection();
        let fs_item = $hardDrive[id];
        if(fs_item.type == 'file'){
            if(fs_item.executable){
                queueProgram.set({
                    path: fs_item.url,
                    webapp: fs_item.webapp,
                    ie_url: fs_item.ie_url || null,
                    ie_title: fs_item.display_name || fs_item.basename || null,
                    ie_icon: fs_item.icon || null,
                    window_options: fs_item.window_options || null
                })
            } else if(doctypes[fs_item.ext] != null){
                queueProgram.set({
                    path: doctypes[fs_item.ext][0].path,
                    fs_item: fs_item
                })
            } else {
                queueProgram.set({
                    path: './programs/notepad.svelte',
                    fs_item: fs_item
                })
            }
        } else {
            queueProgram.set({
                    path: './programs/my_computer.svelte',
                    fs_item: fs_item
                })
        }
        
    }

    function on_keydown(e){
        if(!is_focus) return;
        if(id == null) return;
        if(!(e.ctrlKey || e.metaKey)) return;
        if(e.key == 'a'){
            $selectingItems = items.map(el => el.id);
        }
    }

    function file_icon(item){
        if(item.icon != null){
            return `url(${item.icon})`
        }
        if(icons[item.ext] != null){ 
            return `url(/images/xp/icons/${icons[item.ext]})`
        }
        return null;
    }

</script>


<div class="absolute z-0 inset-0 overflow-hidden bg-transparent"
    on:drop={on_drop} on:dragover={on_drop_over}
    on:mousedown={on_mousedown}
    on:click={(e) => { is_focus = true; if (!e.target.closest('.fs-item') && !_drag_moved) { $selectingItems = []; } }}
    use:click_outside on:click_outside={() => {
        is_focus = false;
    }}
    on:contextmenu|self={show_void_menu}
    use:long_press on:long_press|self={(e) => { if (!item_long_pressed) show_void_menu({x: e.detail.x, y: e.detail.y}); }}
    bind:this={node_ref}>

    <div class="absolute inset-0"
        class:hidden={id == null}>
        {#each items as item, index (item.id)}

            <div fs-id="{item.id}" class="absolute left-0 top-0 fs-item overflow-hidden inline-flex flex-col items-center font-MSSS"
                on:dblclick={() => open(item.id)} on:contextmenu={(e) => on_rightclick(e, item)}
                on:click={(e) => { if (_drag_moved) return; let fs_id = e.currentTarget.getAttribute('fs-id'); if (e.ctrlKey || e.metaKey) { $selectingItems = $selectingItems.includes(fs_id) ? $selectingItems.filter(id => id !== fs_id) : [...$selectingItems, fs_id]; } else { $selectingItems = [fs_id]; } }}
                use:long_press on:long_press={(e) => { item_long_pressed = true; setTimeout(() => item_long_pressed = false, 100); on_rightclick({x: e.detail.x, y: e.detail.y}, item); }}
                use:double_tap on:double_tap={() => open(item.id)}
                style:transform="{item.desktop_css_transform}"
                style:width="{cell_size}px"
                style:height="{cell_size}px"
                style:touch-action="manipulation">
                {#if previewable_exts.includes(item.ext)}
                    <Previewable size={40} default_icon={file_icon(item)} fs_id={item.id}></Previewable>
                {:else}
                    <div class="w-[40px] h-[40px] shrink-0 bg-contain bg-no-repeat bg-center
                        {$clipboard.includes(item.id) && $clipboard_op == 'cut' ? 'opacity-70' : ''}
                        {item.type == 'folder' ? 'bg-[url(/images/xp/icons/FolderClosed.png)]' : 'bg-[url(/images/xp/icons/Default.png)]'} "
                        style:background-image="{file_icon(item)}">
                    </div>
                {/if}
                <p class="px-1 mx-0.5 text-[11px] break-words line-clamp-2 text-ellipsis leading-tight text-center text-white
                    {$selectingItems?.includes(item.id) && is_focus ? 'bg-blue-600 text-slate-50' : ''}"
                    style="text-shadow: 1px 1px 2px black;">
                    {item.display_name || (item.executable ? item.basename : item.name)}
                </p>
                
            </div>

        {/each}
        
    </div>

    <RecycleBin style="width: {cell_size}px;height: {cell_size}px;"></RecycleBin>

    {#if rb_visible}
        <div class="absolute pointer-events-none border border-blue-500 bg-blue-500/20"
            style:left="{rb_left}px" style:top="{rb_top}px" style:width="{rb_width}px" style:height="{rb_height}px">
        </div>
    {/if}

</div>

<svelte:options accessors={true}></svelte:options>
<svelte:window on:keydown={on_keydown} on:mousemove={on_mousemove} on:mouseup={on_mouseup}></svelte:window>