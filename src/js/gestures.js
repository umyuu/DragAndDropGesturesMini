//@gestures.js
(function()
{
	'use strict';
    // 
    let Setting = undefined;
    class DownloadLink {
        constructor(src_attr) {
            this.src_attr = src_attr;
            console.assert(!this.validated, arguments);
            // basepathのみ
            this.basepath_array = src_attr.split('/');
            const filename = this.basepath_array.pop();
            let isTwitter = src_attr.startsWith(Setting.twitter.domain);
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
                scale_array.toString() + Setting.twitter.orig).join('/');
            this.download = scale_array.toString();
        }
        get validated() {
            return this.src_attr === undefined;
        }
    }
    class MouseGestures {
        constructor() {
            this.func = {};
            this.assignEventHandler();
            Object.seal(this);
        }
        assignEventHandler(){
            this.func['onDownload'] = (request, sender, sendResponse) => {
                Log.d('net', request);
                const param = new BPResponse(request.type);
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
            const param = new BPRequest('GET');
            param.href = chrome.extension.getURL('resources/setting.json');
            param.sendMessage((response) => {
                let data = response;
                if(data === undefined) {
                    return;
                }
                if(data.status === STATUS.NG) {
                    Log.e('net', data);
                }else {
                    Log.d('net', data); 
                }
                Setting = data.payload;
            });
        }
        ondragend(e) {
            //EntryPoint
            //var st = window.performance.now();
            const target = e.target;
            if(Setting === undefined) {
                return;
            }
            console.assert(target != undefined);
            const linkMap = new Map(); // <url, filename>
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
            const src_attr = target.src || target.href;
            if (src_attr === undefined) {
                return;
            }
            const link = new DownloadLink(src_attr);
            linkMap.set(link.href, link.download);
        }
        onDownload(linkMap) {
            for (const [key, value] of linkMap) {
                const param = new BPRequest('GET');
                param.href = key;
                param.filename = value;
                try{
                    param.sendMessage((response) => {
                        let data = response;
                        Log.d('net', data);
                    });
                } catch (err) {
                    Log.e('net', err);
                }
            }
        }
    }
    chrome.storage.local.get('Log_LEVEL', (items) => {
        const log_level = items.Log_LEVEL || Log.LEVEL.OFF;
        //string->int変換
        Log.setLevel(+log_level);
        const gestures = new MouseGestures();
        gestures.pageLoad();
    });
})();