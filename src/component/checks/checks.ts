const isUserEvent = (message: any) => {
    let evt = JSON.parse(message.data);
    return evt.type === 'userevent';
}

const isCanvasEvent = (message: any) => {
    let evt = JSON.parse(message.data);
    return evt.type === 'canvasChange';
}

export {isUserEvent, isCanvasEvent}