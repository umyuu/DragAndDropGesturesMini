(function()
{
	'use strict';
    class Background {
        constructor() {
            this.creation_date = new Date();
            this.assignEventHandler();
            Object.seal(this);
        }
        assignEventHandler(){
            // chrome event hander.
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.get(request, sender, sendResponse);
                return true;
            });
        }
        /**
         * @param {string} url          ダウンロード対象URL
         * @param {string} filename     保存ファイル名
        */
        onDownloadFile(url, filename) {
            return new Promise((resolve, reject) => {
                const param = { url: url, filename: filename};
                Log.v(this.onDownloadFile.name, param);
                /**
                 * @see https://developer.chrome.com/extensions/downloads#method-download
                 */
                chrome.downloads.download(param, (e) => {
                    try{
                        resolve(e); 
                    } catch(err) {
                        reject(err);
                    }
                });
            });
        }
        //@public
        /**
         * @param {BPRequest} request
         * @param {MessageSender} sender
         * @param {function} sendResponse
        */
        async get(request, sender, sendResponse) {
            const href = request.href;
            const csResponse = new CSResponse(request.type);
            csResponse.request = request;
            MessageQueue.sendAction(csResponse, sendResponse);
            let message = new CSRequest('onDownload');
            message.dst = sender.tab.id;
            try{
                /**
                 * @param payload     undefined ダウンロード失敗時
                 * @see https://developer.chrome.com/extensions/downloads#method-download
                */
                message.payload = await this.onDownloadFile(href, request.filename);
                message.request = request;
                if(message.payload === undefined) {
                    message.status = STATUS.NG;
                    message.err = chrome.runtime.lastError;
                }
            }catch(err) {
                Log.e('net', err);
                message.status = STATUS.NG;
                message.err = chrome.runtime.lastError;
            }
            await MessageQueue.sendMessage(message, () => {});
        }
    }
    
    let background = undefined;
    (async() => {
        const log_level = await Configure.get("Log_LEVEL") || Log.LEVEL.OFF;
        //string->int変換
        Log.setLevel(+log_level);
        //Log.setLevel(Log.LEVEL.OFF);
        background = new Background();
    })();
})();