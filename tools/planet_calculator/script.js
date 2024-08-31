function draw_circle(x,y,radius,color){
    var canvas = document.getElementById("hzCanvas");
    var context = canvas.getContext("2d");
    context.beginPath();
    context.lineWidth = 1;//線の太さを変える
    context.arc(x, y, radius, 0, Math.PI*2, false);
    context.strokeStyle = color;
    context.stroke();
    context.closePath();
}
draw_circle(0,0,240,"#00cccc");