(function(){

    var $ = function(id) {
        return id ? document.getElementById(id) : null;
    };

    // global
    var currentThreshold = 128,
        scale = 0.25,
        currentImage = '';

    var thresholdLevel = $('threshold-level'),
        thresholdVal = document.querySelector('.threshold-val'),
        mode = document.getElementsByName('mode'),
        downloadResolution = document.getElementsByName('downloadResolution'),
        add = $('add'),
        subtract = $('subtract'),
        pixels = $('pixels');
        scaleRatio = $('scale'),
        isThresholdOn = $('threshold-on'),
        modePanel = $('mode-panel'),
        modeBlack = $('mode-black'),
        modeColor = $('mode-color'),
        uploadBtn = $('img-upload'),
        downloadBtn = $('download');

    /**
     * [thresholdConvert 阈值处理]
     * @param  {[type]} ctx       [description]
     * @param  {[type]} imageData [description]
     * @param  {[type]} threshold [阈值]
     * @param  {[type]} mode      [模式：0：彩色，1：黑白]
     * @return {[type]}           [description]
     */
    var thresholdConvert = function(ctx, imageData, threshold, mode) {
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {

            // 灰度计算公式
            var gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 *data[i + 2];
            var binary = gray >= threshold ? 255 : 0;
            if(mode == 1 || binary==255){
                data[i]=data[i+1]=data[i+2]=binary;
            }
            //data[i+3]=255;
            //data[i + 3] = data[i+3] >= threshold ? 255 : 0;               // 去掉透明
        }
        ctx.putImageData(imageData, 0, 0);
    };

    var canvas,canvasTemp;
    var render = function() {

        if (!currentImage) {
            alert('请先上传图片');
            return;
        }

        canvasTemp = document.createElement('canvas');
        var context = canvasTemp.getContext('2d');

        var image = new Image();
        image.src = currentImage;
        image.onload = function() {
            canvasTemp.width = image.width * scale;
            canvasTemp.height = image.height * scale;
            pixels.innerHTML=canvasTemp.width+"x"+canvasTemp.height;
            // 缩小到 25%
            context.drawImage(image, 0, 0, image.width * scale, image.height * scale);

            var imageData = context.getImageData(0, 0, image.width * scale, image.height * scale);
            // 阈值处理
            isThresholdOn.checked && thresholdConvert(context, imageData, currentThreshold, getCheckedValue(mode));

            var dataURL = canvasTemp.toDataURL();
            canvas = $('canvas');
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.src = dataURL;
            img.onload = function() {
                canvas.width = img.width / scale;
                canvas.height = img.height / scale;
                // 反锯齿
                ctx.imageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, img.width / scale, img.height / scale);
                download();
            };
        };
    };

    var toggleThreshold = function(checked) {
        var thresholdRange = $('threshold-range');
        if (checked) {
            thresholdLevel.disabled = false;
            add.disabled = false;
            subtract.disabled = false;
            modeBlack.disabled = false;
            modeColor.disabled = false;
            thresholdRange.classList.remove('disable');
            modePanel.classList.remove('disable');
        } else {
            thresholdLevel.disabled = true;
            add.disabled = true;
            subtract.disabled = true;
            modeBlack.disabled = true;
            modeColor.disabled = true;
            thresholdRange.classList.add('disable');
            modePanel.classList.add('disable');
        }
    };

    var getCheckedValue = function(ele) {
        for (var i = 0, len = ele.length; i < len; i++) {
            if (ele[i].checked) {
                return ele[i].value;
            }
        }
    };


    var download = function() {
        console.log(getCheckedValue(downloadResolution));
        downloadBtn.download = 'pixel.png';
        downloadBtn.href = getCheckedValue(downloadResolution)==1 ?canvasTemp.toDataURL():canvas.toDataURL();
    };



    // events
    thresholdLevel.addEventListener('change', function() {
        currentThreshold = this.value;
        thresholdVal.innerHTML = currentThreshold;
        render();
    }, false);

    subtract.addEventListener('click', function() {
        currentThreshold = --thresholdLevel.value;
        thresholdVal.innerHTML = currentThreshold;
        render();
    }, false);

    add.addEventListener('click', function() {
        currentThreshold = ++thresholdLevel.value;
        thresholdVal.innerHTML = currentThreshold;
        render();
    }, false);

    scaleRatio.addEventListener('change', function() {
        scale = this.value;
        render();
    }, false);

    isThresholdOn.addEventListener('change', function() {
        toggleThreshold(this.checked);
        render();
    }, false);

    for (var i = 0, len = mode.length; i < len; i++) {
        mode[i].addEventListener('change', function() {
            render();
        }, false);
    }
    downloadResolution[0].addEventListener('change', download, false);

    downloadResolution[1].addEventListener('change', download, false);

    // upload
    uploadBtn.addEventListener('change', function(e) {

        var file = e.target.files[0];

        if (!file.type.match('image.*')) {
            return;
        }

        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(arg) {
            currentImage = arg.target.result;
            var img = '<img class="preview" src="' + arg.target.result + '" alt="preview" >';
            $('img-preview').innerHTML = img;

            render();
        };
    }, false);

})();






