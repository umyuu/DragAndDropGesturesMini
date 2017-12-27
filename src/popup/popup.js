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
        Object.seal(this);
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
                const attr = selector.getAttribute(i18n_content);
                selector.textContent = chrome.i18n.getMessage(attr);
            }
        }
        // header
        {
            const name = document.querySelector('#name');
            name.href = this.Manifest.homepage_url;
            name.textContent = this.Manifest.name;
            const version = document.querySelector('#version');
            version.textContent = this.Manifest.version;
        }
        //content
        {
            const save = document.querySelector('#save');
            save.addEventListener('click', (e) => {
                chrome.downloads.showDefaultFolder();
            }, false);
            const open = document.querySelector('#open');
            open.addEventListener('click', (e) => {
                chrome.downloads.showDefaultFolder();
            }, false);
        }
        //footer
        {
            const creation_date = document.querySelector('#creation_date');
            creation_date.textContent = this.creation_date;
        }
    }
}
document.addEventListener('DOMContentLoaded', (event) => {
    Log.setLevel(Log.LEVEL.OFF);
    const popup = new Popup();
    popup.generate();
    const clipboard = new Clipboard('#copy_button');
    clipboard.on('success', (e) => {
        e.clearSelection();
    });
});