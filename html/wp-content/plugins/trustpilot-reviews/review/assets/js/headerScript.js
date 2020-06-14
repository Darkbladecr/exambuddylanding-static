(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
f.parentNode.insertBefore(a,f)})(window,document,'script', trustpilot_settings['TrustpilotScriptUrl'], 'tp');
tp('register', trustpilot_settings['key']);

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return false;
    }
}

function tryParseJson(str) {
    if (typeof str === 'string') {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
    return false;
}

if (inIframe()) {
    window.addEventListener('message', function(e) {
        var adminOrign = new URL(window.location).hostname;
        if (!e.data || e.origin.indexOf(adminOrign) === -1) {
            return;
        }
        if (typeof TrustpilotPreview !== 'undefined') {
            if (typeof e.data === 'string' && e.data === 'submit') {
                TrustpilotPreview.sendTrustboxes();
            } else {
                jsonData = tryParseJson(e.data)
                if (jsonData) {
                    if (jsonData.trustbox) {
                        TrustpilotPreview.setSettings(jsonData.trustbox);
                    } else if (jsonData.customised) {
                        TrustpilotPreview.updateActive(jsonData.customised);
                    }
                }
                return;
            }
        } else {

            var settings = tryParseJson(e.data);
            if (settings) {
                if (settings.trustboxes) {
                    var p = document.createElement("script");
                    p.type = "text/javascript";
                    p.onload = function () {
                        const iFrame = e.source.parent.document.getElementById('configuration_iframe').contentWindow;
                        TrustpilotPreview.init([trustpilot_settings['PreviewCssUrl'], trustpilot_settings['PreviewWPCssUrl']], settings, iFrame, e.source);
                    };
                    p.src = trustpilot_settings['PreviewScriptUrl'];
                    document.head.appendChild(p);
                }
            }
            return;
        }
    });
}
