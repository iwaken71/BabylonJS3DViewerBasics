import * as GUI from 'babylonjs-gui';

export class UIController {
  panel;picker;checkbox;checkbox2;
  constructor(){

  }

  AddEventOnPickerValueChanged(func){
      this.picker.onValueChangedObservable.add(func);
  }
  AddEventOnIsCheckBox1Changed(func){
      this.checkbox.onIsCheckedChangedObservable.add(func);
  }
  AddEventOnIsCheckBox2Changed(func){
      this.checkbox2.onIsCheckedChangedObservable.add(func);
  }

  CreateUI(scene){
      var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
      this.panel = new GUI.StackPanel();
      this.panel.width = "200px";
      this.panel.isVertical = true;
      this.panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      this.panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      this.panel.top = 100;
      advancedTexture.addControl(this.panel);
      this.picker = new GUI.ColorPicker();
      this.picker.value = scene.clearColor;
      this.picker.height = "150px";
      this.picker.width = "150px";
      this.picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      this.checkbox = new GUI.Checkbox();
      this.checkbox.width = "20px";
      this.checkbox.height = "20px";
      this.checkbox.isChecked = true;
      this.checkbox.color = "green";
      this.checkbox2 = new GUI.Checkbox();
      this.checkbox2.width = "20px";
      this.checkbox2.height = "20px";
      this.checkbox2.isChecked = true;
      this.checkbox2.color = "green";
      this.panel.addControl(this.checkbox);
      this.panel.addControl(this.checkbox2);
      this.panel.addControl(this.picker);
  }
}
