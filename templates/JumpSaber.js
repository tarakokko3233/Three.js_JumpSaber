document.addEventListener('DOMContentLoaded', function() {
    var startButton = document.getElementById('gameStartButton');
    if (startButton) {
        startButton.addEventListener('click', function() {
            init(); // ゲーム開始関数
            this.style.display = 'none'; // ボタンを隠す
        });
    }
});


let walkSpeed = 0.5;
let walkCycle = 0;
let init_x = 0;
let init_y = 0;
let cameraFollowRobot = false;
let originalCameraPosition = null;
let originalCameraLookAt = new THREE.Vector3(0, 0, 0);
let collision = false;
const maxObjects = 20; // 同時に画面上に存在する立方体の最大数を5に設定
let isCrouching = false;
let splitCubes = [];
let groundLevel = -40; // 地面の高さを設定
let clock = new THREE.Clock();
let rightHandGlobalPosition = new THREE.Vector3();
let leftHandGlobalPosition = new THREE.Vector3();
let pointsCount = 0;
let damageCount = 0;



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

    // 座標軸を表示
    var axes = new THREE.AxesHelper(25);
    scene.add(axes);

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(60, 60, 150);
    camera.lookAt(new THREE.Vector3(0, 30, 0));

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
    armGeometry.translate(0, -6, 0);
    const armMaterial = new THREE.MeshStandardMaterial({color: 0x888888});

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-9, -10, 0);
    robot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(9, -10, 0);
    robot.add(rightArm);

    // 脚
    const legGeometry = new THREE.BoxGeometry(4, 15, 4);
    legGeometry.translate(0, -7.5, 0);
    const legMaterial = new THREE.MeshStandardMaterial({color: 0x555555});

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-5, -20, 0);
    robot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(5, -20, 0);
    robot.add(rightLeg);
    scene.add(robot);

    //平面
    const planeGeometry = new THREE.PlaneGeometry(100,100);
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000
    });
    const plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.position.set(0,-40,0);
    plane.rotateX(-Math.PI/2,0,0);

    scene.add(plane);

    const plane2Geometry = new THREE.PlaneGeometry(500,500);
    const plane2Material = new THREE.MeshStandardMaterial({
        color: 0x0000ff
    });
    const plane2 = new THREE.Mesh(plane2Geometry,plane2Material);
    plane2.position.set(0,-41,0);
    plane2.rotateX(-Math.PI/2,0,0);

    scene.add(plane2);

    // 物体の初期化とアニメーション用の変数
    let objects = [];
    const maxObjects = 3;

    //背景

    const particleGeometry = new THREE.Geometry();
    for (let i = 0; i < 1000; i++) {
        const particle = new THREE.Vector3(
            Math.random() * 500 - 500,
            Math.random() * 500 - 500,
            Math.random() * 500 - 500
        );
        particleGeometry.vertices.push(particle);
    }
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 円柱の作成
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 50, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    scene.add(cylinder);  // シーンに直接追加

   // ジャンプ用変数
    let jumpSpeed = 0;
    let maxJumpSpeed = 1.5;
    let jump = false;
    let jumpUp = true;
    let rotate = false;

   // 移動用変数
    let targetPosition = new THREE.Vector3();
    let moving = false;

   //スニーク用変数
    let isCrouching = false;


   // キーイベントの処理
    document.addEventListener("keydown", onDocumentKeyDown, false);
    window.addEventListener('mousemove', onDocumentMouseMove, false);


    function onDocumentKeyDown(event) {
        let keyCode = event.which;
       if (keyCode == 72) { // 'H' キー
            rotate = !rotate;
        }
       if (keyCode == 32  && !jump) { // 'Space' キー
            jump = !jump;
            if (jump) {
                jumpSpeed = maxJumpSpeed;
                jumpUp = true;
            }
        }
        if (keyCode == 90) { // 'Z' キー
            walkSpeed *= 1.1;
            walkSpeed = Math.min(walkSpeed, 1); // 歩行速度を10%増加
            console.log("Increased speed to", walkSpeed);
        }
        if (keyCode == 88) { // 'X' キー
            walkSpeed *= 0.9;
            walkSpeed = Math.max(walkSpeed, 0.01); // 歩行速度を10%減少
            console.log("Decreased speed to", walkSpeed);
        }

        if (keyCode == 81) { // 'Q' キー
            cameraFollowRobot = !cameraFollowRobot;
            if (cameraFollowRobot) {
                // カメラの現在の位置と向きを保存
                originalCameraPosition = camera.position.clone();
                camera.lookAt(originalCameraLookAt);
                // カメラをロボットの目線の高さに設定
                camera.position.set(headGroup.position.x, headGroup.position.y, headGroup.position.z);
            } else {
                // カメラを元の位置に戻す
                camera.position.copy(originalCameraPosition);
                camera.lookAt(originalCameraLookAt);
            }
        }

            // カメラがロボットを追従していない場合のみ、ロボットの移動を許可
            if (keyCode == 87) { // 'W' キー
                if(robot.position.z > -50){
                robot.position.z -= walkSpeed*3;
                animateWalk();
                }
            }
            if (keyCode == 65) { // 'A' キー
                if(robot.position.x > -50){
                robot.position.x -= walkSpeed*3;
                animateWalk();
                }
            }
            if (keyCode == 83) { // 'S' キー
                if(robot.position.z < 50){
                robot.position.z += walkSpeed*3;
                animateWalk();
                }
            }
            if (keyCode == 68) { // 'D' キー
                if(robot.position.x < 50){
                robot.position.x += walkSpeed*3;
                animateWalk();
                }
            }
            if (keyCode == 16) { //'Shift'キー
                isCrouching = !isCrouching;
            }

            if (event.keyCode === 13) { // エンターキーの場合
                swingCylinder();
            }
    }



    function onDocumentMouseMove(event) {
        if (!cameraFollowRobot) {
       // マウスの位置からRayを飛ばす
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
           (event.clientX / width) * 2 - 1,
           -(event.clientY / height) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);

       // Rayと交差したオブジェクトを取得（平面のみ）
        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            const intersectPos = intersects[0].point;
            animateMoveSet(intersectPos.x, intersectPos.z);
        }
    }
    }

       // 立方体の生成間隔を管理する変数
        let lastSpawnTime = Date.now();
       let spawnInterval = 3000; // 立方体生成間隔を3秒に設定

         // アニメーション関数
    function animate() {
        requestAnimationFrame(animate);

        let currentTime = Date.now();
        if (currentTime - lastSpawnTime > spawnInterval) {
            if (objects.length < maxObjects) {
                const newObject = createRandomObject();
                scene.add(newObject);
                objects.push(newObject);
            }

            lastSpawnTime = currentTime;
            spawnInterval = Math.random() * 4000 + 2000; // 2秒から6秒の間のランダムな間隔
        }

        // rightHandGlobalPosition の更新
        rightArm.getWorldPosition(rightHandGlobalPosition);
        // leftHandGlobalPosition の更新
        leftArm.getWorldPosition(leftHandGlobalPosition);

        // 経過時間を取得
        const deltaTime = clock.getDelta();

        // 他のアニメーション関数を呼び出し
        animateObjects();
        updateCylinderPosition();
        checkCollisions();
        animateSplitCubes()
        updateCylinderRotation(deltaTime);
        if (rotate) animateRotate();
        if (moving) animateMoveRobot();
        if (jump) animateJump();
        if (cameraFollowRobot) animatecamera();
        if (isCrouching){
            animateCrouch();
        }else{
            body.position.y = -15; // しゃがむ高さを調整
            headGroup.position.y = 0; // 頭部もしゃがむ高さに合わせて調整
            camera.position.y = 0;
            maxJumpSpeed = 1.5;

        }

        renderer.render(scene, camera);
}

