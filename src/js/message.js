	'use strict';
    const STATUS = Object.freeze({
        OK: 200,
        NG: 400,
    });
    class Message {
        /**
         * Message クラス
         * 概要：content scriptとbackground script 間のデータ受け渡しに使用。
         * @see https://developer.chrome.com/extensions/messaging
         * @param {string} type メッセージ特定を特定するための文字列
         * @param {number} mask
         *    0:background script → content script
         *                      1:content script → background script
        */
        constructor(type, mask = 1) {
            this.type = type;
            this.mask = mask; 
            // メッセージ生成日時(デバック用)
            this.date = new Date().toISOString();
        }
    }
    class BPRequest extends Message {
        /**
         * @param {string} type
        */
        constructor(type) {
            super(type);
        }
    }
    class BPResponse extends Message {
        /**
         * @param {string} type
        */
        constructor(type) {
            super(type);
        }
    }
    class CSRequest extends Message {
        /**
         * @param {string} type
         * @param {STATUS} status ステータスコード
        */
        constructor(type, status = STATUS.OK) {
            super(type, 0);
            // content scriptの宛先 実体はtab id
            this.dst = undefined;
            this.status = status;
            this.payload = undefined;
        }
    }
    class CSResponse extends Message {
        /**
         * @param {string} type
         * @param {STATUS} status
        */
        constructor(type, status = STATUS.OK) {
            super(type, 0);
            this.status = status;
        }
    }
    class MessageQueue {
        /**
         * メッセージを送信
         * @param {BPRequest|CSRequest} msg
         * @returns {Promise} async
        */
       static sendMessage(msg) {
            return new Promise((resolve) => {
                Log.d(this.sendMessage.name, msg);
                if(msg.dst === undefined){
                    chrome.runtime.sendMessage(msg, () => resolve());
                }else {
                    // background script => content script
                    console.assert(msg.mask === 0, msg);
                    chrome.tabs.sendMessage(msg.dst, msg, () => resolve());
                }
            });
        }
        /**
         * @param {BPResponse|CSResponse} msg
         * @param {function} callback
        */
        static sendAction(msg, callback) {
            console.assert(callback != undefined, arguments);
            Log.v(this.sendAction.name, msg);
            callback(msg);
        }
    }

