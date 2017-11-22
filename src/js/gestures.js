//@gestures.js
(function()
{
	'use strict';
    class DownloadLink {
        constructor(src_attr, setting) {
            this.src_attr = src_attr;
            if(this.isEmpty()){
                return;
            }
            let twitter = setting.twitter;
            let domain = twitter.domain;
            let suffix_large = twitter.large;
            this.href = src_attr;
            let filename = src_attr.split('/').pop();
            let isTwitter = src_attr.startsWith(domain);
            // ドメインがTwitterならlarge画像を探してダウンロード。
            if(isTwitter) {
                var fileExt = filename.split('.').pop();
                if(fileExt.endsWith(suffix_large)) {
                    filename = filename.replace(/:large/g, suffix_large.replace(':', '_')) + '.' + fileExt.replace(/:large/g, '');
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
            this.assignEventHandler();
        }
        assignEventHandler(){
            this.func['onDownload'] = (request, sender, sendResponse) => {
                Log.d('net', request);
                //let param = new BPResponse(request.type);
                //param.sendAction(sendResponse);
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
            let param = new BPRequest('GET');
            param.url = chrome.extension.getURL('resources/setting.json');
            Log.d('net', param);
            chrome.runtime.sendMessage(param, (response) => {
                let data = response;
                
                if(data.status === STATUS.NG) {
                    Log.e('net', data);
                }else {
                    Log.d('net', data); 
                }
                this.Setting = data.payload;
            });
        }
        ondragend(e) {
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
                const param = new BPRequest('GET');
                param.url = link[0];
                param.filename = link[1];
                // ダウンロードメッセージを発火
                try{
                    Log.d('net', param);
                    chrome.runtime.sendMessage(param, (response) => {
                        let data = response;
                        Log.d('net', data);
                    });
                } catch (err) {
                    Log.e('net', err);
                }
            }
        }
    }
    Log.setLevel(Log.LEVEL.VERBOSE);
    let gestures = new MouseGestures();
    gestures.pageLoad();
})();