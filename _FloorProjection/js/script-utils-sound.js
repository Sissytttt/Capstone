function get_SingingBowl_low(path) {
    SingingBowl0 = new THREE.Audio(audioListener);
    SingingBowl1 = new THREE.Audio(audioListener);
    SingingBowl2 = new THREE.Audio(audioListener);
    SingingBowl3 = new THREE.Audio(audioListener);
    SingingBowl4 = new THREE.Audio(audioListener);
    SingingBowl5 = new THREE.Audio(audioListener);
    scene.add(SingingBowl0);
    scene.add(SingingBowl1);
    scene.add(SingingBowl2);
    scene.add(SingingBowl3);
    scene.add(SingingBowl4);
    scene.add(SingingBowl5);
    const sloader = new THREE.AudioLoader();
    sloader.load(
        path,
        function (audioBuffer) {
            SingingBowl0.setBuffer(audioBuffer);
            SingingBowl1.setBuffer(audioBuffer);
            SingingBowl2.setBuffer(audioBuffer);
            SingingBowl3.setBuffer(audioBuffer);
            SingingBowl4.setBuffer(audioBuffer);
            SingingBowl5.setBuffer(audioBuffer);
        },
        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.log('An error happened');
        }
    );
    // console.log("get 6 singingbowls")
}

function get_SingingBowl_high(path) {
    SingingBowl_high = new THREE.Audio(audioListener);
    scene.add(SingingBowl_high);
    const sloader = new THREE.AudioLoader();
    sloader.load(
        path,
        function (audioBuffer) {
            SingingBowl_high.setBuffer(audioBuffer);
        },
        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.log('An error happened');
        }
    );
    console.log("get SingingBowl_high")
}



function playOnce_SingingBowl(singingBowl) {
    if (!singingBowl.isPlaying) {
        singingBowl.play();
    }
}
function playSingingBowlBasedOnPhase() {
    console.log("case", phase1_step)
    switch (phase1_step) {
        case 0:
            playOnce_SingingBowl(SingingBowl0);
            break;
        case 1:
            playOnce_SingingBowl(SingingBowl1);
            break;
        case 2:
            playOnce_SingingBowl(SingingBowl2);
            break;
        case 3:
            playOnce_SingingBowl(SingingBowl3);
            break;
        case 4:
            playOnce_SingingBowl(SingingBowl4);
            break;
        case 5:
            playOnce_SingingBowl(SingingBowl5);
            break;
    }
}
