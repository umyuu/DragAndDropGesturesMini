//@gestures.js
(function()
{
	'use strict';
    class DownloadLink {
        constructor(src_attr, setting) {
            this.src_attr = src_attr;
            console.assert(!this.isEmpty(), arguments);
            this.twitter = setting.twitter;
            // basepathのみ
            this.basepath_array = src_attr.split('/');
            const filename = this.basepath_array.pop();
            let isTwitter = src_attr.startsWith(this.twitter.domain);
            if(isTwitter) {
                this.parse_domain_Twitter(filename);
            }else {
                this.href = src_attr;
                // filename
                this.download = filename;
            }
            Object.seal(this);
        }
        parse_domain_Twitter(filename) {
            // ドメインがTwitterならorig画像を探してダウンロード。
            //@param {string}filename URLのfilename部分
            // | exsample.jpg        => exsample.jpg:orig
            // | exsample.jpg:orig   => exsample.jpg:orig
            // | exsample.jpg:small  => exsample.jpg:orig
            
            // :small部分を削除(pop)して、:origを追加
            let scale_array = filename.split(':');
            if(scale_array.length >= 2) {
                scale_array.pop();
            }
            this.href = this.basepath_array.concat(
                scale_array.toString() + this.twitter.orig).join('/');
            this.download = scale_array.toString();
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
            Object.seal(this);
        }
        assignEventHandler(){
            this.func['onDownload'] = (request, sender, sendResponse) => {
                Log.d('net', request);
                let param = new BPResponse(request.type);
                param.sendAction(sendResponse);
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
            param.href = chrome.extension.getURL('resources/setting.json');
            Log.d('net', param);
            chrome.runtime.sendMessage(param, (response) => {
                let data = response;
                if(data === undefined) {
                    return;
                }
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
                param.href = link[0];
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