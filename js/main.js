const Canvas = {
    init: function() {
        this.canvas = document.getElementsByTagName('canvas')[0];
        this.resize();
    },
    resize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
}

window.onload = Canvas.init;
window.onresize = Canvas.resize;