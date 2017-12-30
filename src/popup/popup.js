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
    set_i18n() {
        // 検索範囲：body要素以下
        // 検索値：data-i18n-contentが属性に存在すること。
        // 処理：上記属性が存在時に_locales/(ロケール名)/message.json よりメッセージを取得しtextContentに設定
        for (const elementList of document.querySelectorAll('body *')) {
            const i18n_content = 'data-i18n-content';
            if(!elementList.hasAttribute(i18n_content)) {
                continue;
            }
            const attr = elementList.getAttribute(i18n_content);
            elementList.textContent = chrome.i18n.getMessage(attr);
        }
    }
    generate(){
        // set i18n Message
        this.set_i18n();
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
            const loglevel_name = 'loglevel';
            const loglevel_list = document.querySelector('#loglevel_list');
            for(const [key, value] of Object.entries(Log.LEVEL)) {
                const radio = document.createElement('input');
                const id_str = `${loglevel_name}_${value}`;
                radio.id = id_str;
                radio.type = 'radio';
                radio.name = loglevel_name;// Group
                radio.value = value;
                if(Log.LEVEL.OFF === value) {
                    radio.checked = 'checked';
                }
                radio.addEventListener('click', (e) => {
                    const value = e.target.value;
                    chrome.storage.local.set({'Log_LEVEL': value}, (items) => {
                        console.log(`${new Date().toISOString()} setLogLevel:${value}`);
                    });
                }, false);
                loglevel_list.appendChild(radio);
                
                const label = document.createElement('label');
                label.setAttribute('for', id_str);
                label.textContent = key;
                loglevel_list.appendChild(label);
            }
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
    const popup = new Popup();
    let clipboard = undefined;
    chrome.storage.local.get('Log_LEVEL', (items) => {
        const log_level = items.Log_LEVEL || Log.LEVEL.OFF;
        //string->int変換
        Log.setLevel(+log_level);
        popup.generate();
        clipboard = new Clipboard('#copy_button');
        clipboard.on('success', (e) => {
            e.clearSelection();
        });
    });
});