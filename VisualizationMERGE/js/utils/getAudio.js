function get_SingingBowl(path) {
    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    singingBowl = new THREE.Audio(audioListener);
    scene.add(voiceOver);
    const sloader = new THREE.AudioLoader();
    sloader.load(
        path,
        function (audioBuffer) {
            voiceOver.setBuffer(audioBuffer);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.log('An error happened');
        }
    );
    // voiceOver.play();
}