import * as BABYLON from 'babylonjs';
import {Engine,Scene,ArcRotateCamera,Vector3,SceneLoader,ExecuteCodeAction,ActionManager,MeshBuilder,StandardMaterial,Color3,DefaultRenderingPipeline,Scalar,Texture,CubeTexture} from 'babylonjs';
import 'babylonjs-loaders';
import {CameraRediusController,CameraTargetController,EnvironmentController} from './Utils.js';
import {UIController} from './UIController';

(async ()=>{

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

const config = {
    showDebugUI: false,
    distCameraRadius: 1,
    radiusSpeed: 2.0,
    targetSpeed: 2.0,
    assetsRootPath: "https://raw.githubusercontent.com/iwaken71/BabylonJS3DViewerBasics/master/public/assets/",
    defaultAssetName: "chair.glb",
    hdriInfo: [
        {
            name : "HDRI1",
            path : "https://raw.githubusercontent.com/iwaken71/BabylonJS3DViewerBasics/master/public/assets/hdri.env"
        },
        {
            name: "HDRI2",
            path: "https://raw.githubusercontent.com/iwaken71/BabylonJS3DViewerBasics/master/public/assets/environment.env"
        },
        {
            name: "HDRI3",
            path: "https://playground.babylonjs.com/textures/environment.dds"
        }
    ],
}

// Add your code here matching the playground format
const createScene = async function () {
    const scene = new Scene(engine);
    let camera = new ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new Vector3(-0.35, 0.7, 0.8));
    let cameraRediusController = new CameraRediusController();
    let cameraTargetController = new CameraTargetController();
    let environmentController = new EnvironmentController(scene);
    let viewController = new UIController();
    let pickedPoint; //詳細的にスコープを狭くしたい
    cameraRediusController.setDistCameraRadius(config.distCameraRadius);
    camera.attachControl(canvas, true);

    const result = await SceneLoader.ImportMeshAsync("",config.assetsRootPath, config.defaultAssetName, scene);

    let meshes = result.meshes;
    camera = setUpCameraSetting(scene);
    cameraTargetController.setCamera(camera);
    cameraRediusController.setCamera(camera);
    environmentController.createSkybox(config.hdriInfo[0].path);

    // MeshへのダブルクリックのAction
    const cameraMoveAction =  new ExecuteCodeAction(ActionManager.OnDoublePickTrigger,() => {
        cameraTargetController.beginMove(pickedPoint);
        cameraRediusController.beginMove();
    });
    meshes.forEach(mesh =>{
        if(mesh){
            mesh.actionManager = new ActionManager(scene);
            mesh.actionManager.registerAction(cameraMoveAction);
        }
    });

    viewController.CreateUI(scene);
    viewController.AddEventOnPickerValueChanged((color) => {
        scene.clearColor = color;
    });
    viewController.AddEventOnIsCheckBoxChanged((on)=> {
        if(on){
            environmentController.changeModeToSkybox()
        }else{
            environmentController.changeModeToSolidColor();
        }
    });

    for (let i = 0; i < config.hdriInfo.length; i++) {
        viewController.AddRadio(config.hdriInfo[i].name);
        viewController.radioButtons[i].onIsCheckedChangedObservable.add((state)=>{
            if(state){
                environmentController.changeSkyboxTexture(config.hdriInfo[i].path);
                environmentController.changeEnvironmentTexture(config.hdriInfo[i].path);
            }
        });
    }

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
const scene = await createScene(); //Call the createScene function

if(config.showDebugUI){
    scene.debugLayer.show();
}
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
})()