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