function updateCylinderPosition() {
    // ロボットの右手のグローバル位置を更新
    rightArm.getWorldPosition(rightHandGlobalPosition);

    // 円柱の位置を右手の位置に設定
    cylinder.position.x = rightHandGlobalPosition.x - 5;
    cylinder.position.y = rightHandGlobalPosition.y;
    cylinder.position.z = rightHandGlobalPosition.z - 15;

    cylinder.rotation.x = -1;
    cylinder.rotation.z = 0.3;
}


    function animateCrouch() {
        // 胴体をしゃがむ位置に移動
        body.position.y = -20; // しゃがむ高さを調整
        headGroup.position.y = -10; // 頭部もしゃがむ高さに合わせて調整
        maxJumpSpeed = 1;

    }

    function animateRotate() {
       // 頭部の回転
        robot.children[0].rotation.y += Math.PI / 6;
    }

    function animateMoveSet(x, z) {
        targetPosition.set(x, 0, z);
        moving = true;
    }

    function animateMoveRobot() {

        const distance = robot.position.distanceTo(targetPosition);

        if (distance > walkSpeed) {
            const direction = targetPosition.clone().sub(robot.position).normalize();
            robot.position.add(direction.multiplyScalar(walkSpeed));

            // 頭部の向きを更新
            updateHeadDirection(direction);
            animateWalk(); // 歩行アニメーションを追加
        } else {
            robot.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            moving = false;
    }
}

    function updateHeadDirection(direction) {
        if(!rotate){
        // 頭部の向きを移動方向に合わせて調整
        const angle = Math.atan2(direction.x, direction.z);
        headGroup.rotation.y = angle;
        }
    }

    function animateWalk() {
        const walkCycleSpeed = walkSpeed;
        walkCycle += walkCycleSpeed;

        // 腕と脚のアニメーション
        leftArm.rotation.x = Math.sin(walkCycle) * Math.PI / 4;

        leftLeg.rotation.x = -Math.sin(walkCycle) * Math.PI / 4;
        rightLeg.rotation.x = Math.sin(walkCycle) * Math.PI / 4;
    }

    function animateJump() {
        if (jumpUp) {
            robot.position.y += jumpSpeed;
            if (cameraFollowRobot) {
                camera.position.y += jumpSpeed; // ジャンプ時にカメラも上昇
            }
            jumpSpeed -= 0.03;
            if (jumpSpeed <= 0) {
                jumpUp = false;
            }
        } else {
            robot.position.y += jumpSpeed;
            if (cameraFollowRobot) {
                camera.position.y += jumpSpeed; // 下降時にカメラも下降
            }
            jumpSpeed -= 0.03;
            if (robot.position.y <= 0) {
                robot.position.y = 0;
                jump = false;
                jumpUp = true;
                jumpSpeed = maxJumpSpeed;
            }
        }
    }

    function animatecamera() {
        if (cameraFollowRobot) {
            // カメラをロボットの位置に設定
            camera.position.x = robot.position.x;
            camera.position.z = robot.position.z - 15;

            // カメラのY軸の位置を、ジャンプまたはしゃがみの状態に応じて設定
            if (jump) {
                // ジャンプ中はカメラもロボットに追尾
                camera.position.y = headGroup.position.y;
            } else if (!isCrouching) {
                // しゃがんでいない場合は、ロボットの頭部の高さにカメラを設定
                camera.position.y = robot.position.y + headGroup.position.y;
            } else {
                // しゃがんでいるがジャンプしていない場合
                camera.position.y = robot.position.y - 10;
            }

            // カメラをロボットの向きに合わせて調整
            camera.lookAt(robot.position.x, robot.position.y, -1000);
        } else {
            // カメラを元の位置に戻す
            camera.position.copy(originalCameraPosition);
            camera.lookAt(originalCameraLookAt);
        }
    }


    function createRandomObject() {
        // ランダムな形状と大きさのジオメトリー
        const geometryTypes = [new THREE.BoxGeometry()];
        const randomGeometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
        const randomScale = Math.min(Math.random() * 30 + 1.0, 10);
        collision = false;
        randomGeometry.scale(randomScale, randomScale, randomScale);
        // マテリアル
        const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        // メッシュの作成
        const mesh = new THREE.Mesh(randomGeometry, material);
        // ランダムな初期位置
        init_x = Math.random() * 80 - 40; // -40 から 40 の範囲
        init_y = Math.random() * 60 - 40; // -40 から 40 の範囲
        mesh.position.set(init_x, init_y, -1000);
        // 物体をカメラに向けて移動させる
        const direction = new THREE.Vector3(0, 0, 1);
        mesh.userData.velocity = direction.multiplyScalar(Math.min(Math.random()+ 5), 3);
        return mesh;
    }

    // 物体の生成
    for (let i = 0; i < maxObjects; i++) {
        const object = createRandomObject();
        scene.add(object);
        objects.push(object);
    }

    // 物体をアニメーションさせる関数
    function animateObjects() {
        objects.forEach(object => {
            object.position.add(object.userData.velocity);

            // 物体が一定の距離まで近づいたら、新しい物体に置き換える
            if (object.position.z > 100) {
                scene.remove(object);
                const newObject = createRandomObject();
                scene.add(newObject);
                objects[objects.indexOf(object)] = newObject;
            }
        });
    }

    function checkCollisions() {
        objects.forEach(object => {
            const robotBox = new THREE.Box3().setFromObject(robot);
            const cylinderBox = new THREE.Box3().setFromObject(cylinder);
            const objectBox = new THREE.Box3().setFromObject(object);

            if (!object.userData.collided && robotBox.intersectsBox(objectBox)) {
                // 衝突検出
                console.log("damage!");
                damageCount++;
                document.getElementById('damageCount').innerText = damageCount;

                // 衝突した立方体をシーンから削除
                scene.remove(object);
                objects.splice(objects.indexOf(object), 1);

                // オーバーレイを表示
                document.getElementById('overlay-red').style.display = 'block';

                // 衝突フラグを更新
                object.userData.collided = true;

                // 新しい立方体を生成してシーンに追加
                const newObject = createRandomObject();
                scene.add(newObject);
                objects.push(newObject);

                // 一定時間後にオーバーレイを非表示にする
                setTimeout(function() {
                    document.getElementById('overlay-red').style.display = 'none';
                }, 1000); // 1秒後に非表示
            }
            if (!object.userData.collided && cylinderBox.intersectsBox(objectBox) && cylinderAnimating) {
                // 衝突検出
                console.log("point!");
                pointsCount++;
                document.getElementById('pointsCount').innerText = pointsCount;


                // 衝突した立方体をシーンから削除
                scene.remove(object);
                objects.splice(objects.indexOf(object), 1);

                // 分割された立方体を作成
                createSplitCubes(object.position);

                // オーバーレイを表示
                document.getElementById('overlay-blue').style.display = 'block';

                // 衝突フラグを更新
                object.userData.collided = true;

                // 新しい立方体を生成してシーンに追加
                const newObject = createRandomObject();
                scene.add(newObject);
                objects.push(newObject);

                // 一定時間後にオーバーレイを非表示にする
                setTimeout(function() {
                    document.getElementById('overlay-blue').style.display = 'none';
                }, 1000); // 1秒後に非表示
            }
        });
    }

    function createSplitCubes(position) {
        // 立方体の分割サイズと位置を設定
        const size = 5; // 新しい小さな立方体のサイズ
        const offset = 2.5; // 分割時のオフセット距離

        // 二つの立方体を作成
        for (let i = 0; i < 2; i++) {
            const cubeGeometry = new THREE.BoxGeometry(size, size, size);
            const cubeMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

            // 分割された立方体の初期位置と速度を設定
            cube.position.set(
                position.x + (i === 0 ? -offset : offset),
                position.y,
                position.z
            );
            cube.userData.velocity = new THREE.Vector3(
                Math.random() * 0.5 - 0.25,
                Math.random() * 0.5,
                Math.random() * 0.5 - 0.25
            );

            // シーンに立方体を追加
            scene.add(cube);
            splitCubes.push(cube);
        }
    }

    // animate関数内で分割された立方体のアニメーションを更新
    function animateSplitCubes() {
        splitCubes.forEach(cube => {
            // 立方体の速度に基づいて位置を更新
            cube.position.add(cube.userData.velocity);

            // 重力のシミュレーション
            cube.userData.velocity.y -= 0.02; // 重力の加速度

            // 地面に衝突したら停止
            if (cube.position.y <= groundLevel) {
                cube.position.y = groundLevel;
                cube.userData.velocity.set(0, 0, 0);
            }
        });
    }

    // アニメーション制御用の変数
    let cylinderAnimating = false;
    let cylinderRotationAngle = 0;
    const fullRotation = 2 * Math.PI;
    const cylinderRotationSpeed = 7*Math.PI; // 1秒間に180度回転

    // 円柱を動かす関数
    function swingCylinder() {
        if (!cylinderAnimating) {
        cylinderAnimating = !cylinderAnimating;
        cylinderRotationAngle = 0;
        }
    }

function updateCylinderRotation(deltaTime) {
    if (!cylinderAnimating) return;

    cylinderRotationAngle += deltaTime * cylinderRotationSpeed;

    // 一回転完了したか確認
    if (cylinderRotationAngle >= fullRotation) {
        cylinderRotationAngle = fullRotation; // 角度を一回転に制限
        cylinderAnimating = false; // アニメーション停止
    }

    // 円柱の回転を設定
    cylinder.rotation.y = cylinderRotationAngle;
    // 円柱の回転角度を更新
    cylinderRotationAngle += deltaTime * cylinderRotationSpeed;

    // 円柱の回転を設定（Y軸を中心とする回転と仮定）
    cylinder.rotation.y = cylinderRotationAngle;

    // 円柱の位置を右腕の下端に合わせる
    cylinder.position.x = rightHandGlobalPosition.x - 5;
    cylinder.position.y = rightHandGlobalPosition.y;
    cylinder.position.z = rightHandGlobalPosition.z - 15;

}

    // 光源設定
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let render = function () { renderer.render(scene, camera); };
    render();

    animate();
}

