import * as BABYLON from 'babylonjs';
import {Engine,Scene,ArcRotateCamera,Vector3,SceneLoader,ExecuteCodeAction,ActionManager,MeshBuilder,StandardMaterial,Color3,DefaultRenderingPipeline,Scalar,Texture,CubeTexture} from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-loaders';


import {CameraRediusController,CameraTargetController,EnvironmentController} from './Utils.js';

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

const config = {
    distCameraRadius: 0.15,
    assetsRootPath: "./assets/",
    defaultAssetName: "chair.glb",
    hdriFilePath: [
        "./assets/hdri.env",
        "./assets/environment.env"
    ]
}

// Add your code here matching the playground format
const createScene = function () {
    const scene = new Scene(engine);
    let camera = new ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new Vector3(-0.35, 0.7, 0.8));
    let cameraRediusController = new CameraRediusController();
    let cameraTargetController = new CameraTargetController();
    let environmentController = new EnvironmentController(scene);
    let pickedPoint; //詳細的にスコープを狭くしたい
    cameraRediusController.setDistCameraRadius(config.distCameraRadius);
    camera.attachControl(canvas, true);

    const importPromise = SceneLoader.ImportMeshAsync("",config.assetsRootPath, config.defaultAssetName, scene);
    
    importPromise.then((result) => {
        let meshes = result.meshes;
        camera = setUpCameraSetting(scene);
        cameraTargetController.setCamera(camera);
        cameraRediusController.setCamera(camera);
        environmentController.createSkybox(config.hdriFilePath[0]);

        // MeshへのダブルクリックのAction
        const cameraMoveAction =  new ExecuteCodeAction(ActionManager.OnPickTrigger,() => {
            cameraTargetController.beginMove(pickedPoint);
            cameraRediusController.beginMove();
        });
        meshes.forEach(mesh =>{
            if(mesh){
                mesh.actionManager = new ActionManager(scene);
                mesh.actionManager.registerAction(cameraMoveAction);
            }
        });
    });

    addUI(scene,
    (checkBox1)=>{
        if(checkBox1){
            environmentController.changeSkyboxTexture(config.hdriFilePath[0]);
            environmentController.changeEnvironmentTexture(config.hdriFilePath[0]);
        }else{
            environmentController.changeSkyboxTexture(config.hdriFilePath[1]);
            environmentController.changeEnvironmentTexture(config.hdriFilePath[1]);
        }
    },(checkBox2) =>{
        if(checkBox2){
            environmentController.changeModeToSkybox()
        }else{
            environmentController.changeModeToSolidColor();
        }
    });

    //FIXME:
    scene.onPointerMove  = function (event, pickResult){
        pickedPoint = pickResult.pickedPoint;
    }

    scene.registerBeforeRender(function () {
        const deltaTime = engine.getDeltaTime() / 1000;
        cameraTargetController.updateParameterAtFrame(deltaTime);
        cameraRediusController.updateParameterAtFrame(deltaTime);
    });

    scene.onPointerDown  = function (event, pickResult){
        cameraRediusController.endMove();
    }
    return scene;
}
const scene = createScene(); //Call the createScene function
//scene.debugLayer.show();
engine.runRenderLoop(function () {
    scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

function setUpPipeline(camera){

    var pipeline = new DefaultRenderingPipeline(
        "defaultPipeline", // The name of the pipeline
        true, // Do you want the pipeline to use HDR texture?
        scene, // The scene instance
        [camera] // The list of cameras to be attached to
    );
    pipeline.depthOfFieldEnabled = true;
    pipeline.bloomEnabled = true;
}

function setUpCameraSetting(scene){
    scene.createDefaultCamera(true, true, true);
    let camera = scene.activeCamera;
    camera.alpha = 3*Math.PI/4;
    camera.beta = Math.PI/3;
    scene.clearColor = new Color3(221/255, 221/255, 221/255);
    camera.speed = 0.4204;
    camera.lowerRadiusLimit = 0.0210;
    camera.panningSensibility = 5000;
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 20;
    camera.pinchDeltaPercentage = 0.001;
    camera.wheelDeltaPercentage = 0.01;
    return camera;
}

function addUI(scene,check,check2){
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
    var checkbox2 = new GUI.Checkbox();
    checkbox2.width = "20px";
    checkbox2.height = "20px";
    checkbox2.isChecked = true;
    checkbox2.color = "green";
    checkbox2.onIsCheckedChangedObservable.add(function(value) {
        check2(value);
    });
    panel.addControl(checkbox);
    panel.addControl(checkbox2);

    panel.addControl(picker);     
} 



