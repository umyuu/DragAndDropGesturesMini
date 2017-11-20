//@popup.js
'use strict';
class Config {
    constructor() {
        this.version = 1;
    }
    toData(){
        return {version:this.version};
    }
}
class Popup {
    constructor() {
        this.Manifest = chrome.runtime.getManifest();
        this.creation_date = new Date();
    }
    generate(){
        // header
        {
            let ele = undefined;
            let a = document.createElement('A');
            a.href = this.Manifest.homepage_url;
            a.target = '_blank';
            a.textContent = this.Manifest.name;
            ele = document.querySelector('#title');
            ele.appendChild(a);
        
            ele = document.querySelector('#version');
            ele.textContent = this.Manifest.version;
        }
        //content
        {
            let save = document.querySelector('#save');
            save.textContent = chrome.i18n.getMessage('popup_Button_Save');
            save.addEventListener('click', (e) => {
                chrome.downloads.showDefaultFolder();
            }, false);
            let open = document.querySelector('#open');
            open.textContent = chrome.i18n.getMessage('popup_Button_Open');
            open.addEventListener('click', (e) => {
                chrome.downloads.showDefaultFolder();
            }, false);
        }
        //footer
        {
            let creation_date = document.querySelector('#creation_date');
            creation_date.textContent = this.creation_date;
            let copy_button = document.querySelector('#copy_button');
            copy_button.textContent = chrome.i18n.getMessage('popup_Button_Copy');
        }
    }
}
document.addEventListener('DOMContentLoaded', (event) => {
    Log.setLevel(Log.LEVEL.DEBUG);
    let popup = new Popup();
    popup.generate();
    let clipboard = new Clipboard('#copy_button');
    clipboard.on('success', (e) => {
        e.clearSelection();
    });
});