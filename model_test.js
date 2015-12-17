var canvas = document.getElementsByTagName('canvas')[0],
    context = canvas.getContext('2d');

var unit_palette = GAME.Palette.get("ra2/cache/unittem.pal");

var model = new GAME.Model('normal', [
    //shadows
    new GAME.Layer({normal: [3]}, GAME.ColoredShape.get("ra2/generic/ggairc.shp", unit_palette)),
    new GAME.Layer({normal: [12]}, GAME.ColoredShape.get("ra2/generic/ggairc_b.shp", unit_palette)),
    new GAME.Layer({normal: [16]}, GAME.ColoredShape.get("ra2/generic/ggairc_c.shp", unit_palette)),
    new GAME.Layer({normal: [2]}, GAME.ColoredShape.get("ra2/generic/ggaircbb.shp", unit_palette)),

    //shape
    new GAME.Layer({normal: [0]}, GAME.ColoredShape.get("ra2/generic/ggairc.shp", unit_palette)),
    new GAME.Layer({normal: [0]}, GAME.ColoredShape.get("ra2/generic/ggaircbb.shp", unit_palette)),
    new GAME.Layer({normal: [0, 1, 2, 3]}, GAME.ColoredShape.get("ra2/generic/ggairc_a.shp", unit_palette)),
    new GAME.Layer({normal: [0, 1, 2, 3, 4, 5]}, GAME.ColoredShape.get("ra2/generic/ggairc_b.shp", unit_palette)),
    new GAME.Layer({normal: [0, 1, 2, 3, 4, 5, 6, 7]}, GAME.ColoredShape.get("ra2/generic/ggairc_c.shp", unit_palette))
]);

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
model.load().then(startDraw);
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