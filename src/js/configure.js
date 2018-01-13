
	'use strict';
    class Configure {
        constructor() {
            this.KEY = Object.freeze({
                "Log_LEVEL": "Log_LEVEL",
            });
        }
        get(key, callback) {
            chrome.storage.local.get(key, callback);
        }
    }
