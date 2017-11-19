
	'use strict';
    class Log {
        // Logクラス
        // 開発時のデバック出力用
        // F12キーで開発者ツールを呼び出せます。
        static init(){
            //const
            Log.LEVEL = Object.freeze({
                DEBUG: Symbol('debug'),
                ERROR: Symbol('error'),
                VERBOSE: Symbol('verbose')    
            });
            Log.STYLE = Object.freeze({
                TAG : 'color:red;background-color:#f7f7f7;',
                MSG : 'color:black;background-color:white;'
            });
            Log.setLevel(Log.LEVEL.DEBUG);
            Log.setEnabled(false);
        }
        static setLevel(l) {
            //@param level ログ出力レベル
            Log.l = l;
        }
        static setEnabled(b) {
            //@param b  true:ログ出力が使用可能
            //note:エラーログは無条件出力
            Log.isEnabled = b;
        }
        static d(tag, msg) {
            // ログ出力レベル：debug
            //@param tag タグ
            //@param msg メッセージ
            console.assert(tag != undefined);
            // debug出力がtrueなら出力
            if (Log.isEnabled) {
                console.log('%c%s', Log.STYLE.TAG, tag, msg);
            }
        }
        static v(tag, msg) {
            // ログ出力レベル：verbose
            //@param tag タグ
            //@param msg メッセージ
            console.assert(tag != undefined);
            // debug出力がtrueなら出力
            if (Log.isEnabled) {
                console.log('%c%s', Log.STYLE.TAG, tag, msg);
            }
        }
        static e(tag, msg) {
            // ログ出力レベル：error console.errorに出力
            //@param tag タグ
            //@param msg メッセージ
            console.assert(tag != undefined);
            // debug出力がtrueなら出力
            if (Log.isEnabled) {
                console.error('%c%s', Log.STYLE.TAG, tag, msg);
            }
        }
    }
    Log.init();
