export let make = ({ originator }) => {
    return {
        required_width: 180 + 20,
        required_height: 27 * 1 + 20,
        menu: [
            [
                {
                    name: 'DOWNLOAD',
                    font: 'bold',
                    action: () => {
                        originator.download();
                    }
                }
            ]
        ]
    };
}
