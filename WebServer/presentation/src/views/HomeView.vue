<script setup>


import { onMounted,onBeforeMount  } from 'vue'
import $ from 'jquery';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


function SetOwner(Owner, obj) {
    for (let i = 0; i < obj.children.length; i++) {
        obj.children[i].Owner = Owner;
        SetOwner(Owner, obj.children[i]);
    }
}
function getURLParameters() {
    var urlParams = new URLSearchParams(window.location.search);
    var paramsArray = new Array();
    urlParams.forEach(function(value, key) {
        paramsArray[key] = value;
    });
    return paramsArray;
}


onBeforeMount(() => {
  clearInterval();
})

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
    
    $( window ).on( "resize", function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    });

    const controls = new OrbitControls( camera, renderer.domElement );


    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( 0, 20, 10 );
    scene.add( dirLight );

    const loader = new GLTFLoader();
    loader.load( 'src/assets/models/RobotExpressive.glb', function ( gltf ) {
        gltf.scene.lookAt(camera.position);
        gltf.scene.name = "导游";
        //Create world
        SetOwner("导游", gltf.scene);
        scene.add(gltf.scene);
    })
    camera.position.z = 10;

    function animate() {
        requestAnimationFrame( animate );
        for (let id in scene.children) {
            const obj = scene.children[id];

            if (obj.name == "导游") {
                obj.rotation.y += 0.01;
                obj.rotation.x += 0.01;
            }
        }
        
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