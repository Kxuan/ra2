var canvas = document.getElementsByTagName('canvas')[0],
    context = canvas.getContext('2d');

var unit_palette = GAME.Palette.get("ra2/cache/unittem.pal");

var model = new GAME.BuildingModel([
    {
        states: {build: Range(0, 25)},
        shape: new GAME.ColoredShape("ra2/isosnow/gaaircmk.shp", unit_palette)
    },

    {
        states: {normal: [0], injure: [1], broken: [2]},
        shape: new GAME.ColoredShape("ra2/snow/gaairc.shp", unit_palette)
    },
    {
        states: {normal: [0], injure: [1], broken: [1]},
        shape: new GAME.ColoredShape("ra2/snow/gaaircbb.shp", unit_palette)
    },
    {
        states: {normal: Range(0, 4), injure: Range(4, 8), broken: Range(4, 8)},
        shape: new GAME.ColoredShape("ra2/snow/gaairc_a.shp", unit_palette)
    },
    {
        states: {normal: Range(0, 6), injure: Range(6, 12), broken: Range(6, 12)},
        shape: new GAME.ColoredShape("ra2/snow/gaairc_b.shp", unit_palette)
    },
    {
        states: {normal: Range(0, 8), injure: Range(8, 16), broken: Range(8, 16)},
        shape: new GAME.ColoredShape("ra2/snow/gaairc_c.shp", unit_palette)
    }
]);

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

var PLAY_STATES = ['normal', 'injure', 'broken'];

model.load().then(function () {
    model.setState('build', function (done) {
        if (done) {
            switchTo(0);
        }
    });
    startDraw();
});

function switchTo(si) {
    var i = 0;
    model.setState(PLAY_STATES[si], function (done) {
        if (done) {
            console.log(PLAY_STATES[si], i);
            i++;
            if (i > 5) {
                if (si + 1 >= PLAY_STATES.length) {
                    model.setState('destroy');
                } else {
                    switchTo(si + 1);
                }
            }
        }
    });
}

function drawModel() {
    context.save();
    context.translate((canvas.width - model.width) / 2, (canvas.height - model.height) / 2);
    model.draw(context);
    context.restore();
    model.step();
}
function startDraw() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawModel();

    setTimeout(startDraw, 100);
}