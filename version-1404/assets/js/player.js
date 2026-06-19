
import { H as Hls } from './hls-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-m3u8]');
    if (!video) {
        return;
    }

    var source = video.getAttribute('data-m3u8');
    var overlay = document.querySelector('[data-player-overlay]');
    var status = document.querySelector('[data-player-status]');
    var hls = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    }

    function loadSource() {
        if (!source) {
            setStatus('未配置播放源');
            return;
        }

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
        } else if (Hls && Hls.isSupported && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
        }

        if (hls) {
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已就绪，点击播放');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源加载失败，请检查 media 目录');
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('播放源已就绪，点击播放');
            }, { once: true });
            return;
        }

        setStatus('当前浏览器不支持 HLS 播放');
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(hideOverlay).catch(function () {
                    setStatus('浏览器阻止自动播放，请再次点击播放器');
                    showOverlay();
                });
            } else {
                hideOverlay();
            }
        });
    }

    video.addEventListener('play', function () {
        hideOverlay();
        setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            setStatus('已暂停');
        }
    });

    video.addEventListener('ended', function () {
        setStatus('播放结束');
        showOverlay();
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });

    setStatus('正在加载播放源...');
    loadSource();
});
