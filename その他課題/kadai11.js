window.addEventListener("DOMContentLoaded", init);

function init() {
    const width = 500;
    const height = 500;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas")
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // マテリアルの定義
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const highlight = new THREE.MeshStandardMaterial({ color: 0x4444ff });

    // ロボットの作成
    const robot = new THREE.Group();

    // 頭部グループの作成
    const headGroup = new THREE.Group();

    // 頭部
    const head = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), bodyMat);
    headGroup.add(head);

    // 目を作成
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), highlight);
    eye1.position.set(5, 3, 5); // 位置を調整
    headGroup.add(eye1);

    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), highlight);
    eye2.position.set(-5, 3, 5); // 位置を調整
    headGroup.add(eye2);

    // 口を作成
    const mouth = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1, 3), highlight);
    mouth.position.set(0, -3, 5); // 位置を調整
    mouth.rotation.set(Math.PI / 2, Math.PI, 0);
    headGroup.add(mouth);



    // 耳を作成
    const ear1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 16), bodyMat);
    ear1.position.set(10, 0, 0);
    ear1.rotation.z = Math.PI / 2;
    headGroup.add(ear1);

    const ear2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 16), bodyMat);
    ear2.position.set(-10, 0, 0);
    ear2.rotation.z = Math.PI / 2;
    headGroup.add(ear2);


    // ロボットに頭部グループを追加
    robot.add(headGroup);

    // 胴体
    const body = new THREE.Mesh(new THREE.BoxGeometry(15, 20, 10), new THREE.MeshStandardMaterial({color: 0x777777}));
    body.position.y = -15;
    robot.add(body);

    // 腕
    const armGeometry = new THREE.BoxGeometry(3, 12, 3);
    const armMaterial = new THREE.MeshStandardMaterial({color: 0x888888});

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-9, -10, 0);
    robot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(9, -10, 0);
    robot.add(rightArm);

    // 脚
    const legGeometry = new THREE.BoxGeometry(4, 15, 4);
    const legMaterial = new THREE.MeshStandardMaterial({color: 0x555555});

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-5, -30, 0);
    robot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(5, -30, 0);
    robot.add(rightLeg);
    scene.add(robot);


    // 光源設定
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let render = function () { renderer.render(scene, camera); };
    render();

}

