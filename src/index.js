import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-materials';
import 'babylonjs-loaders';
import 'babylonjs-inspector';
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
let pickedPoint;

const config = {
    distCameraRadius: 0.1
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
                this.#currentCameraRadius = BABYLON.Scalar.Lerp(this.#currentCameraRadius,this.#distCameraRadius,deltaTime*this.#speed);
            }
            this.#camera.radius =  this.#currentCameraRadius;
        }else{
            this.#currentCameraRadius =  this.#camera.radius;
        }
    }
}
class CameraTargetController {
    #distCameraTargetPosition = BABYLON.Vector3.Zero;
    #currentCameraTargetPosition = BABYLON.Vector3.Zero;
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
        if(BABYLON.Vector3.DistanceSquared(this.#currentCameraTargetPosition,this.#distCameraTargetPosition) <= 0.00000001){
            this.#currentCameraTargetPosition = this.#distCameraTargetPosition;
        }else{
            this.#currentCameraTargetPosition = BABYLON.Vector3.Lerp(this.#currentCameraTargetPosition,this.#distCameraTargetPosition,deltaTime*this.#speed);
        }
        this.#camera.target =  this.#currentCameraTargetPosition;
    }
}

class CameraController {
    #targetController;#radiusController;

    constructor() {
        this.#targetController = new CameraTargetController();
        this.#radiusController = new CameraRediusController();
    }
    // get currentCameraRadius() {
    //     return this.#currentCameraRadius;
    // }

    setRadiusSpeed(speed){
        this.#radiusController.setSpeed(speed);
    }
    setTargetSpeed(speed){
        this.#targetController.setSpeed(speed);
    }

    beginMove(targetPosition){
        this.#targetController.beginMove(targetPosition);
        this.#radiusController.beginMove();
    }

    setCamera(camera){
       // this.#camera = camera;
        this.#targetController.setCamera(camera);
        this.#radiusController.setCamera(camera);
        // this.#distCameraRadius = camera.radius;
        // this.#currentCameraRadius = camera.radius;
    }

    endMove(){
        this.#radiusController.endMove();
    }
    updateParameterAtFrame(deltaTime){
        this.#targetController.updateParameterAtFrame(deltaTime);
        this.#radiusController.updateParameterAtFrame(deltaTime);
    }
}

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    let camera = new BABYLON.ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new BABYLON.Vector3(-0.35, 0.7, 0.8));
    // let cameraRediusController = new CameraRediusController();
    // let cameraTargetController = new CameraTargetController();
    let cameraController = new CameraController(); 
  //  cameraRediusController.setDistCameraRadius(config.distCameraRadius);
    camera.attachControl(canvas, true);
    setUpEnvironment(scene);

    BABYLON.SceneLoader.ImportMesh("","./assets/", "chair.glb", scene, function (meshes, particleSystems, skeletons) {

        camera = setUpCameraSetting(scene);
        cameraController.setCamera();
        // cameraTargetController.setCamera(camera);
        // cameraRediusController.setCamera(camera);

        createSkeybox(scene);
        addUI(scene,(on)=>onCheckbox(on,meshes));
        const action1 =  new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnDoublePickTrigger,() => {
            // distCameraTargetPosition = pickedPoint;
            cameraController.beginMove(pickedPoint);
            // cameraTargetController.beginMove(pickedPoint);
            // cameraRediusController.beginMove();
        });
        meshes.forEach(mesh =>{
            if(mesh){
                mesh.actionManager = new BABYLON.ActionManager(scene);
                mesh.actionManager.registerAction(action1);
            }
        });
    
    });
    scene.onPointerMove  = function (event, pickResult){
        pickedPoint = pickResult.pickedPoint;
    }

    scene.registerBeforeRender(function () {
       // update(scene,camera);
        const deltaTime = engine.getDeltaTime() / 1000;
        cameraController.updateParameterAtFrame(deltaTime);
        // cameraTargetController.updateParameterAtFrame(deltaTime);
        // cameraRediusController.updateParameterAtFrame(deltaTime);
        console.log(camera.radius+","+camera.target);
    });

    scene.onPointerDown  = function (event, pickResult){
        cameraController.endMove();
       // cameraRediusController.endMove();
    }


   

    return scene;
}
const scene = createScene(); //Call the createScene function
scene.debugLayer.show();
engine.runRenderLoop(function () {
    scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

function update(scene,camera){
    //const deltaTime = engine.getDeltaTime() / 1000;
    // if(BABYLON.Vector3.DistanceSquared(currentCameraTargetPosition,distCameraTargetPosition) <= 0.00000001){
    //     currentCameraTargetPosition = distCameraTargetPosition;
    //     camera.target = currentCameraTargetPosition;
    // }else{
    //     currentCameraTargetPosition = BABYLON.Vector3.Lerp(currentCameraTargetPosition,distCameraTargetPosition,deltaTime*5);
    //     camera.target = currentCameraTargetPosition;
    // }
    
}

function createSkeybox(scene){
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/hdri_4k.env", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
}

function onCheckbox(enabled,meshes){
    meshes[1].material.wireframe = !enabled;

    meshes.forEach(mesh => {
        console.log(mesh.material);
        if(mesh.material){
            // mesh.material.wireframe = !on;
            // mesh.material.wireframe = !on;
        }
    });

    if(enabled){
       // skybox.material = null;
 
    }else{
       // skybox.material = skyboxMaterial;
    }
}

function setUpEnvironment(scene){
    var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/hdri_4k.env", scene);
    scene.environmentTexture = hdrTexture;

}
function setUpPipeline(camera){

    var pipeline = new BABYLON.DefaultRenderingPipeline(
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
    scene.clearColor = new BABYLON.Color3(221/255, 221/255, 221/255);
    camera.speed = 0.4204;
    camera.lowerRadiusLimit = 0.0210;
    camera.panningSensibility = 5000;
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 20;
    camera.pinchDeltaPercentage = 0.001;
    camera.wheelDeltaPercentage = 0.01;

    return camera;
}

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



