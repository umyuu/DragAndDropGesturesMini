
	'use strict';
    class LogHandler {
        /**
         * Logクラス
         * 用途：開発時のデバック出力用
         * F12キーで開発者ツールを呼び出せます。
         * □Usage.
         *  Log.v('tag', 'message');
         */
        constructor() {
            this.LEVEL = Object.freeze({
                ALL: 1,//special level
                VERBOSE: 2,
                DEBUG: 4,
                INFO: 8,
                WARN: 16,
                ERROR: 32,
                OFF : 256,//special level
            });
            this.STYLE = Object.freeze({
                TAG : 'color:red;background-color:#f7f7f7;',
                MSG : 'color:black;background-color:white;'
            });
            this.setLevel(this.LEVEL.OFF);
            Object.seal(this);
        }
        /**
         * @param {number} level   ログ出力レベル
        */
        setLevel(level) {
            //Log.LEVELに引数の値が存在するかのassertチェック
            console.assert(Object.entries(this.LEVEL).find(o => o[1] === level) != undefined, arguments);
            this.level = level;
        }
        /**
         * ログ出力レベル：verbose
         * @param {string}tag タグ
         * @param {string}msg メッセージ
        */
        v(tag, msg) {
            if(!this.enabledFor(this.LEVEL.VERBOSE)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', this.STYLE.TAG, tag, msg);
        }
        /**
         * ログ出力レベル：debug
         * @param {string}tag タグ
         * @param {string}msg メッセージ
        */
        d(tag, msg) {
            if(!this.enabledFor(this.LEVEL.DEBUG)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', this.STYLE.TAG, tag, msg);
        }
        /**
         * ログ出力レベル：info
         * @param {string}tag タグ
         * @param {string}msg メッセージ
        */
        i(tag, msg) {
            if(!this.enabledFor(this.LEVEL.INFO)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.info('%c%s', this.STYLE.TAG, tag, msg);
        }
        /**
         * ログ出力レベル：error
         * console.warnに出力
         * @param {string}tag タグ
         * @param {string}msg メッセージ
        */
        w(tag, msg) {
            if(!this.enabledFor(this.LEVEL.WARN)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.warn('%c%s', this.STYLE.TAG, tag, msg);
        }
        /**
         * ログ出力レベル：error
         * console.errorに出力
         * @param {string}tag タグ
         * @param {string}msg メッセージ
        */
        e(tag, msg) {
            if(!this.enabledFor(this.LEVEL.ERROR)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.error('%c%s', this.STYLE.TAG, tag, msg);
        }
        /**
         * fatal error assert.
         * @param {string}tag タグ
         * @param {string}msg メッセージ
        */
        wtf(tag, msg) {
            console.assert(false, arguments);
        }
        /**
         * @private
         * @param {number}level
        */
        enabledFor(level) {
            return this.level < level;
        }
    }
    const Log = new LogHandler();