
const Palette = {
    color: 4,
    colors: [ '#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000' ],
    current: function() { return this.colors[this.color]; },
    getColor: function(i) { return this.colors[i]; }
}

const Canvas = {

    init: function() {
        this.canvas = document.getElementsByTagName('canvas')[0];
        this.resize();

        this.ctx = this.canvas.getContext('2d');
        this.scale = 16;
        this.width = 64;
        this.height = 64;

        Canvas.canvas.onclick = (ev) => Canvas.setTile(ev);

        this.load();
    },

    load: function() {
        let XHR = new XMLHttpRequest();
        XHR.open('GET', 'code/load_canvas.php', true);
        XHR.responseType = 'arraybuffer';

        XHR.onload = function(ev) {
            let arrayBuffer = XHR.response;
            let byteArray = new Uint8Array(arrayBuffer);
            Canvas.tiles = byteArray;
            Canvas.render(Canvas.ctx, -1, -1);
        }

        XHR.send();
    },

    update: function() {

    },

    render: function(ctx, x, y) {
        if (x < 0 && y < 0) {
            for (let i = 0; i < this.height; i++) for (let j = 0; j < this.width; j++) {
                ctx.fillStyle = Palette.getColor(this.getTile(j, i));
                ctx.fillRect( j * this.scale, i * this.scale, this.scale, this.scale );
            }
        }
    },

    setTile: function(ev) {
        let x = Math.floor(ev.x / this.scale);
        let y = Math.floor(ev.y / this.scale);

        this.sendTile(Palette.current(), x, y);

        this.ctx.fillStyle = Palette.current();
        this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
    },

    getTile: function(x, y) { return this.tiles[y * this.width + x]; },

    sendTile: function(color, x, y) {
        $.post('code/set_tile.php', `c=${Palette.color}&x=${x}&y=${y}`, (data) => console.log(`Sent tile at ${x}:${y} ${data}`));
    },

    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

window.onload = Canvas.init();
window.onresize = Canvas.resize();

$('button.color').on('click', function() { Palette.color = parseInt($(this).attr('value')); });