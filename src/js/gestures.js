(function()
{
	'use strict';
    class MouseGestures {
        constructor() {
            window.addEventListener('dragend', e => { this.ondragend(e); }, false);
        }
        async ondragend(e) {
            var st = window.performance.now();
            const target = e.target;
            this.onDownload(target);
            if(target.parentElement.tagName.toUpperCase() === 'A'){
                this.onDownload(target.parentElement);
            }
            var ed = window.performance.now() - st;
            //console.log(ed);
        }
        onDownload(target){
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