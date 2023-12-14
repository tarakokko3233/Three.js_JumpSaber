window.addEventListener("DOMContentLoaded", init);

function init() {
    const width = 500;
    const height = 500;
    let flag_rotation = 0;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas")
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(30, width / height, 1.0, 1500);
    camera.position.set(0, 20, -40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // 立方体（ボックス）を作成
    const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000ff
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // 平面を作成
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -5, 0);
    plane.rotateX(-Math.PI / 2, 0, 0);
    scene.add(plane);

    // 平行光源を作成
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // マウスイベントの処理
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    function onDocumentMouseDown(event) {
        if (event.button == 0) { // 左クリック: 回転開始
            flag_rotation = 1;
            animate();
        } else if (event.button == 2) { // 右クリック: 回転停止
            flag_rotation = 0;
            box.rotation.y = 0;
            animate();
        }
    }

    // アニメーション処理
    function animate() {
        if (flag_rotation == 1) {
            requestAnimationFrame(animate);
            box.rotation.y += 0.1;
        }
        render();
    }

    // レンダリング処理
    function render() {
        renderer.render(scene, camera);
    }

    render();
}
