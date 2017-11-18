
	'use strict';
    class Log {
        // Logクラス
        // 開発時のデバック出力用
        // F12キーで開発者ツールを呼び出せます。
        static d(tag, msg) {
            //@param tag タグ
            //@param msg メッセージ
            console.assert(tag != undefined);
            // debug出力がtrueなら出力
            if (Log.isDebug) {
                const style_tag = 'color:red;background-color:#f7f7f7;'
                const style_msg = 'color:black;background-color:white;'
                console.log('%c%s', style_tag, tag, msg);
            }
        }
    }
    Log.isDebug = false;