function get_audio(path) {
    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    SingingBowl = new THREE.Audio(audioListener);
    scene.add(SingingBowl);
    const sloader = new THREE.AudioLoader();
    sloader.load(
        path,
        function (audioBuffer) {
            SingingBowl.setBuffer(audioBuffer);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.log('An error happened');
        }
    );
    console.log("playing SingingBowl")
}