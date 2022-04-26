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
    scene.collisionsEnabled = true;
    // var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./assets/environment.dds", scene);
    // var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);
   // const ground = BABYLON.MeshBuilder.CreateGround("ground", options, scene); 
    const camera = new BABYLON.ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new BABYLON.Vector3(-0.35, 0.7, 0.8));
    //var ground = BABYLON.Mesh.CreateGround("ground1", 10,10, 1,scene);
    camera.attachControl(canvas, true);
    BABYLON.SceneLoader.ImportMesh("","./assets/", "chair.glb", scene, function (meshes, particleSystems, skeletons) {
        scene.createDefaultCameraOrLight(true, true, true);
        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/hdri_4k.env", scene);
        scene.environmentTexture = hdrTexture;
        // scene.createDefaultSkybox(hdrTexture, true, 1000);
        let camera2 = scene.activeCamera;
        camera2.alpha = 3*Math.PI/4;
        camera2.beta = Math.PI/3;
        scene.clearColor = new BABYLON.Color3(221/255, 221/255, 221/255);
        camera2.speed = 0.4204;
        camera2.lowerRadiusLimit = 0.0210;

        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/hdri_4k.env", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        console.log(meshes[1].material);
        addUI(scene,(on)=>{
            // meshes[1].material.wireframe = !on;
            meshes[1].material.wireframe = !on;
            meshes[2].material.wireframe = !on;
            if(on){
               // skybox.material = null;
         
            }else{
               // skybox.material = skyboxMaterial;
            }
            // scene.getMaterialByUniqueID("WorkChair_Fabric_MT").wireframe = on;
            // scene.getMaterialByName("WorkChair_Main_MT").wireframe = on;
        });
        camera2.panningSensibility = 5000;
        camera2.lowerRadiusLimit = 0.1;
        camera2.upperRadiusLimit = 20;
        camera2.pinchDeltaPercentage = 0.001;
        camera2.wheelDeltaPercentage = 0.005;


        // var pipeline = new BABYLON.DefaultRenderingPipeline(
        //     "defaultPipeline", // The name of the pipeline
        //     true, // Do you want the pipeline to use HDR texture?
        //     scene, // The scene instance
        //     [camera2] // The list of cameras to be attached to
        // );
        // pipeline.depthOfFieldEnabled = true;
        // pipeline.bloomEnabled = true;
        const action1 =  new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnDoublePickTrigger,() => {

            console.log("double click");
        });
        meshes[1].actionManager = new BABYLON.ActionManager(scene);
        meshes[1].actionManager.registerAction(action1);
        meshes[2].actionManager = new BABYLON.ActionManager(scene);
        meshes[2].actionManager.registerAction(action1);


    });

   

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

function addUI(scene,check){
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = new GUI.StackPanel();
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.top = 100;
    advancedTexture.addControl(panel);

    
    var picker = new GUI.ColorPicker();
    picker.value = scene.clearColor;
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.onValueChangedObservable.add(function(value) { // value is a color3
        scene.clearColor = value;
    });

    var checkbox = new GUI.Checkbox();
    checkbox.width = "20px";
    checkbox.height = "20px";
    checkbox.isChecked = true;
    checkbox.color = "green";
    checkbox.onIsCheckedChangedObservable.add(function(value) {
        check(value);
    });
    panel.addControl(checkbox);

    panel.addControl(picker);     
} 