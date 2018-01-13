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
        onDownloadFile(url, filename) {
            //@param url       ダウンロード対象URL
            //@param filename  保存ファイル名
            return new Promise((resolve, reject) => {
                const param = { url: url, filename: filename};
                Log.v('download', param);
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
        get(request, sender, sendResponse) {
            const href = request.href;
            if(href.startsWith('chrome-extension://')) {
                //◆ref
                // Fetch API
                // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
                // async => awaitの即時関数
                (async() => {
                    const csResponse = new CSResponse(request.type);
                    csResponse.request = request;
                    
                    try{
                        const response = await fetch(href);
                        csResponse.status = response.status;
                        if(response.ok) {
                            csResponse.payload = await response.json();
                        }
                    } catch(err) {
                        csResponse.status = STATUS.NG;
                        csResponse.err = err;
                    }
                    csResponse.sendAction(sendResponse);
                })();
            } else {
                //(async() => {
                //    let param = { url: request.url, filename: request.filename};
                //    Log.v('download', param);
                //    let downloadId = await chrome.downloads.download(param);
                ///    Log.v('download', downloadId);
                //})();
                
                
                
                this.onDownloadFile(href, request.filename).then(res => {
                    //@param res     undefined ダウンロード失敗時
                    //◆ref
                    // https://developer.chrome.com/extensions/downloads#method-download
                    let message = new CSRequest('onDownload');
                    message.dst = sender.tab.id;
                    message.payload = res;
                    message.request = request;
                    if(res === undefined) {
                        message.status = STATUS.NG;
                        message.err = chrome.runtime.lastError;
                    }
                    message.sendMessage();
                }).catch(err => {
                    Log.e('net', err);
                    let message = new CSRequest('onDownload', STATUS.NG);
                    message.dst = sender.tab.id;
                    message.err = chrome.runtime.lastError;
                    message.sendMessage();
                });
                const csResponse = new CSResponse(request.type);
                csResponse.request = request;
                csResponse.sendAction(sendResponse);
            }
        }
    }
    
    //chrome.runtime.onInstalled.addListener(details => {
        //console.log('previousVersion', details.previousVersion);
        let background = undefined;
        // async function
        //chrome.storage.local.get('Log_LEVEL', (items) => {
        //    const log_level = items.Log_LEVEL || Log.LEVEL.OFF;
            //string->int変換
            //Log.setLevel(+log_level);
            Log.setLevel(Log.LEVEL.OFF);
            background = new Background();
        //});
        
    //});
})();