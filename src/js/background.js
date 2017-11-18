(function()
{
	'use strict';
    // ref
    // Ignore <a download> for cross origin URLs
    // https://bugs.chromium.org/p/chromium/issues/detail?id=714373
    class Resources {
        static fetch(url) {
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
    class Background {
        constructor() {
            this.creation_date = new Date();
            // setting.json data.
            this.data = undefined;
            this.assignEventHandlers();
        }
        assignEventHandlers(){
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if(request.type === 'load'){
                    // async
                    Resources.fetch(request.url).then(res => {
                        this.data = JSON.parse(res);
                        let param = this.getResponseResult(request, STATUS.OK);
                        param = Object.assign(param, {data: this.data});
                        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                            chrome.tabs.sendMessage(tabs[0].id, param, () => {});
                        });
                    }).catch(e => {
                        console.error(e);
                        let param = this.getResponseResult(request, STATUS.NG);
                        param = Object.assign(param, {data: undefined});
                        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                            chrome.tabs.sendMessage(tabs[0].id, param, () => {});
                        });
                    });
                    sendResponse(this.getResponseResult(request, STATUS.OK));
                    return;
                }
                if(request.type === 'onDownload'){
                    chrome.downloads.download({
                        url: request.url, filename: request.filename
                    });
                    sendResponse(this.getResponseResult(request, STATUS.OK));
                    return;
                }
                sendResponse(this.getResponseResult(request, STATUS.OK));
                return;
	       });
        }
        getResponseResult(request, status){
            return {type:request.type, request:request, status: status};
        }
    }
    let back = new Background();
})();