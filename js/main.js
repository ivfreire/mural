
const Palette = {
    color: 4,
    colors: [],

    load: function() {
        let XHR = new XMLHttpRequest();
        XHR.open('GET', 'data/palette.txt', true);
        XHR.responseType = 'text';

        XHR.onload = function(ev) {
            let colors = XHR.responseText.split('\n');

            let c = 0;
            colors.forEach((color) => {
                $('div.colors').append(`<button class="color" value="${c}" style="background: #${color};" title="#${color}" onclick="Palette.selectColor(${c})"></button>`);
                Palette.colors.push(`#${color}`);
                c++;
            });
        }

        XHR.send();
    },

    selectColor: function(id) {
        Palette.color = id;
    },

    current: function() { return this.colors[this.color]; },
    getColor: function(i) { return this.colors[i]; }
}

const Canvas = {

    init: function() {
        this.canvas = document.getElementsByTagName('canvas')[0];
        this.resize();

        this.scroll = false;
        this.pos = { x: 0, y: 0 }
        this.pos2 = { x: 0, y: 0 }

        this.ctx = this.canvas.getContext('2d');
        this.scale = 16;
        this.width = 64;
        this.height = 64;

        this.camera = { x: 0, y: 0 }

        Canvas.canvas.onclick = (ev) => Canvas.setTile(ev);

        Palette.load();

        this.load();
        setInterval(this.update, 500);
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

    loadChunk: function(x, y, width, height) {
        let XHR = new XMLHttpRequest();
        XHR.open('POST', 'code/load_canvas.php', true);
        XHR.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        XHR.responseType = 'arraybuffer';

        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (width > Canvas.width) width = Canvas.width;
        if (height > Canvas.height) width = Canvas.height;
        if (x + width > Canvas.width) width = Canvas.width - x;
        if (y + height > Canvas.height) height = Canvas.height - y; 

        XHR.onload = function(ev) {
            let arrayBuffer = XHR.response;
            let byteArray = new Uint8Array(arrayBuffer);

            for (let i = 0; i < height; i++)
                for (let j = 0; j < width; j++)
                    Canvas.tiles[ (y + i) * Canvas.width + x + j ] = byteArray[i * width + j];

            Canvas.render(Canvas.ctx, x, y);
        }

        XHR.send(`x=${x}&y=${y}&w=${width}&h=${height}`);
    },

    update: function() {
        Canvas.loadChunk(
            Math.floor(Canvas.camera.x / Canvas.scale),
            Math.floor(Canvas.camera.y / Canvas.scale),
            Math.ceil(Canvas.canvas.width / Canvas.scale),
            Math.ceil(Canvas.canvas.height / Canvas.scale)
        );
    },

    render: function(ctx, x, y) {
        if (x < 0 && y < 0) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < this.height; i++) for (let j = 0; j < this.width; j++) {
                ctx.fillStyle = Palette.getColor(this.getTile(j, i));
                ctx.fillRect(
                    j * this.scale - this.camera.x,
                    i * this.scale - this.camera.y,
                    this.scale, this.scale
                );
            }
            ctx.strokeStyle = "red";
            ctx.strokeRect(-1 - this.camera.x, -1 - this.camera.y, this.width * this.scale + 1, this.height * this.scale + 1);
        } else {
            for (let i = 0; i < Math.ceil(this.canvas.height / this.scale); i++) for (let j = 0; j < Math.ceil(this.canvas.width / this.scale); j++) {
                if (x + j < Canvas.width && y + i < Canvas.height) {
                    ctx.fillStyle = Palette.getColor(this.getTile(x + j, y + i));
                    ctx.fillRect(
                        (x + j) * this.scale - this.camera.x,
                        (y + i) * this.scale - this.camera.y,
                        this.scale, this.scale
                    );
                }
            }
        }
    },

    setTile: function(ev) {
        let x = Math.floor((ev.x + this.camera.x) / this.scale);
        let y = Math.floor((ev.y + this.camera.y) / this.scale);

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y * this.width + x] = Palette.color;
            this.sendTile(Palette.current(), x, y);

            this.ctx.fillStyle = Palette.current();
            this.ctx.fillRect(x * this.scale - this.camera.x, y * this.scale - this.camera.y, this.scale, this.scale);
        }
    },

    getTile: function(x, y) { return this.tiles[y * this.width + x]; },

    sendTile: function(color, x, y) {
        $.post('code/set_tile.php', `c=${Palette.color}&x=${x}&y=${y}`, (data) => console.log(`Sent tile at ${x}:${y} ${data}`));
    },

    mouseDown: function(ev) {
        this.pos.x = ev.x;
        this.pos.y = ev.y;
        this.pos2.x = this.camera.x;
        this.pos2.y = this.camera.y;
        this.scroll = true;
    },
    mouseUp: function(ev) {
        this.scroll = false;
    },
    mouseMove: function(ev) {
        if (this.scroll) {
            this.camera.x = this.pos2.x + this.pos.x - ev.x;
            this.camera.y = this.pos2.y + this.pos.y - ev.y;
            this.render(this.ctx, -1, -1);
        }
    },

    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

window.onload = Canvas.init();
window.onresize = Canvas.resize();
Canvas.canvas.onmousedown = (ev) => Canvas.mouseDown(ev);
Canvas.canvas.onmouseup = (ev) => Canvas.mouseUp(ev);
Canvas.canvas.onmousemove = (ev) => Canvas.mouseMove(ev);