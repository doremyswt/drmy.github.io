import { queueProgram, clipboard, selectingItems, hardDrive, clipboard_op, wallpaper } from '../../../store';
import { recycle_bin_id, protected_items, supported_wallpaper_filetypes, doctypes, archive_exts } from '../../../system';
import * as utils from '../../../utils';
import { get } from 'svelte/store';
import * as fs from '../../../fs';
import FileSaver from 'file-saver';
export let make = ({type, originator}) => {
    //originator: a wrapped fs item, i.e, file, folder, drive
    // {item: item, open: fn(), my_computer_instance: obj})

    return {
        required_width: 180 + 20,
        required_height: 27*11 + 20,
        menu: [
            [
                ...originator.item.parent != recycle_bin_id ? [
                    {
                        name: 'Open',
                        action: () => {originator.open(originator.item.id);},
                        font: 'bold',
                    },
                    {
                        name: 'Explore',
                    },
                    {
                        name: 'Search...',
                        disabled: originator.type == 'file'
                    }
                ] : [],
                ...originator.item.parent != recycle_bin_id 
                && doctypes[originator.item.ext] != null
                && doctypes[originator.item.ext].length >= 2 ? [{
                    name: 'Open With',
                    items: doctypes[originator.item.ext].map(el => {
                        return {
                            name: el.name,
                            icon: el.icon,
                            action: () => queueProgram.set({
                                path: el.path,
                                fs_item: originator.item
                            })
                        }
                    })
                }] : [],
                ...supported_wallpaper_filetypes.includes(originator.item.ext) ? [
                    {
                        name: 'Set as Desktop Wallpaper',
                        action: () => {
                            wallpaper.set(originator.item.id);
                        }
                    }
                ] : []
            ],
            [
                ...archive_exts.includes(originator.item.ext) && originator.item.parent != recycle_bin_id ? [
                    {
                        name: 'Extract here...',
                        icon: '/images/xp/icons/RAR.png',
                        action: () => {
                            queueProgram.set({
                                path: './programs/winrar.svelte',
                                fs_item: originator.item
                            })
                        }
                    }
                ] : [],
                ...['file', 'folder'].includes(originator.item.type) && originator.item.parent != recycle_bin_id ? [
                    {
                        name: 'Add to archive...',
                        icon: '/images/xp/icons/RAR.png',
                        action: () => {
                            queueProgram.set({
                                path: './programs/zip.svelte',
                                fs_item: originator.item
                            })
                        }
                    }
                ] : []
            ],
            [
                ...originator.item.parent != recycle_bin_id ? [
                    {
                        name: 'Send To',
                        items: [
                            ...originator.item.type == 'file'
                            && originator.item.storage_type != 'fake' ? [{
                                name: 'Local Computer (Download)',
                                icon: '/images/xp/icons/CopyingConflict.png',
                                action: async () => {
                                    let file = await fs.get_file(originator.item.id);
                                    let download = new File([file], originator.item.name, {
                                        type: utils.ext_to_mime(originator.item.name)
                                    });
                                    FileSaver.saveAs(download);
                                }
                            }] : [],
                            {
                                name: 'Compressed (Zipped) Folder',
                                icon: '/images/xp/icons/Zipfolder.png',
                                action: () => {
                                    queueProgram.set({
                                        path: './programs/zip.svelte',
                                        fs_item: originator.item
                                    })
                                }
                            },
                            {
                                name: 'Desktop (create shortcut)',
                                icon: '/images/xp/icons/Desktop.png'
                            },
                            {
                                name: 'Mail Recipient',
                                icon: '/images/xp/icons/Email.png'
                            },
                            {
                                name: 'Floppy (A:)',
                                icon: '/images/xp/icons/FloppyDisk.png'
                            }
                        ]
                    }
                ] : []
            ],
            [
                {
                    name: 'Properties',
                    action: () => {
                        if(originator.item.type == 'drive' || originator.item.type == 'removable_storage'){
                            queueProgram.set({
                                path: './programs/disk_properties.svelte',
                                fs_item: originator.item
                            })
                        } else {
                            queueProgram.set({
                                path: './programs/properties.svelte',
                                fs_item: originator.item
                            })
                        }
                        
                    }
                }
            ]
        ]
    }
}


async function confirm_delete({node_ref, title, message, icon, yes_action, no_action}){
    const { mount } = await import('svelte');
    const Dialog = (await import('../Dialog.svelte')).default;
        let buttons = [
            {
                name: 'OK',
                action: () => {
                    yes_action();
                    dialog.destroy();
                },
                focus: true
            },
            {
                name: 'Cancel',
                action: () => {
                    no_action();
                    dialog.destroy();
                },
            }
        ]
        let dialog;
        dialog = mount(Dialog, {
            target: node_ref,
            props:{
                icon,
                title,
                message,
                buttons,
                get_self: () => dialog,
            }
        });
}