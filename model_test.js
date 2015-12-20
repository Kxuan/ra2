var canvas = document.getElementsByTagName('canvas')[0],
    context = canvas.getContext('2d');

var unit_palette = GAME.Palette("ra2/cache/unittem.pal");

var model = Ra2BuildingModel(
    {
        palette: unit_palette,
        build: {type: 1, shape: "ra2/isosnow/gaaircmk.shp"},
        normal: [
            {type: 3, shape: "ra2/snow/gaairc.shp"},
            {type: 2, shape: "ra2/snow/gaaircbb.shp"},
            {type: 2, shape: "ra2/snow/gaairc_a.shp"},
            {type: 2, shape: "ra2/snow/gaairc_b.shp"},
            {type: 2, shape: "ra2/snow/gaairc_c.shp"}
        ]
    });

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
            if (i > 3) {
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
}
function gameTick() {
    model.step();
}

function startDraw() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawModel();
    requestAnimationFrame(startDraw);
}
setInterval(gameTick, 50);
