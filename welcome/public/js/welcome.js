(function () {
    "use strict";

    var CLAIM_METHOD = "welcome.api.claim_daily_rocket";
    var LOCAL_KEY_PREFIX = "welcome_rocket_shown_on_";
    var FRAME_ID = "welcome-rocket-frame";
    var TEXT_ID = "welcome-rocket-text";
    var GSAP_URL = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    var FONT_URL = "https://fonts.googleapis.com/css2?family=Bowlby+One+SC&display=swap";

    var initialized = false;
    var gsapLoading = false;
    var gsapCallbacks = [];

    function init() {
        if (initialized || !window.frappe) {
            return;
        }

        var currentUser = getCurrentUser();

        if (!currentUser || currentUser === "Guest") {
            return;
        }

        initialized = true;

        if (animationExists()) {
            return;
        }

        claimDailyWelcome(currentUser, function (shouldShow) {
            if (!shouldShow || animationExists()) {
                return;
            }

            loadGsap(function () {
                runAnimation(currentUser);
            });
        });
    }

    function getCurrentUser() {
        if (frappe.session && frappe.session.user) {
            return frappe.session.user;
        }

        if (frappe.boot && frappe.boot.user && frappe.boot.user.name) {
            return frappe.boot.user.name;
        }

        return "Guest";
    }

    function animationExists() {
        return document.getElementById(FRAME_ID) || document.getElementById(TEXT_ID);
    }

    function getWelcomeLocalStorage() {
        try {
            var storage = window.localStorage;
            var testKey = "__welcome_rocket_storage_test__";

            storage.setItem(testKey, "1");
            storage.removeItem(testKey);

            return storage;
        } catch (e) {
            return null;
        }
    }

    function getLocalDateString() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        return year + "-" + padDatePart(month) + "-" + padDatePart(day);
    }

    function padDatePart(value) {
        return value < 10 ? "0" + value : String(value);
    }

    function getWelcomeLocalKey(user) {
        return LOCAL_KEY_PREFIX + encodeURIComponent(user);
    }

    function markWelcomeShownLocally(user, shownOn) {
        var storage = getWelcomeLocalStorage();

        if (!storage) {
            window.__welcomeRocketShownOn = shownOn;
            return;
        }

        try {
            storage.setItem(getWelcomeLocalKey(user), shownOn);
        } catch (e) {
            window.__welcomeRocketShownOn = shownOn;
        }
    }

    function claimWelcomeLocally(user) {
        var today = getLocalDateString();
        var storage = getWelcomeLocalStorage();
        var key;

        if (!storage) {
            if (window.__welcomeRocketShownOn === today) {
                return false;
            }

            window.__welcomeRocketShownOn = today;
            return true;
        }

        try {
            key = getWelcomeLocalKey(user);

            if (storage.getItem(key) === today) {
                return false;
            }

            storage.setItem(key, today);
            return true;
        } catch (e) {
            if (window.__welcomeRocketShownOn === today) {
                return false;
            }

            window.__welcomeRocketShownOn = today;
            return true;
        }
    }

    function claimDailyWelcome(user, callback) {
        var completed = false;

        function finish(shouldShow) {
            if (completed) {
                return;
            }

            completed = true;
            callback(shouldShow);
        }

        if (typeof frappe.call !== "function") {
            finish(claimWelcomeLocally(user));
            return;
        }

        frappe.call({
            method: CLAIM_METHOD,
            type: "POST",
            quiet: true,
            silent: true,
            no_spinner: true,
            callback: function (response) {
                var message;

                if (response && response.exc) {
                    finish(claimWelcomeLocally(user));
                    return;
                }

                message = response && response.message ? response.message : {};

                if (message.shown_on) {
                    markWelcomeShownLocally(user, message.shown_on);
                }

                finish(message.show === true);
            },
            error: function () {
                finish(claimWelcomeLocally(user));
            }
        });
    }

    function loadGsap(callback) {
        var script;

        if (window.gsap) {
            callback();
            return;
        }

        gsapCallbacks.push(callback);

        if (gsapLoading) {
            return;
        }

        gsapLoading = true;
        script = document.createElement("script");
        script.src = GSAP_URL;
        script.async = true;
        script.setAttribute("data-welcome-rocket-gsap", "1");
        script.onload = flushGsapCallbacks;
        script.onerror = clearGsapCallbacks;
        document.head.appendChild(script);
    }

    function flushGsapCallbacks() {
        var callbacks = gsapCallbacks.slice();
        var i;

        gsapCallbacks = [];
        gsapLoading = false;

        if (!window.gsap) {
            return;
        }

        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i]();
        }
    }

    function clearGsapCallbacks() {
        gsapCallbacks = [];
        gsapLoading = false;
    }

    function ensureFontLoaded() {
        var link;

        if (document.querySelector('link[data-welcome-rocket-font="1"]')) {
            return;
        }

        link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONT_URL;
        link.setAttribute("data-welcome-rocket-font", "1");
        document.head.appendChild(link);
    }

    function runAnimation(user) {
        if (!window.gsap || animationExists()) {
            return;
        }

        ensureFontLoaded();
        createWelcomeElements(getWelcomeMessage(user));
        animateWelcomeElements();
    }

    function getWelcomeMessage(user) {
        var fullName = getUserFullName(user);
        var nameParts = fullName ? fullName.trim().split(/\s+/) : [];
        var firstName = nameParts[0] || "";
        var lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        var displayName = lastName || firstName || "user";

        return {
            eyebrow: "Welcome aboard",
            name: displayName,
            message: "Your workspace is ready for takeoff"
        };
    }

    function getUserFullName(user) {
        var info;

        if (typeof frappe.user_info === "function") {
            try {
                info = frappe.user_info(user) || {};
                if (info.full_name || info.fullname) {
                    return info.full_name || info.fullname;
                }
            } catch (e) {
                // Continue with boot/session fallbacks.
            }
        }

        if (frappe.boot && frappe.boot.user_info && frappe.boot.user_info[user]) {
            info = frappe.boot.user_info[user];
            if (info.full_name || info.fullname) {
                return info.full_name || info.fullname;
            }
        }

        if (frappe.session && frappe.session.user_fullname) {
            return frappe.session.user_fullname;
        }

        if (frappe.boot && frappe.boot.user && frappe.boot.user.full_name) {
            return frappe.boot.user.full_name;
        }

        return "";
    }

    function createWelcomeElements(message) {
        var frame = document.createElement("div");
        var text = document.createElement("div");

        frame.id = FRAME_ID;
        frame.innerHTML = getRocketMarkup();
        document.body.appendChild(frame);
        addStars(frame);

        text.id = TEXT_ID;
        text.appendChild(createWelcomeTextLine("welcome-rocket-text__eyebrow", message.eyebrow));
        text.appendChild(createWelcomeTextLine("welcome-rocket-text__name", message.name));
        text.appendChild(createWelcomeTextLine("welcome-rocket-text__message", message.message));
        document.body.appendChild(text);
    }

    function createWelcomeTextLine(className, value) {
        var line = document.createElement("span");

        line.className = className;
        line.textContent = value;

        return line;
    }

    function getRocketMarkup() {
        var smokeMarkup = "";
        var i;

        for (i = 0; i < 5; i += 1) {
            smokeMarkup += getSmokeMarkup("left");
        }

        for (i = 0; i < 5; i += 1) {
            smokeMarkup += getSmokeMarkup("right");
        }

        return [
            '<div class="rocket">',
            '  <div class="rocket__body">',
            '    <div class="rocket__body__window"><div class="shadow"></div></div>',
            '    <div class="rocket__body__inner"><div class="shadow"></div></div>',
            '  </div>',
            '  <div class="rocket__wing rocket__wing--left"></div>',
            '  <div class="rocket__wing rocket__wing--right"><div class="shadow shadow--full"></div></div>',
            '  <div class="rocket__label"><p class="labels">3</p><p class="labels">2</p><p class="labels">1</p></div>',
            smokeMarkup,
            '  <div class="rocket__fire"></div>',
            '</div>'
        ].join("");
    }

    function getSmokeMarkup(side) {
        return [
            '<div class="rocket__smoke rocket__smoke--' + side + '">',
            '  <div class="rocket__smoke__inner">',
            '    <div></div><div></div><div></div><div></div>',
            '  </div>',
            '</div>'
        ].join("");
    }

    function addStars(frame) {
        var area = window.innerWidth * window.innerHeight;
        var smallStarCount = clamp(Math.round(area / 12000), 60, 130);
        var mediumStarCount = clamp(Math.round(area / 26000), 25, 70);
        var fragment = document.createDocumentFragment();
        var i;

        for (i = 0; i < smallStarCount; i += 1) {
            appendStar(fragment, "star star--small", 20);
        }

        for (i = 0; i < mediumStarCount; i += 1) {
            appendStar(fragment, "star", 40);
        }

        frame.appendChild(fragment);
    }

    function appendStar(fragment, className, duration) {
        var star = document.createElement("div");

        star.className = className;
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * 100 + "vh";
        star.style.animationDelay = "-" + Math.random() * duration + "s";
        fragment.appendChild(star);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function animateWelcomeElements() {
        var frame = document.getElementById(FRAME_ID);
        var labels;
        var rocket;
        var smokeL;
        var smokeR;
        var fire;
        var tl;
        var cdStart = 1.25;
        var cdLeave = cdStart / 2;
        var esDuration = 0.10;
        var esRepeat = 15;
        var smDuration = 1.5;

        if (!frame) {
            return;
        }

        labels = frame.getElementsByClassName("labels");
        rocket = frame.querySelectorAll(".rocket__body, .rocket__wing, .rocket__fire");
        smokeL = frame.querySelectorAll(".rocket__smoke--left");
        smokeR = frame.querySelectorAll(".rocket__smoke--right");
        fire = frame.getElementsByClassName("rocket__fire");

        tl = gsap.timeline();

        tl.addLabel("countdown")
            .from(labels, {
                duration: cdStart,
                scale: 0,
                x: "50px",
                y: "50px",
                stagger: cdStart / labels.length
            }, "countdown")
            .to(labels, {
                duration: cdLeave,
                scale: 0,
                x: "20px",
                y: "20px",
                opacity: 0,
                stagger: cdStart / labels.length
            }, "countdown+=" + cdStart / labels.length)
            .addLabel("engine-start")
            .from(rocket, {
                duration: esDuration,
                x: "+=3px",
                repeat: esRepeat
            }, "engine-start-=.5")
            .from(rocket, {
                duration: esDuration * 20,
                y: "+=5px"
            }, "engine-start-=1")
            .from(smokeL, {
                duration: smDuration,
                scale: 0,
                opacity: 2,
                stagger: smDuration / smokeL.length,
                x: "+=45px",
                y: "+=30px"
            }, "engine-start-=.5")
            .from(smokeR, {
                duration: smDuration,
                scale: 0,
                opacity: 2,
                stagger: smDuration / smokeR.length,
                x: "-=45px",
                y: "+=30px"
            }, "engine-start-=.5")
            .from(fire, {
                duration: smDuration,
                scale: 0
            }, "engine-start-=.5")
            .addLabel("lift-off")
            .to(rocket, {
                duration: 2,
                y: "-=100px"
            }, "lift-off-=1")
            .to(fire, {
                duration: 0.25,
                scale: 2
            }, "lift-off-=1")
            .addLabel("launch")
            .to(rocket, {
                duration: 8,
                y: "-=100vh",
                ease: "power4"
            }, "launch-=1.5")
            .to(fire, {
                duration: 0.25,
                scale: 1.75,
                repeat: 10
            }, "launch-=1.8")
            .call(removeFrame, null, "launch")
            .addLabel("welcome")
            .to("#" + TEXT_ID, {
                duration: 0.5,
                opacity: 1,
                scale: 1.05,
                y: "-=20px",
                ease: "power3.out"
            }, "launch")
            .call(removeWelcomeTextAfterDelay, null, "welcome");
    }

    function removeFrame() {
        var frame = document.getElementById(FRAME_ID);

        if (!frame) {
            return;
        }

        gsap.to(frame, {
            duration: 0.5,
            opacity: 0,
            onComplete: function () {
                frame.remove();
            }
        });
    }

    function removeWelcomeTextAfterDelay() {
        window.setTimeout(function () {
            var welcomeText = document.getElementById(TEXT_ID);

            if (!welcomeText) {
                return;
            }

            gsap.to(welcomeText, {
                duration: 1,
                opacity: 0,
                scale: 0.9,
                ease: "power2.in",
                onComplete: function () {
                    welcomeText.remove();
                }
            });
        }, 3000);
    }

    if (window.frappe && frappe.provide) {
        frappe.provide("welcome.rocket");
        welcome.rocket.init = init;
    }

    if (window.jQuery) {
        jQuery(function () {
            window.setTimeout(init, 0);
        });
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}());
