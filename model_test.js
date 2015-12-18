var canvas = document.getElementsByTagName('canvas')[0],
    context = canvas.getContext('2d');

var unit_palette = GAME.Palette.get("ra2/cache/unittem.pal");

var model = new GAME.Model([
    {states: {build: GAME.Range(0, 25)}, shape: new GAME.ColoredShape("ra2/isosnow/gaaircmk.shp", unit_palette)},

    {states: {normal: [0]}, shape: new GAME.ColoredShape("ra2/snow/gaairc.shp", unit_palette)},
    {states: {normal: [0]}, shape: new GAME.ColoredShape("ra2/snow/gaaircbb.shp", unit_palette)},
    {states: {normal: [0, 1, 2, 3]}, shape: new GAME.ColoredShape("ra2/snow/gaairc_a.shp", unit_palette)},
    {states: {normal: [0, 1, 2, 3, 4, 5]}, shape: new GAME.ColoredShape("ra2/snow/gaairc_b.shp", unit_palette)},
    {states: {normal: [0, 1, 2, 3, 4, 5, 6, 7]}, shape: new GAME.ColoredShape("ra2/snow/gaairc_c.shp", unit_palette)}
]);

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
model.load().then(function () {
    model.setState('build', function (done) {
        if (done)
            model.setState('normal');
    });
    startDraw();
});
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