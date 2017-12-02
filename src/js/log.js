
	'use strict';
    class Log {
        // Logクラス
        // 開発時のデバック出力用
        // F12キーで開発者ツールを呼び出せます。
        static init(){
            //const
            Log.LEVEL = Object.freeze({
                VERBOSE: 1,
                DEBUG: 2,
                ERROR: 4,
                OFF : 256,
            });
            Log.STYLE = Object.freeze({
                TAG : 'color:red;background-color:#f7f7f7;',
                MSG : 'color:black;background-color:white;'
            });
            Log.setLevel(Log.LEVEL.OFF);
            Object.seal(Log);
        }
        static setLevel(level) {
            //@param level ログ出力レベル
            //Log.LEVELに引数の値が存在するかのassertチェック
            console.assert(Object.entries(Log.LEVEL).find(o => o[1] === level) != undefined, arguments);
            Log.level = level;
        }
        static v(tag, msg) {
            // ログ出力レベル：verbose
            //@param tag タグ
            //@param msg メッセージ
            if(Log.level > Log.LEVEL.VERBOSE) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', Log.STYLE.TAG, tag, msg);
        }
        static d(tag, msg) {
            // ログ出力レベル：debug
            //@param tag タグ
            //@param msg メッセージ
            if(Log.level > Log.LEVEL.DEBUG) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.log('%c%s', Log.STYLE.TAG, tag, msg);
        }
        static e(tag, msg) {
            // ログ出力レベル：error
            // console.errorに出力
            //@param tag タグ
            //@param msg メッセージ
            if(Log.level > Log.LEVEL.ERROR) {
                return;
            }
            console.assert(tag != undefined, arguments);
            console.error('%c%s', Log.STYLE.TAG, tag, msg);
        }
    }
    Log.init();
