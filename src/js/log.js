
	'use strict';
    class Log {
        // Logクラス
        // 開発時のデバック出力用
        // F12キーで開発者ツールを呼び出せます。
        static init(){
            Log.setLevel(0);
            Log.setEnabled(false);
            Log.STYLE = {
                TAG : 'color:red;background-color:#f7f7f7;',
                MSG : 'color:black;background-color:white;'
            };
        }
        static setLevel(level) {
            //@param level ログ出力レベル
            Log.level = level;
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
