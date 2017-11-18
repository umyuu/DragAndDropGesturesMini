(function()
{
	'use strict';
    // ref
    // Ignore <a download> for cross origin URLs
    // https://bugs.chromium.org/p/chromium/issues/detail?id=714373
    class Resources {
        static fetch(url) {
            // url: ダウンロード対象
            // manifest.json   …   web_accessible_resources
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.timeout = 2000;
                xhr.onload = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                };
                xhr.ontimeout = () => {
                    reject(new Error(xhr.statusText));
                };
                xhr.onerror = () => {
                    reject(new Error(xhr.statusText));
                };
                xhr.send(null);
            });
        }
    }
    const STATUS = {
        OK: 200,
        NG: 400,
    };
    class Message {
        // Message クラス
        // 概要：background script => content script間のデータ受け渡しに使用。
        constructor(type, status = STATUS.OK) {
            this.type = type;
            this.status = status;
        }
        send(param = undefined){
            var sendParams = Object.assign(this.toData(), param);
            // background script => content script
            // activeなtabにメッセージを送信
            chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, sendParams, () => {});
            });
        }
        toData(){
            return {type:this.type, status:this.status};
        }
    }
    class Background {
        constructor() {
            this.creation_date = new Date();
            // setting.json data.
            this.data = undefined;
            this.func = {};
            this.assignEventHandlers();
        }
        assignEventHandlers(){
            this.func['load'] = (request, sender, sendResponse) => {
                // async
                Resources.fetch(request.url).then(res => {
                    this.data = JSON.parse(res);
                    let message = new Message(request.type);
                    // 設定ファイル情報をコンテンツスクリプト側に送信
                    message.send({data: this.data});
                }).catch(e => {
                    console.error(e);
                    let message = new Message(request.type, STATUS.NG);
                    message.send({data: undefined});
                });
                let response = new Message(request.type);
                sendResponse(Object.assign(response.toData(), {request:request}));
            };
            this.func['onDownload'] = (request, sender, sendResponse) => {
                chrome.downloads.download({
                    url: request.url, filename: request.filename + ':::aaa'
                }, this._onDownload);
                let response = new Message(request.type);
                sendResponse(Object.assign(response.toData(), {request:request}));
            };
            // chrome event hander.
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.func[request.type](request, sender, sendResponse);
                return true;
            });
        }
        _onDownload(downloadId) {
            //downloadId:undefined ダウンロード失敗時
            //◆ref
            // https://developer.chrome.com/extensions/downloads#method-download
            if(downloadId === undefined){
                let message = new Message('onDownload', STATUS.NG);
                message.send({data: chrome.runtime.lastError});
                return;
            }
        }
    }
    let back = new Background();
})();