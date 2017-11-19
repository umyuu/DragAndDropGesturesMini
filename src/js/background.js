(function()
{
	'use strict';
    const STATUS = {
        OK: 200,
        NG: 400,
    };
    class Message {
        // Message クラス
        // 概要：background script => content script間のデータ受け渡しに使用。
        // ◆ref
        // https://developer.chrome.com/extensions/messaging
        constructor(type, status = STATUS.OK) {
            //@param {string}type メッセージ特定を特定するための文字列
            //@param {enum}status ステータスコード
            this.type = type;
            this.status = status;
            // content scriptの宛先 実体はtab id
            this.dst = undefined;
            // メッセージ作成日時(デバック用)
            this.creation_date = new Date();
        }
        static toContentScript(){
            return;
        }
        send(param = undefined){
            //@param {object}param メッセージボディ
            var sendParams = Object.assign(this.toData(), param);
            // background script => content script
            console.assert(this.dst != undefined);
            chrome.tabs.sendMessage(this.dst, sendParams, () => {});
        }
        toData(){
            //@return {object}
            return {type:this.type, status:this.status};
        }
    }
    class Background {
        constructor() {
            this.creation_date = new Date();
            // setting.json data.
            this.data = undefined;
            this.assignEventHandler();
        }
        assignEventHandler(){
            // chrome event hander.
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.get(request, sender, sendResponse);
                return true;
            });
        }
        onDownload(url, filename) {
            //@param url       ダウンロード対象URL
            //@param filename  保存ファイル名
            return new Promise((resolve, reject) => {
                let param = { url: url, filename: filename};
                Log.v('download', param);
                chrome.downloads.download(param, (e) => {
                    resolve(e);   
                });
            });
        }
        status(response) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        }
        json(response) {
            return response.json()
        }
        //@public
        get(request, sender, sendResponse) {
            if(request.url.startsWith('chrome-extension://')) {
                //◆ref
                // Fetch API
                // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
                // async
                fetch(request.url)
                    .then(this.status)
                    .then(this.json)
                    .then((data) => {
                        this.data = data;
                        let message = new Message('load');
                        message.dst = sender.tab.id;
                        // 設定ファイル情報をコンテンツスクリプト側に送信
                        message.send({payload: this.data});
                    }).catch((ex) => {
                        Log.e('net', ex);
                        let message = new Message('load', STATUS.NG);
                        message.dst = sender.tab.id;
                        message.send({payload: undefined});
                    });
                let response = new Message('load');
                sendResponse(Object.assign(response.toData(), {request:request}));
            } else {
                this.onDownload(request.url, request.filename).then(res => {
                    //@param res     undefined ダウンロード失敗時
                    //◆ref
                    // https://developer.chrome.com/extensions/downloads#method-download
                    let message = new Message('onDownload');
                    message.dst = sender.tab.id;
                    if(res === undefined){
                        message.status = STATUS.NG;
                        message.send({payload: chrome.runtime.lastError});
                        return;
                    }
                    message.send({payload: res});
                }).catch(ex => {
                    Log.e('net', ex);
                    let message = new Message('onDownload', STATUS.NG);
                    message.dst = sender.tab.id;
                    message.send({payload: chrome.runtime.lastError});
                });
                let response = new Message('onDownload');
                let param = Object.assign(response.toData(), {request:request});
                Log.d('net', param);
                sendResponse(param);sendResponse
            }
        }

    }
    Log.setEnabled(true);
    let back = new Background();
})();