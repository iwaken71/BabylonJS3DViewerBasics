import * as GUI from 'babylonjs-gui';


export class UIController {
    panel;picker;checkbox;
    radioButtons = []
    constructor(){

    }

    AddEventOnPickerValueChanged(func){
        this.picker.onValueChangedObservable.add(func);
    }
    AddEventOnIsCheckBoxChanged(func){
        this.checkbox.onIsCheckedChangedObservable.add(func);
    }
    AddRadio(text) {
        var button = new GUI.RadioButton();
        this.radioButtons.push(button);
        button.width = "20px";
        button.height = "20px";
        button.color = "white";
        button.background = "green";

        button.onIsCheckedChangedObservable.add(function(state) {
            if (state) {
                console.log(state);
            }
        });

        var header = GUI.Control.AddHeader(button, text, "100px", { isHorizontal: true, controlFirst: true });
        header.height = "30px";
        this.panel.addControl(header);
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
        var textBlock = new GUI.TextBlock();
        textBlock.text = "Scene Color";
        textBlock.height = "30px";
        this.panel.addControl(textBlock);
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
        var header = GUI.Control.AddHeader(this.checkbox, "Solid Mode", "100px", { isHorizontal: true, controlFirst: true });
        header.height = "30px";
        this.panel.addControl(this.picker);
        this.panel.addControl(header);
    }
}