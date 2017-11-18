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
    header() {
        let ele = undefined;
        let a = document.createElement('A');
        a.href = this.Manifest.homepage_url;
        a.target = '_blank';
        a.textContent = this.Manifest.description;
        ele = document.querySelector('#title');
        ele.appendChild(a);
        
        ele = document.querySelector('#version');
        ele.textContent = this.Manifest.version;
    }
    content(){
        let save = document.querySelector('#save');
        save.addEventListener('click', (e) => {
            localStorage['message'] = 'test';
        });
    }
    footer(){
        let creation_date = document.querySelector('#creation_date');
        creation_date.textContent = this.creation_date;
    }
}
document.addEventListener('DOMContentLoaded', (event) => {
    let popup = new Popup();
    popup.header();
    popup.content();
    popup.footer();
});