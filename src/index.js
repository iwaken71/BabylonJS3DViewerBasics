import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-materials';
import 'babylonjs-loaders';
import 'babylonjs-inspector';
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const  createScene = () => {
    const scene = new BABYLON.Scene(engine);
    // var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./assets/environment.dds", scene);
    // var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);
   // const ground = BABYLON.MeshBuilder.CreateGround("ground", options, scene); 
    const camera = new BABYLON.ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new BABYLON.Vector3(-0.35, 0.7, 0.8));
    camera.attachControl(canvas, true);
    BABYLON.SceneLoader.ImportMesh("","./assets/", "chair.glb", scene, function (meshes, particleSystems, skeletons) {
        scene.createDefaultCameraOrLight(true, true, true);
        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/environment.env", scene);
        scene.environmentTexture = hdrTexture;
        scene.activeCamera.alpha = 3*Math.PI/4;
        scene.activeCamera.beta = Math.PI/3;
        scene.clearColor = new BABYLON.Color3(1,1,1);
        camera.speed = 0.4204;
        camera.lowerRadiusLimit = 0.0210;
        addUI(scene,(on)=>{
            console.log(on);
            meshes[0].material.wireframe = on;
            // scene.getMaterialByUniqueID("WorkChair_Fabric_MT").wireframe = on;
            // scene.getMaterialByName("WorkChair_Main_MT").wireframe = on;
        });
        
    });

   

    return scene;
}
const scene = createScene(); //Call the createScene function

//scene.debugLayer.show();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

function addUI(scene,check){
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = new GUI.StackPanel();
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(panel);

    
    var picker = new GUI.ColorPicker();
    picker.value = scene.clearColor;
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.onValueChangedObservable.add(function(value) { // value is a color3
        scene.clearColor = value;
    });

    // var checkbox = new GUI.Checkbox();
    // checkbox.width = "20px";
    // checkbox.height = "20px";
    // checkbox.isChecked = true;
    // checkbox.color = "green";
    // checkbox.onIsCheckedChangedObservable.add(function(value) {
    //     check(value);
    // });
    // panel.addControl(checkbox);

    panel.addControl(picker);     
} 