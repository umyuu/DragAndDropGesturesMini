(function()
{
	'use strict';
    class Background {
        constructor() {
            this.creation_date = new Date();
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
            if(request.url.startsWith('chrome-extension://')) {
                //◆ref
                // Fetch API
                // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
                // async => await
                (async() => {
                    const csResponse = new CSResponse(request.type);
                    csResponse.request = request;
                    
                    try{
                        const response = await fetch(request.url);
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
                
                
                
                this.onDownload(request.url, request.filename).then(res => {
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
                    message.send();
                }).catch(err => {
                    Log.e('net', err);
                    let message = new CSRequest('onDownload', STATUS.NG);
                    message.dst = sender.tab.id;
                    message.err = chrome.runtime.lastError;
                    message.send();
                });
                const csResponse = new CSResponse(request.type);
                csResponse.request = request;
                csResponse.sendAction(sendResponse);
            }
        }
    }
    
    chrome.runtime.onInstalled.addListener(details => {
        console.log('previousVersion', details.previousVersion);
        Log.setLevel(Log.LEVEL.VERBOSE);
        let back = new Background();
    });
})();