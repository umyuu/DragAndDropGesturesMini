(function()
{
	'use strict';
    // ref
    // Ignore <a download> for cross origin URLs
    // https://bugs.chromium.org/p/chromium/issues/detail?id=714373
    class Resources {
        static get(url) {
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
    class DownloadLink {
        constructor(src_attr, domain) {
            this.src_attr = src_attr;
            if(this.isEmpty()){
                return;
            }
            this.href = src_attr;
            var filename = src_attr.split('/').pop();
            var isTwitter = src_attr.startsWith(domain);
            // ドメインがTwitterならlarge画像を探してダウンロード。
            if(isTwitter) {
                // :largeファイルでは無い時。
                var fileExt = filename.split('.').pop();
                if(!fileExt.endsWith(':large')) {
                    this.href = this.href + ":large";
                } else {
                    filename = filename + '.' + fileExt.replace(/:large/g, '');
                }
            }
            // filename
            this.download = filename;
        }
        isEmpty() {
            return this.src_attr === undefined;
        }
    }
    class MouseGestures {
        constructor() {
            this.data = undefined;
            window.addEventListener('dragend', e => { this.ondragend(e); }, false);
            Resources.get(chrome.extension.getURL('resources/setting.json')).then(res => {
                this.data = JSON.parse(res);
                console.log(this.data);
            }).catch(e => {
                console.error(e);
            });
        }
        async ondragend(e) {
            //var st = window.performance.now();
            const target = e.target;
            this.onDownload(target);
            if(target.parentElement.tagName.toUpperCase() === 'A'){
                this.onDownload(target.parentElement);
            }
            //var ed = window.performance.now() - st;
            //console.log(ed);
        }
        onDownload(target){
            var src_attr = target.src || target.href;
            if (src_attr === undefined) {
                return;
            }
            const link = new DownloadLink(src_attr, this.data['twitter']);
            const element = document.createElement('a');
            element.href = link.href;
            // filename
            element.download = link.download;
            element.click();
            //const param = {url: link.href, filename: link.download};
            //chrome.runtime.sendMessage(param);
            //browser.downloads.download({
            //    url: link.href, 
            //    filename: link.download
            //});
        }
    }
    window.ext_mg = new MouseGestures();
})();