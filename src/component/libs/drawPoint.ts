const drawPoints = (ctx: any, points: any) => {
    // draw a basic circle instead
    if (points.length < 6) {
        const b = points[0];
        ctx.beginPath() 
        ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0)
        ctx.closePath()
        ctx.fill();
        return
    }
    ctx.beginPath() 
    ctx.moveTo(points[0].x, points[0].y);
    let i;
    // draw a bunch of quadratics, using the average of two points as the control point
    for (i = 1; i < points.length - 2; i++) {
        const c = (points[i].x + points[i + 1].x) / 2
        const d = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
    }
    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
    ctx.stroke();
}

export default drawPoints