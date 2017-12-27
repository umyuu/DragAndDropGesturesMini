	'use strict';
    const STATUS = Object.freeze({
        OK: 200,
        NG: 400,
    });
    class Message {
        // Message クラス
        // 概要：content scriptとbackground script 間のデータ受け渡しに使用。
        // ◆ref
        // https://developer.chrome.com/extensions/messaging
        constructor(type) {
            //@param {string}type メッセージ特定を特定するための文字列
            this.type = type;
            // mask
            //    0:background script → content script
            //    1:content script → background script
            //    
            this.mask = 1; 
            // メッセージ送信日時(デバック用)
            this.date = new Date().toISOString();
        }
        sendAction(callback){
            console.assert(callback != undefined, arguments);
            Log.v('net', this);
            callback(this);
        }
        
        sendAsnc(callback){
            return new Promise(function(resolve, reject){
                callback(resolve);
            });
        }
    }
    class BPRequest extends Message {
        constructor(type) {
            super(type);
        }
        sendMessage(callback) {
            console.assert(callback != undefined, arguments);
            Log.d('net', this);
            chrome.runtime.sendMessage(this, callback);
        }
    }
    class BPResponse extends Message {
        constructor(type) {
            super(type);
        }
    }
    class CSMessageBase extends Message {
        constructor(type){
            super(type);
            this.mask = 0;
        }
    }

    class CSRequest extends CSMessageBase {
        constructor(type, status = STATUS.OK) {
            //@param {enum}status ステータスコード
            super(type);
            // content scriptの宛先 実体はtab id
            this.dst = undefined;
            this.status = status;
            this.payload = undefined;
        }
        send(){
            // background script => content script
            console.assert(this.dst != undefined, arguments);
            Log.v('net', this);
            chrome.tabs.sendMessage(this.dst, this, () => {});
        }
    }
    class CSResponse extends CSMessageBase {
        constructor(type, status = STATUS.OK) {
            super(type);
            this.status = status;
        }
    }

