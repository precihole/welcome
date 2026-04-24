//clear session storage if logout
document.addEventListener("DOMContentLoaded", () => {
    if (!frappe.session || frappe.session.user === "Guest") {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith("welcome_shown_")) {
                sessionStorage.removeItem(key);
            }
        });
    }
});

let welcomeInitialized = false;

frappe.after_ajax(() => {
    console.log('After AJAX - session:', frappe.session?.user); // Debug
    if (welcomeInitialized) return;

    if (!frappe.session || frappe.session.user === "Guest") {
        console.log('Skipped: Guest session');
        return;
    }

    welcomeInitialized = true;

    // Skip if already shown
    if (document.getElementById("frame") || document.getElementById("welcome-text")) {
        console.log('Skipped: already shown or elements exist');
        return;
    }

    const currentUser = frappe.session.user;
    console.log('Checking welcome for user:', currentUser); // Debug
    const storageKey = `welcome_shown_${currentUser}`;
    if (sessionStorage.getItem(storageKey)) {
        console.log('Welcome already shown for user');
        return;
    }
    sessionStorage.setItem(storageKey, "true");
    // window.welcomeShown = true;
    console.log('Welcome animation ready for user:', currentUser);

    // Load GSAP if not loaded
    if (typeof gsap === 'undefined') {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
        document.head.appendChild(script);
        script.onload = runAnimation;
    } else {
        runAnimation();
    }

    function runAnimation() {
        // Load font
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = "https://fonts.googleapis.com/css2?family=Bowlby+One+SC&display=swap";
        document.head.appendChild(fontLink);

        // ---------------------------
        
// Use frappe.session.user_fullname directly for reliability
        console.log('Debug - currentUser:', currentUser, 'user_fullname:', frappe.session.user_fullname);
        const displayName = frappe.session.user_fullname || currentUser;
        createWelcomeElements(displayName);

        function createWelcomeElements(displayName) {
            document.body.insertAdjacentHTML("beforeend", `
<div id="frame">
  <div class="rocket">
    <div class="rocket__body">
      <div class="rocket__body__window">
        <div class="shadow"></div>
      </div>
      <div class="rocket__body__inner">
        <div class="shadow"></div>
      </div>
    </div>
    <div class="rocket__wing rocket__wing--left"></div>
    <div class="rocket__wing rocket__wing--right">
      <div class="shadow shadow--full"></div>
    </div>
    <div class="rocket__label">
      <p class="labels">3</p>
      <p class="labels">2</p>
      <p class="labels">1</p>
    </div>
    <div class="rocket__smoke rocket__smoke--left">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--left">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--left">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--left">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--left">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--right">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--right">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--right">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--right">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__smoke rocket__smoke--right">
      <div class="rocket__smoke__inner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="rocket__fire"></div>
  </div>
</div>
<div id="welcome-text">🚀 Welcome Rocket ${displayName}!</div>
            `);
            // Generate full-screen stars
            const frame = document.getElementById("frame");
            if (frame) {
                const starCount = 150;
                const mediumStarCount = 80;
                for (let i = 0; i < starCount; i++) {
                    const star = document.createElement("div");
                    star.className = "star star--small";
                    star.style.left = Math.random() * 100 + "vw";
                    star.style.top = Math.random() * 100 + "vh";
                    star.style.animationDelay = "-" + Math.random() * 20 + "s";
                    frame.appendChild(star);
                }
                for (let i = 0; i < mediumStarCount; i++) {
                    const star = document.createElement("div");
                    star.className = "star";
                    star.style.left = Math.random() * 100 + "vw";
                    star.style.top = Math.random() * 100 + "vh";
                    star.style.animationDelay = "-" + Math.random() * 40 + "s";
                    frame.appendChild(star);
                }
            }

            // Run animation after elements created
            // Animation code here (paste the let tl = gsap.timeline... entire animation block)
            let tl = gsap.timeline({repeat: -1, repeatDelay: 1}),
               labels = document.getElementsByClassName("labels"),
               rocket = document.querySelectorAll(".rocket__body, .rocket__wing, .rocket__fire"),
               smokeL = document.querySelectorAll(".rocket__smoke--left"),
               smokeR = document.querySelectorAll(".rocket__smoke--right"),
               fire = document.getElementsByClassName("rocket__fire");
          
            // Durations!
            let cdStart = 1.25, cdLeave = cdStart / 2,
                esDuration = 0.10, esRepeat = 15,
                smDuration = 1.5;
          
            // Animations!
            tl.addLabel("countdown")
                .from(labels, {
                  duration: cdStart,
                  scale: 0,
                  x: "50px", y: "50px",
                  stagger: cdStart / labels.length,
                }, "countdown")
                .to(labels, {
                  duration: cdLeave,
                  scale: 0,
                  x: "20px", y: "20px",
                  opacity: 0,
                  stagger: cdStart / labels.length,
                }, "countdown+=" + cdStart / labels.length) 
              .addLabel("engine-start")
                .from(rocket, {
                  duration: esDuration,
                  x: "+=3px",
                  repeat: esRepeat,
                }, "engine-start-=.5")
                .from(rocket, {
                  duration: esDuration * 20,
                  y: "+=5px",
                }, "engine-start-=1")
                .from(smokeL, {
                  duration: smDuration,
                  scale: 0,
                  opacity: 2,
                  stagger: smDuration / smokeL.length,
                  x: "+=45px", y: "+=30px",
                }, "engine-start-=.5")
                .from(smokeR, {
                  duration: smDuration,
                  scale: 0,
                  opacity: 2,
                  stagger: smDuration / smokeR.length,
                  x: "-=45px", y: "+=30px",
                }, "engine-start-=.5") 
                .from(fire, {
                  duration: smDuration,
                  scale: 0,
                }, "engine-start-=.5")
              .addLabel("lift-off")
                .to(rocket, {
                  duration: 2,
                  y: "-=100px",
                }, "lift-off-=1")
                .to(fire, {
                  duration: .25,
                  scale: 2,
                }, "lift-off-=1")  
              .addLabel("launch")
                .to(rocket, {
                  duration: 8,
                  y: "-=100vh",
                  ease: "power4",
                }, "launch-=1.5")
                .to(fire, {
                  duration: .25,
                  scale: 1.75,
                  repeat: 10,
                }, "launch-=1.8")
                .call(() => {
                  // Remove rocket frame immediately after launch
                  const frame = document.getElementById("frame");
                  if (frame) {
                    gsap.to(frame, {duration: 0.5, opacity: 0, onComplete: () => frame.remove()});
                  }
                }, null, "launch")
              .addLabel("welcome")
                .to("#welcome-text", {
                  duration: 0.5,
                  opacity: 1,
                  scale: 1.05,
                  y: "-=20px",
                  ease: "power3.out"
                }, "launch")
                .call(() => {
                  // Show welcome for exactly 3 seconds, then fade out
                  setTimeout(() => {
                    const welcomeEl = document.getElementById("welcome-text");
                    if (welcomeEl) {
                      gsap.to(welcomeEl, {duration: 1, opacity: 0, scale: 0.9, ease: "power2.in", onComplete: () => welcomeEl.remove()});
                    }
                  }, 3000);
                }, null, "welcome");
            
            // Cleanup handled in timeline
        }

    }
});



