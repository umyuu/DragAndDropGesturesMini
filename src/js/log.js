
	'use strict';
    class LogHandler {
        // Logクラス
        // 開発時のデバック出力用
        // F12キーで開発者ツールを呼び出せます。
        // □Usage.
        //   Log.v('tag', 'message');
        constructor() {
            this.LEVEL = Object.freeze({
                VERBOSE: 1,
                DEBUG: 2,
                ERROR: 4,
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
            //@param level ログ出力レベル
            //Log.LEVELに引数の値が存在するかのassertチェック
            console.assert(Object.entries(this.LEVEL).find(o => o[1] === level) != undefined, arguments);
            this.level = level;
        }
        v(tag, msg) {
            // ログ出力レベル：verbose
            //@param tag タグ
            //@param msg メッセージ
            if(this.level > this.LEVEL.VERBOSE) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', this.STYLE.TAG, tag, msg);
        }
        d(tag, msg) {
            // ログ出力レベル：debug
            //@param tag タグ
            //@param msg メッセージ
            if(this.level > this.LEVEL.DEBUG) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', this.STYLE.TAG, tag, msg);
        }
        e(tag, msg) {
            // ログ出力レベル：error
            // console.errorに出力
            //@param tag タグ
            //@param msg メッセージ
            if(this.level > this.LEVEL.ERROR) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.error('%c%s', this.STYLE.TAG, tag, msg);
        }
    }
    const Log = new LogHandler();