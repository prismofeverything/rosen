var rosen = function() {
    var canvas, context;
    var browser = {
        dim: function(width, height) {
            this.width = width;
            this.height = height;
        }
    };

    var circle = function(x, y, radius, color) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI*2, true);
        context.closePath();
        context.fill();
    };

    var init = function() {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        var resize = function(e) {
            browser.dim(window.innerWidth, window.innerHeight);
            canvas.width = browser.width * 0.9;
            canvas.height = browser.height * 0.9;
        };

        window.onresize = resize;
        resize();

        circle(500, 300, 50, "#ffcc33");
    };

    return {
        init: init
    };
}();