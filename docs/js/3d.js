let lastMouseX = 0,
    lastMouseY = 0;
let rotX = 0,
    rotY = 0;

let isDown = false;

var height = Math.max( document.body.scrollHeight, document.body.offsetHeight,
    document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

document.getElementById("map").onmousedown = mouseDown;
document.getElementById("map").onmouseup = mouseUp;
document.getElementById("map").onmousemove = mouseMove;

function mouseDown(e) {
    isDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}
function mouseUp() {
    isDown = false;
}
function mouseMove(e) {
    if (isDown) {
        var deltaX = e.pageX - lastMouseX;
        var deltaY = e.pageY - lastMouseY;

        lastMouseX = e.pageX;
        lastMouseY = e.pageY;

        rotY -= deltaX * 0.1;
        rotX += deltaY * 0.1;
        document.height;
        document.getElementById("map").style.transform = "translateZ( -" +  height/2 + "px) rotateX( " + -rotX + "deg) rotateY(" + rotY + "deg)";
    }

}