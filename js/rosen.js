// var rosen = function() {
//     var canvas, context;
//     var browser = {
//         dim: function(width, height) {
//             this.width = width;
//             this.height = height;
//         }
//     };

//     var circle = function(x, y, radius, color) {
//         context.fillStyle = color;
//         context.beginPath();
//         context.arc(x, y, radius, 0, Math.PI*2, true);
//         context.closePath();
//         context.fill();
//     };

//     var init = function() {
//         canvas = document.getElementById('canvas');
//         context = canvas.getContext('2d');

//         var resize = function(e) {
//             browser.dim(window.innerWidth, window.innerHeight);
//             canvas.width = browser.width * 0.9;
//             canvas.height = browser.height * 0.9;
//         };

//         window.onresize = resize;
//         resize();

//         circle(500, 300, 50, "#ffcc33");
//     };

//     return {
//         init: init
//     };
// }();


var rosen = function() {
    var container;
    var camera, scene, renderer;
    var uniforms, material, mesh;
    var mouseX = 0, mouseY = 0;

    var init = function() {
        initGL();
        animate();
    };

    function initGL() {
        container = document.getElementById('rosen');
        camera = new THREE.Camera();
        camera.position.z = 1;
        scene = new THREE.Scene();

        uniforms = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
            mouse: { type: 'v2', value: new THREE.Vector2() }
        };

        material = new THREE.MeshShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('vertex').textContent,
            fragmentShader: document.getElementById('fragment').textContent
        });

        mesh = new THREE.Mesh(new THREE.Plane(2, 2), material);
        scene.addObject(mesh);

        renderer = new THREE.WebGLRenderer();
        container.appendChild(renderer.domElement);

        onWindowResize();
        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('mousemove', onMouseMove, false);
    }

    function onWindowResize(event) {
        uniforms.resolution.value.x = window.innerWidth;
        uniforms.resolution.value.y = window.innerHeight;
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(event) {
        uniforms.mouse.value.x = event.clientX;
        uniforms.mouse.value.y = event.clientY;
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        uniforms.time.value += 0.05;
        renderer.render(scene, camera);
    }

    return {
        init: init
    };
}();