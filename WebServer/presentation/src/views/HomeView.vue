<script setup>


import { onMounted } from 'vue'
import $ from 'jquery';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

onMounted(() => {
    document.title = 'Home';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const canvas = document.getElementById("renderCanvas");
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.onresize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    };

    const controls = new OrbitControls( camera, renderer.domElement );


    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( 0, 20, 10 );
    scene.add( dirLight );
    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
    const loader = new GLTFLoader();
    loader.load( 'src/assets/models/RobotExpressive.glb', function ( gltf ) {

        const model = gltf.scene;
        scene.add( model );

        createGUI( model, gltf.animations );

    })
    camera.position.z = 10;

    function animate() {
        requestAnimationFrame( animate );

        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        controls.update();
        renderer.render( scene, camera );
    }

    animate();
})


</script>

<template>
    <canvas id="renderCanvas" class="renderArea"></canvas>
</template>
<style scoped>

.renderArea {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    touch-action: none;
    z-index: 10;
    outline: 0;
}
</style>