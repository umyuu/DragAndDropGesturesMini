//@gestures.js
(function()
{
	'use strict';
    class MessageFactory {
        // Backgroundページに対しての通信メッセージを作成するファクトリークラス。
        // @pattern Factory
        static create(type, options = {}){
            // type:メッセージタイプ
            return Object.assign({type:type}, options);
        }
    }
    class DownloadLink {
        constructor(src_attr, setting) {
            this.src_attr = src_attr;
            if(this.isEmpty()){
                return;
            }
            var twitter = setting.twitter;
            var domain = twitter.domain;
            var suffix_large = twitter.large;
            this.href = src_attr;
            let filename = src_attr.split('/').pop();
            let isTwitter = src_attr.startsWith(domain);
            // ドメインがTwitterならlarge画像を探してダウンロード。
            if(isTwitter) {
                var fileExt = filename.split('.').pop();
                if(fileExt.endsWith(suffix_large)) {
                    filename = filename.replace(/:large/g, '_large') + '.' + fileExt.replace(/:large/g, '');
                } else {
                    this.href = this.href + suffix_large;
                }
            }
            // filename
            this.download = filename;
        }
        isEmpty() {
            return this.src_attr === undefined;
        }
    }
    class MouseGestures {
        constructor(isDebug = false) {
            this.isDebug = isDebug;
            this.Setting = undefined;
            // background script => contents script callback.
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if(request.type === 'load'){
                    this.onDebugLog(request);
                    // 設定
                    this.Setting = request.data;
                }
            });
            // 設定ファイル情報を取得
            let param = MessageFactory.create('load', 
                                              {url: chrome.extension.getURL('resources/setting.json')});
            chrome.runtime.sendMessage(param, e => { this.onDebugLog(e); });
            this.assignEventHandlers();
        }
        assignEventHandlers(){
            window.addEventListener('dragend', e => { this.ondragend(e); }, false); 
        }
        async ondragend(e) {
            //var st = window.performance.now();
            const target = e.target;
            if(this.Setting === undefined) {
                return;
            }
            // ダウンロード1回目
            this.onDownload(target);
            // IMGタグがAタグで囲まれていたら、Aタグ側もダウンロード
            if(target.parentElement.tagName.toUpperCase() === 'A'){
                this.onDownload(target.parentElement);
            }
            //var ed = window.performance.now() - st;
            //console.log(ed);
        }
        onDebugLog(response){
            // debug出力がtrueなら出力
            if (this.isDebug){
                console.log(response); 
            }
        }
        onDownload(target){
            let src_attr = target.src || target.href;
            if (src_attr === undefined) {
                return;
            }
            const link = new DownloadLink(src_attr, this.Setting);
            const param = MessageFactory.create('onDownload', {url: link.href, filename: link.download});
            // ダウンロードメッセージを発火
            chrome.runtime.sendMessage(param, e => { this.onDebugLog(e); });
        }
    }
    window.ext_mg = new MouseGestures(true);
    console.log(new Date());
})();