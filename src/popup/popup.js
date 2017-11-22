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
        {
            // i18n
            // 検索範囲：body要素以下
            // 検索値：data-i18n-contentが属性に存在すること。
            // 処理：上記属性が存在時に_locales/(ロケール名)/message.json よりメッセージを取得しtextContentに設定
            for (let selector of document.querySelectorAll('body *')) {
                const i18n_content = 'data-i18n-content';
                if(!selector.hasAttribute(i18n_content)) {
                    continue;
                }
                let attr = selector.getAttribute(i18n_content);
                selector.textContent = chrome.i18n.getMessage(attr);
            }
        }
        // header
        {
            let ele = undefined;
            let a = document.createElement('a');
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
            save.addEventListener('click', (e) => {
                chrome.downloads.showDefaultFolder();
            }, false);
            let open = document.querySelector('#open');
            open.addEventListener('click', (e) => {
                chrome.downloads.showDefaultFolder();
            }, false);
        }
        //footer
        {
            let creation_date = document.querySelector('#creation_date');
            creation_date.textContent = this.creation_date;
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