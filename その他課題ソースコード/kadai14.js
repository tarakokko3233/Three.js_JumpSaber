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


    const planeGeometry = new THREE.PlaneGeometry(100,100);
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.position.set(0,-40,0);
    plane.rotateX(-Math.PI/2,0,0);

    scene.add(plane);

    // ジャンプ用変数
    let jumpSpeed = 0;
    const maxjumpspeed = 1;

    let jumpup = true;
    let rotate = false;
    let count = 0;

    // キーイベントの処理
    document.addEventListener("keydown", onDocumentKeyDown, false);
    function onDocumentKeyDown(event) {
        let keyCode = event.which;
        if (keyCode == 72) { // h
            rotate = !rotate;
            animate_rotate();// 頭部の回転
        }
        if (keyCode == 74 ) { // j
            animate_jump(); // ジャンプ開始
        }
        render();
    }

    // アニメーション処理

    function animate_rotate() {
            if (rotate){
                let requestId = requestAnimationFrame(animate_rotate);
                robot.children[0].rotateY(0.1);
                count+= 0.1;
                if(count>=2*Math.PI){
                    robot.children[0].rotation.y =0;
                    count = 0;
                    rotate= false;
                }
        }
            render();

    }


    function animate_jump() {
        if (jumpSpeed >= 0 && jumpSpeed < maxjumpspeed && jumpup) {
            robot.position.y += jumpSpeed;
            jumpSpeed += 0.03;
        }else if (jumpSpeed >= maxjumpspeed && jumpup){
            jumpup = false;
            robot.position.y += jumpSpeed;
            jumpSpeed -= 0.03;
        } else if (jumpSpeed <= maxjumpspeed && !jumpup) {
            robot.position.y += jumpSpeed;
            jumpSpeed -= 0.03;
        }
        if (robot.position.y <= 0 && !jumpup) {
            robot.position.y;
            jumpSpeed = 0;
            jumpup = true;
            return;
        }
        let requestId = requestAnimationFrame(animate_jump);
        render();

    }

let targetPosition = new THREE.Vector3();
let moving = false;

function animate_move_set(move_reach_x, move_reach_z) {
    targetPosition.set(move_reach_x, 0, move_reach_z); // 目的地の位置を設定
    moving = true;
    animate_move_robot();
}

function animate_move_robot() {
    if (!moving) {
    return;
    }

    const step = 0.5;
    const distance = robot.position.distanceTo(targetPosition);

    if (distance > step) {
        const direction = targetPosition.clone().sub(robot.position).normalize();
        robot.position.add(direction.multiplyScalar(step));
        let requestId = requestAnimationFrame(animate_move_robot);

    } else {
        robot.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        moving = false;
    }


    render();
}

    // マウスクリックイベントの処理
    window.addEventListener('click', function(event_m) {
        const raycaster = new THREE.Raycaster();
        const clickPos = new THREE.Vector2();
        // マウスクリック座標を取得

        clickPos.x = (event_m.clientX / width) * 2 - 1;
        clickPos.y = -(event_m.clientY / height) * 2 + 1;

        // マウスの位置からRayを飛ばす
        raycaster.setFromCamera(clickPos, camera);

        // Rayと交差したオブジェクトを取得（平面のみ）
        const intersects = raycaster.intersectObject(plane);

        if (intersects.length > 0) {
            // 最初に交差したオブジェクトの位置を取得
            const intersectPos = intersects[0].point;
            console.log(intersectPos);  // コンソールに座標を出力
        }else{
            console.log("no intersection");
        }

        const move_reach_x = intersects[0].point.x;
        const move_reach_z = intersects[0].point.z;
        animate_move_set(move_reach_x,move_reach_z);
    }, false);

    // 光源設定
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let render = function () { renderer.render(scene, camera); };
    render();

}
