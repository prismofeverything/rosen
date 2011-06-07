var yellow = function() {
    var canvas, context;
    var browser = {
        dim: function(width, height) {
            this.width = width;
            this.height = height; } };

    var circle = function(x, y, radius, color) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI*2, true);
        context.closePath();
        context.fill(); };

    function drawtree(tree, depth, level, x, y, color) {
        var radius = 50.0 / level;
        circle(x, y, radius, color);
        for (var oo = 0; oo < tree.outlets.length; oo++) {
            if (!tree.outlets[oo].empty) {
                var newx = x + ((Math.round(-tree.outlets.length * 0.5) + (oo * 2)) * (Math.exp(-level/3.0)) * 200);
                var newy = y + (radius * 2.5);

                context.strokeStyle = color;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(newx, newy);
                context.closePath();
                context.stroke();

                drawtree(tree.outlets[oo], depth, level+1, newx, newy, color); } } }

    var diagram = meta.diagram({depth: 11});

    var init = function() {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        var resize = function(e) {
            browser.dim(window.innerWidth, window.innerHeight);
            canvas.width = browser.width * 0.95;
            canvas.height = browser.height * 0.95; };

        window.onresize = resize;
        resize();

        setInterval(function() {
            context.clearRect(0, 0, browser.width, browser.height);
            diagram.clean();
            diagram.cycle();
            diagram.purge();
            drawtree(diagram.metabolism.root, diagram.metabolism.depth(), 1, 0.2 * browser.width, 0.2 * browser.height, "#5555bb");
            drawtree(diagram.behavior.root, diagram.behavior.depth(), 1, 0.45 * browser.width, 0.3 * browser.height, "#88ee55");
            drawtree(diagram.repair.root, diagram.repair.depth(), 1, 0.7 * browser.width, 0.1 * browser.height, "#ccaa55");
        }, 50);

        circle(500, 300, 50, "#ffcc33"); };

    return {
        circle: circle,
        diagram: diagram,
        drawtree: drawtree,
        init: init }; }();


