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
        constructor() {
            this.Setting = undefined;
            this.func = {};
            this.assignEventHandlers();
        }
        assignEventHandlers(){
            this.func['load'] = (request, sender, sendResponse) => {
                Log.d('net', request);
                // 設定
                this.Setting = request.payload;
                let param = MessageFactory.create(request.type);
                sendResponse(param);
            };
            this.func['onDownload'] = (request, sender, sendResponse) => {
                Log.d('net', request);
                let param = MessageFactory.create(request.type);
                sendResponse(param);
            };
            // background script => contents script callback.
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.func[request.type](request, sender, sendResponse);
                return true;
            });
            window.addEventListener('dragend', e => { this.ondragend(e); }, false); 
        }
        pageLoad() {
            // 設定ファイル情報を取得
            let param = MessageFactory.create('load', 
                                              {url: chrome.extension.getURL('resources/setting.json')});
            
            chrome.runtime.sendMessage(param, e => { Log.d('net', e); });
        }
        async ondragend(e) {
            //EntryPoint
            //var st = window.performance.now();
            const target = e.target;
            if(this.Setting === undefined) {
                return;
            }
            console.assert(target != undefined);
            let linkMap = new Map(); // <url, filename>
            // ダウンロード1回目
            this.parseLink(target, linkMap);
            // IMGタグがAタグで囲まれていたら、Aタグ側もダウンロード
            if(target.parentElement.tagName.toUpperCase() === 'A'){
                this.parseLink(target.parentElement, linkMap);
            }
            
            this.onDownload(linkMap);
            //var ed = window.performance.now() - st;
            //console.log(ed);
        }
        parseLink(target, linkMap) {
            let src_attr = target.src || target.href;
            if (src_attr === undefined) {
                return;
            }
            const link = new DownloadLink(src_attr, this.Setting);
            linkMap.set(link.href, link.download);
        }
        onDownload(linkMap) {
            for(let link of linkMap.entries()) {
                const param = MessageFactory.create('onDownload',
                                                    {url: link[0], filename: link[1]});
                // ダウンロードメッセージを発火
                try{
                    chrome.runtime.sendMessage(param, e => { Log.d('net', e); });
                } catch (ex) {
                    Log.e('net', ex);
                }
            }
        }
    }
    Log.setEnabled(true);
    let gestures = new MouseGestures();
    gestures.pageLoad();
})();