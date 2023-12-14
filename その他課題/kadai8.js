/* sample6.js */
window.addEventListener("DOMContentLoaded", init);

function init() {
    const width = 500;
    const height = 500;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas")
    });
    renderer.setSize(width, height); /* ウィンドウサイズの設定 */
    renderer.setClearColor(0x000000); /* 背景色の設定 */

    renderer.shadowMap.enabled = true;

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(30, width / height, 1.0, 1500);
    camera.position.set(0, 20, -40);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // 平面を作成
    const boxGeometry = new THREE.BoxGeometry(10,10,10);
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    scene.add(box);

    const planeGeometry = new THREE.PlaneGeometry(50,50);
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.position.set(0,-5,0);
    plane.rotateX(-Math.PI/2,0,0);

    scene.add(plane);

    // 平行光源を作成

    //環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    // 白色のスポットライト1
    let spotLight_1 = new THREE.SpotLight(0xffffff, 0, 100, 30, 0, 2);
    spotLight_1.position.set(10, 20, 30);
    scene.add(spotLight_1);

    // 白色のスポットライト2
    let spotLight_2 = new THREE.SpotLight(0xffffff, 0, 100, 30, 0, 2);
    spotLight_2.position.set(-10, 20, 30);
    scene.add(spotLight_2);


    document.addEventListener("keydown", onDocumentKeyDown, false);
    function onDocumentKeyDown(event) {
        let keyCode = event.which;
        // r: Y軸周りに回転
        if (keyCode == 82) {
            box.rotateY(Math.PI / 6);
        }
        // c: 物体色を変更
        if(keyCode == 67){
            switch (box.material.color.getHex()) {
                case 0xffffff: //白を赤に変更
                    box.material.color.set(0xff0000);
                    break;
                case 0xff0000:  //赤を緑に変更
                    box.material.color.set(0x00ff00);
                    break;
                case 0x00ff00:  //緑を青に変更
                    box.material.color.set(0x0000ff);
                    break;
                case 0x0000ff:  //青を白に変更
                    box.material.color.set(0xffffff);
                    break;
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    // 初回実行
    let render = function () { renderer.render(scene, camera); };
    animate();
    render();
}
