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
        toCS(){
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
            this.func = {};
            this.assignEventHandlers();
        }
        assignEventHandlers(){
            this.func['load'] = (request, sender, sendResponse) => {
                // async
                Resources.fetch(request.url).then(res => {
                    this.data = JSON.parse(res);
                    let message = new Message(request.type);
                    message.dst = sender.tab.id;
                    // 設定ファイル情報をコンテンツスクリプト側に送信
                    message.send({data: this.data});
                }).catch(ex => {
                    console.error(ex);
                    let message = new Message(request.type, STATUS.NG);
                    message.dst = sender.tab.id;
                    message.send({data: undefined});
                });
                let response = new Message(request.type);
                sendResponse(Object.assign(response.toData(), {request:request}));
            };
            this.func['onDownload'] = (request, sender, sendResponse) => {
                this._onDownload(request.url, request.filename).then(res => {
                    //@param res     undefined ダウンロード失敗時
                    //◆ref
                    // https://developer.chrome.com/extensions/downloads#method-download
                    let message = new Message(request.type);
                    message.dst = sender.tab.id;
                    if(res === undefined){
                        message.status = STATUS.NG;
                        message.send({data: chrome.runtime.lastError});
                        return;
                    }
                    message.send({data: res});
                }).catch(ex => {
                    console.error(ex);
                });
                let response = new Message(request.type);
                sendResponse(Object.assign(response.toData(), {request:request}));
            };
            // chrome event hander.
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.func[request.type](request, sender, sendResponse);
                return true;
            });
        }
        _onDownload(url, filename) {
            //@param url       ダウンロード対象URL
            //@param filename  保存ファイル名
            return new Promise((resolve, reject) => {
                chrome.downloads.download({ url: url, filename: filename}, (e) => {
                    resolve(e);   
                });
            });
        }
    }
    let back = new Background();
})();