import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-materials';
import 'babylonjs-loaders';
import 'babylonjs-inspector';
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
let pickedPoint;

const config = {
    distCameraRadius: 0.15
}

class CameraRediusController {
    constructor(currentCameraRadius,speed = 4) {
      this.distCameraRadius = currentCameraRadius;
      this.currentCameraRadius = currentCameraRadius;
      this.speed = speed;
      this.zoomMove = false;
    }

    beginMove(distCameraRadius){
        this.zoomMove = true;
        this.distCameraRadius = distCameraRadius;
    }

    endMove(){
        this.zoomMove = false;
    }
    updateParameterAtFrame(deltaTime){
        if(this.zoomMove){
            if(Math.abs(this.currentCameraRadius-this.distCameraRadius) <= 0.0001){
                this.currentCameraRadius = this.distCameraRadius;
                this.zoomMove = false;
            }else{
                this.currentCameraRadius = BABYLON.Scalar.Lerp(this.currentCameraRadius,this.distCameraRadius,deltaTime*this.speed);
            }
        }
    }
}
class CameraTargetController {
    constructor(currentCameraTargetPosition,speed = 5) {
        this.distCameraTargetPosition = currentCameraTargetPosition;
        this.currentCameraTargetPosition = currentCameraTargetPosition;
        this.speed = speed
    }

    initializeTargetPosition(targetPosition){
        this.distCameraTargetPosition = targetPosition;
        this.currentCameraTargetPosition = targetPosition;
    }

    beginMove(distCameraTargetPosition){
        this.distCameraTargetPosition = distCameraTargetPosition;
    }

    updateParameterAtFrame(deltaTime){
        if(BABYLON.Vector3.DistanceSquared(this.currentCameraTargetPosition,this.distCameraTargetPosition) <= 0.00000001){
            this.currentCameraTargetPosition = this.distCameraTargetPosition;
        }else{
            this.currentCameraTargetPosition = BABYLON.Vector3.Lerp(this.currentCameraTargetPosition,this.distCameraTargetPosition,deltaTime*this.speed);
        }
        //console.log(this.currentCameraTargetPosition);
    }
}

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    let camera = new BABYLON.ArcRotateCamera("camera", 3*Math.PI/4, Math.PI/3, 2.1, new BABYLON.Vector3(-0.35, 0.7, 0.8));
    let cameraRediusController = new CameraRediusController(camera.radius);
    let cameraTargetController = new CameraTargetController(camera.target);
    camera.attachControl(canvas, true);
    setUpEnvironment(scene);

    BABYLON.SceneLoader.ImportMesh("","./assets/", "chair.glb", scene, function (meshes, particleSystems, skeletons) {

        camera = setUpCameraSetting(scene);
        cameraTargetController.initializeTargetPosition(camera.target);

        createSkeybox(scene);
        addUI(scene,(on)=>onCheckbox(on,meshes));
        const action1 =  new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnDoublePickTrigger,() => {
            // distCameraTargetPosition = pickedPoint;
            cameraTargetController.beginMove(pickedPoint);
            cameraRediusController.beginMove(config.distCameraRadius);
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
        cameraRediusController.updateParameterAtFrame(deltaTime);
        cameraTargetController.updateParameterAtFrame(deltaTime);
        if(cameraRediusController.zoomMove){
            camera.radius = cameraRediusController.currentCameraRadius;
           
        }else{
            cameraRediusController.currentCameraRadius = camera.radius;
        }
        // console.log(cameraRediusController.zoomMove);
        // console.log(cameraRediusController.currentCameraRadius);
        console.log( camera);
        camera.target = cameraTargetController.currentCameraTargetPosition;
    });

    scene.onPointerDown  = function (event, pickResult){
        //cameraRediusController.endMove();
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
    const deltaTime = engine.getDeltaTime() / 1000;
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



