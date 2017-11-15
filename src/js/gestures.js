(function()
{
	'use strict';
    class MouseGestures {
        constructor() {
            window.addEventListener('dragend', e => { this.ondragend(e); }, false);
        }
        async ondragend(e) {
            const target = e.target;
            const src_attr = target.src || target.href;
            if (src_attr === undefined) {
                return;
            }
            const element = document.createElement('a');
            element.href = src_attr;
            // filename
            element.download = src_attr.split('/').pop();
            element.click();
        }
    }
    window.ext_mg = new MouseGestures();
})();