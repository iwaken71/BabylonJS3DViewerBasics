import * as BABYLON from 'babylonjs';
import {Engine,Scene,ArcRotateCamera,Vector3,SceneLoader,ExecuteCodeAction,ActionManager,MeshBuilder,StandardMaterial,Color3,DefaultRenderingPipeline,Scalar,Texture,CubeTexture} from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-loaders';

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine



const config = {
    distCameraRadius: 4,
    assetsRootPath: "./assets/",
    defaultAssetName: "StudioB2.glb",
    hdriFilePath: [
        "./assets/hdri.env",
        "./assets/environment.env"
    ]
}

class CameraRediusController {
    #distCameraRadius = 0.15;
    #currentCameraRadius = 1.5;
    #speed = 4;
    #zoomMove = false;
    #camera;

    constructor() {
        this.#zoomMove = false;
    }
    get currentCameraRadius() {
        return this.#currentCameraRadius;
    }
    setDistCameraRadius(radius){
        this.#distCameraRadius = radius;
    }
    setSpeed(speed){
        this.#speed = speed;
    }

    beginMove(){
        this.#zoomMove = true;
    }

    setCamera(camera){
        this.#camera = camera;
        this.#currentCameraRadius = camera.radius;
    }

    endMove(){
        this.#zoomMove = false;
    }
    updateParameterAtFrame(deltaTime){
        if(this.#camera == null){
            return;
        }
        if(this.#zoomMove){
            if(Math.abs(this.#currentCameraRadius-this.#distCameraRadius) <= 0.0001){
                this.#currentCameraRadius = this.#distCameraRadius;
                this.#zoomMove = false;
            }else{
                this.#currentCameraRadius = Scalar.Lerp(this.#currentCameraRadius,this.#distCameraRadius,deltaTime*this.#speed);
            }
            this.#camera.radius =  this.#currentCameraRadius;
        }else{
            this.#currentCameraRadius =  this.#camera.radius;
        }
    }
}
class CameraTargetController {
    #distCameraTargetPosition = Vector3.Zero;
    #currentCameraTargetPosition = Vector3.Zero;
    #camera;
    #speed = 5;
    
    constructor() {
    }
    setSpeed(speed){
        this.#speed = speed;

    }
    setCamera(camera){
        this.#camera = camera
        this.#distCameraTargetPosition = camera.target;
        this.#currentCameraTargetPosition = camera.target;
        console.log(camera);
    }

    beginMove(distCameraTargetPosition){
        this.#distCameraTargetPosition = distCameraTargetPosition;
    }

    updateParameterAtFrame(deltaTime){
        if(this.#camera == null){
            return;
        }
        if(Vector3.DistanceSquared(this.#currentCameraTargetPosition,this.#distCameraTargetPosition) <= 0.00000001){
            this.#currentCameraTargetPosition = this.#distCameraTargetPosition;
        }else{
            this.#currentCameraTargetPosition = Vector3.Lerp(this.#currentCameraTargetPosition,this.#distCameraTargetPosition,deltaTime*this.#speed);
        }
        this.#camera.target =  this.#currentCameraTargetPosition;
    }
}

class EnvironmentController {
    #scene;
    #skybox;
    #currentSkyMaterial
    constructor(scene) {
        this.#scene = scene;
    }

    createSkybox(envfilePath){
        if(this.isInitialized()){
            return;
        }
        var skybox = MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
        var skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture(envfilePath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        this.#currentSkyMaterial = skyboxMaterial;
        this.changeEnvironmentTexture(envfilePath);
        this.setSkybox(skybox);
    }

    changeModeToSolidColor(){
        if(!this.isInitialized()){
            return;
        }
        this.#skybox.material = null;
    }
    changeModeToSkybox(){
        if(!this.isInitialized()){
            return;
        }
        this.#skybox.material = this.#currentSkyMaterial;
    }
    changeSoloiColor(color){
        this.#scene.clearColor = color;
    }

    changeSkyboxTexture(envFilePath){
        if(!this.isInitialized()){
            return;
        }
        if(this.#skybox.material == null){
            return;
        }
        this.#skybox.material.reflectionTexture = new CubeTexture(envFilePath, this.#scene);
        this.#skybox.material.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        this.#currentSkyMaterial = this.#skybox.material;
    }

    changeEnvironmentTexture(envFilePath){
        const hdrTexture = CubeTexture.CreateFromPrefilteredData(envFilePath, this.#scene);
        this.#scene.environmentTexture = hdrTexture;
    }

    setSkybox(skybox){
        this.#skybox = skybox;
    }

    isInitialized(){
        return this.#skybox != null;
    }
}
// Add your code here matching the playground format
const createScene = () => {
    const scene = new Scene(engine);
    let camera = new ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new Vector3(-0.35, 0.7, 0.8));
    let cameraRediusController = new CameraRediusController();
    let cameraTargetController = new CameraTargetController();
    let environmentController = new EnvironmentController(scene);
    let pickedPoint; //詳細的にスコープを狭くしたい
    cameraRediusController.setDistCameraRadius(config.distCameraRadius);
    camera.attachControl(canvas, true);

    SceneLoader.ImportMesh("",config.assetsRootPath, config.defaultAssetName, scene, function (meshes, particleSystems, skeletons) {

        camera = setUpCameraSetting(scene);
        cameraTargetController.setCamera(camera);
        cameraRediusController.setCamera(camera);
        environmentController.createSkybox(config.hdriFilePath[0]);

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
        setUpPipeline(camera);
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
    pipeline.depthOfField.focalLength =27;
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



