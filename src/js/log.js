
	'use strict';
    class LogHandler {
        // Logクラス
        // 開発時のデバック出力用
        // F12キーで開発者ツールを呼び出せます。
        // □Usage.
        //   Log.v('tag', 'message');
        constructor() {
            this.LEVEL = Object.freeze({
                VERBOSE: 2,
                DEBUG: 4,
                INFO: 8,
                WARN: 16,
                ERROR: 32,
                OFF : 256,
            });
            this.STYLE = Object.freeze({
                TAG : 'color:red;background-color:#f7f7f7;',
                MSG : 'color:black;background-color:white;'
            });
            this.setLevel(this.LEVEL.OFF);
            Object.seal(this);
        }
        setLevel(level) {
            //@param {int}level ログ出力レベル
            //Log.LEVELに引数の値が存在するかのassertチェック
            console.assert(Object.entries(this.LEVEL).find(o => o[1] === level) != undefined, arguments);
            this.level = level;
        }
        v(tag, msg) {
            // ログ出力レベル：verbose
            //@param tag タグ
            //@param msg メッセージ
            if(this.enabledFor(this.LEVEL.VERBOSE)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', this.STYLE.TAG, tag, msg);
        }
        d(tag, msg) {
            // ログ出力レベル：debug
            //@param tag タグ
            //@param msg メッセージ
            if(this.enabledFor(this.LEVEL.DEBUG)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', this.STYLE.TAG, tag, msg);
        }
        i(tag, msg) {
            // ログ出力レベル：info
            // console.infoに出力
            //@param tag タグ
            //@param msg メッセージ
            if(this.enabledFor(this.LEVEL.INFO)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.info('%c%s', this.STYLE.TAG, tag, msg);
        }
        w(tag, msg) {
            // ログ出力レベル：error
            // console.warnに出力
            //@param tag タグ
            //@param msg メッセージ
            if(this.enabledFor(this.LEVEL.WARN)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.warn('%c%s', this.STYLE.TAG, tag, msg);
        }
        e(tag, msg) {
            // ログ出力レベル：error
            // console.errorに出力
            //@param tag タグ
            //@param msg メッセージ
            if(this.enabledFor(this.LEVEL.ERROR)) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.error('%c%s', this.STYLE.TAG, tag, msg);
        }
        wtf(tag, msg) {
            // fatal error assert.
            console.assert(false, arguments);
        }
        //@private
        enabledFor(level) {
            return this.level > level;
        }
    }
    const Log = new LogHandler();