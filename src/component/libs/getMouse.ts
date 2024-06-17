const getMouse = (e: any, canvas: any) => {
    let element = canvas
    let offsetX = 0
    let offsetY = 0
    let mx;
    let my;

    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while (( element = element.offsetParent));
    }

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    return {x: mx, y: my}
}

export default getMouse