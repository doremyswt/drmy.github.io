import { queueProgram, clipboard, hardDrive } from '../../../store';
import { get } from 'svelte/store';
import { recycle_bin_id, protected_items, SortOptions, SortOrders } from '../../../system';
import * as fs from '../../../fs';

export let make = ({type, originator}) => {
    
    let sort_menu_items = [
        {name: 'None', value: SortOptions.NONE},
        {name: 'Name', value: SortOptions.NAME},
        {name: 'Size', value: SortOptions.SIZE},
        {name: 'Date Created', value: SortOptions.DATE_CREATED},
        {name: 'Date Modified', value: SortOptions.DATE_MODIFIED}
    ]
    let sort_order_menu_items = [
        {name: 'Ascending', value: SortOrders.ASCENDING},
        {name: 'Descending', value: SortOrders.DESCENDING}
    ]

    return {
        required_width: 180 + 20,
        required_height: 27*6  + 20,
        menu: [
            [
                // {
                //     name: 'Sort By',
                //     items: [
                //         ...sort_menu_items.map(item => {
                //             return {
                //                 ...item,
                //                 check: item.value == get(hardDrive)[originator.id].sort_option,
                //                 action: () => {
                //                     hardDrive.update(data => {
                //                         data[originator.id].sort_option = item.value;
                //                         return data;
                //                     })
                //                 }
                //             }
                //         }),
                //         null,
                //         ...sort_order_menu_items.map(item => {
                //             return {
                //                 ...item,
                //                 check: item.value == get(hardDrive)[originator.id].sort_order,
                //                 action: () => {
                //                     hardDrive.update(data => {
                //                         data[originator.id].sort_order = item.value;
                //                         return data;
                //                     })
                //                 }
                //             }
                //         }),
                //     ]
                // },
                {
                    name: 'Refresh',
                    action: () => {
                        console.log('refresh');
                        let nodes = document.querySelectorAll('.fs-item');
                        for(let node of nodes){
                            node.classList.add('animate-blink');
                        }
                        setTimeout(() => {
                            for(let node of nodes){
                                node.classList.remove('animate-blink');
                            }
                        }, 1000);
                    }
                }
            ],
            [
                {
                    name: 'Properties',
                    action: () => {
                        queueProgram.set({
                            name: 'Display Properties',
                            icon: 'DisplayProperties.png',
                            path: './programs/display_properties.svelte'
                        })
                    }
                }
            ]
        ]
    }
}