import * as BABYLON from 'babylonjs';
import {Engine,Scene,ArcRotateCamera,Vector3,SceneLoader,ExecuteCodeAction,ActionManager,MeshBuilder,StandardMaterial,Color3,DefaultRenderingPipeline,Scalar,Texture,CubeTexture} from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-loaders';

export class CameraRediusController {
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
export class CameraTargetController {
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

export class EnvironmentController {
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
      var skybox = MeshBuilder.CreateBox("skyBox", {size:1000}, this.#scene);
      var skyboxMaterial = new StandardMaterial("skyBox", this.#scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new CubeTexture(envfilePath, this.#scene);
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