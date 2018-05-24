
	'use strict';
    class Configure {
        /**
         * @param {object} key
        */
        static get(key = null) {
            return new Promise((resolve) => {
                chrome.storage.local.get(key, (item) => {
                    key ? resolve(item[key]) : resolve(item);
                });
            });
        }
        /**
         * @param {object} items
        */
       static set(items) {
            return new Promise((resolve) => {
                chrome.storage.local.set(items, () => resolve());
            });
        }
    }