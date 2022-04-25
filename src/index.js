import * as BABYLON from 'babylonjs';
import 'babylonjs-materials';
import 'babylonjs-loaders';
import 'babylonjs-inspector';
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    // var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./assets/environment.dds", scene);
    // var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    BABYLON.SceneLoader.Append("assets/", "chair.glb", scene, function (scene) {
        scene.createDefaultCameraOrLight(true, true, true);
        scene.activeCamera.alpha = 3*Math.PI/4;
        scene.activeCamera.beta = Math.PI/3;
    });

    scene.clearColor = new BABYLON.Color3(1,1,1); //背景透過のコード
    return scene;
}
const scene = createScene(); //Call the createScene function

scene.debugLayer.show();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});