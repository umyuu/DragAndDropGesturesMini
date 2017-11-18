
	'use strict';
    class Resources {
        static fetch(url, timeout = 2000) {
            //@param {string}url: ダウンロード対象URL
            // manifest.json   …   web_accessible_resources
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.timeout = timeout;
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