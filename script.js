/* ==========================================================================
   1. DICHIARAZIONE VARIABILI E ELEMENTI DOM
   ========================================================================== */
const html = document.documentElement;
const loghino = document.getElementById("loghino");
const mobileMenu = document.getElementById("mobile-menu");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");
const crosses = document.querySelectorAll(".cross-element");
const customCursor = document.getElementById("custom-cursor");

let activeFilter = null;
const filters = {
    "cross-1": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(8) hue-rotate(-40deg)",
    "cross-2": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(8) hue-rotate(160deg)",
    "cross-3": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(10) hue-rotate(280deg)",
    "cross-4": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(8) hue-rotate(240deg)"
};

// Coordinate per il tracciamento del cursore personalizzato
let mouseX = -100;
let mouseY = -100;

// DEFINIZIONE GLOBALE HOVER TARGETS (Spostata qui per evitare blocchi su mobile)
let hoverTargets = '.link, .tab-link, #mobile-menu a, .video-overlay, .theme-toggle, .cross-element, .logo, .broccoli';
if (document.getElementById('gallery') || document.getElementById('gallery-mobile')) {
    hoverTargets += ', #gallery .image-container, #gallery-mobile .image-container';
}

/* ==========================================================================
   2. GESTIONE SCROLL
   ========================================================================== */
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

/* ==========================================================================
   3. FUNZIONI LOGICHE DEL TEMA (Istantaneo e sincronizzato)
   ========================================================================== */
function applyTheme(isDark) {
    if (isDark) {
        html.setAttribute("data-theme", "dark");
    } else {
        html.removeAttribute("data-theme");
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isDark ? "#000000" : "#ffffff");
    }

    const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusMeta) {
        appleStatusMeta.setAttribute("content", isDark ? "black" : "default");
    }

    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (html.classList.contains("cursor-hover")) {
        html.classList.remove("cursor-hover");
        requestAnimationFrame(() => {
            html.classList.add("cursor-hover");
        });
    }
}

function toggleTheme() {
    const isDark = html.getAttribute("data-theme") !== "dark";
    applyTheme(isDark);
}

/* ==========================================================================
   4. INTERAZIONI DI NAVIGAZIONE E INTERFACCIA
   ========================================================================== */
document.querySelectorAll('.image-container').forEach(container => {
    container.addEventListener('click', function() {
        const url = this.dataset.url;
        if (url) window.location.href = url;
    });
});

mobileMenu?.addEventListener("click", (e) => {
    if (e.target.tagName === 'A' || e.target.closest('.theme-toggle')) {
        return;
    }
    mobileMenu.classList.remove("open");
    document.body.classList.remove("no-scroll");
});

document.querySelectorAll("#mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        document.body.classList.remove("no-scroll");
    });
});

/* ==========================================================================
   5. GESTIONE CURSORE PERSONALIZZATO (Solo Desktop)
   ========================================================================== */
if (customCursor && !window.matchMedia("(max-width: 1024px)").matches) {
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener("mouseleave", () => {
        html.classList.add("cursor-hidden");
    });

    document.addEventListener("mouseenter", () => {
        html.classList.remove("cursor-hidden");
    });
    
    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(hoverTargets)) {
            html.classList.add("cursor-hover");
        }
    });

    document.addEventListener("mouseout", (e) => {
        if (!e.relatedTarget || !e.relatedTarget.closest(hoverTargets)) {
            html.classList.remove("cursor-hidden");
            html.classList.remove("cursor-hover");
        }
    });
}

/* ==========================================================================
   6. LOGICA DI SPAWN E FISICA DEI BROCCOLI (Massa e Pesantezza ravvicinata)
   ========================================================================== */
const activeBroccoliList = [];

function spawnBroccoli() {
    const broccoli = document.createElement("div");
    broccoli.className = "broccoli";
    broccoli.textContent = "🥦";
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const rotation = Math.random() * 360;

    broccoli.style.left = x + "px";
    broccoli.style.top = y + "px";
    broccoli.style.transform = `rotate(${rotation}deg)`;

    if (activeFilter) {
        broccoli.style.filter = activeFilter;
    }

    document.body.appendChild(broccoli);

    const broccoliData = {
        element: broccoli,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        rotation: rotation,
        vRot: 0
    };

    broccoli.addEventListener("mouseenter", (e) => {
        const rect = broccoli.getBoundingClientRect();
        const broccoliCenterX = rect.left + rect.width / 2;
        const broccoliCenterY = rect.top + rect.height / 2;

        let dx = broccoliCenterX - e.clientX;
        let dy = broccoliCenterY - e.clientY;

        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= distance;
        dy /= distance;

        const force = 3; 

        broccoliData.vx = dx * force;
        broccoliData.vy = dy * force;
        broccoliData.vRot = (Math.random() - 0.5) * 4;
    });

    activeBroccoliList.push(broccoliData);
}

// MOTORE GLOBALE DI ANIMAZIONE (Fisica + Cursore integrati a 60fps)
function globalAnimationLoop() {
    if (customCursor && !window.matchMedia("(max-width: 1024px)").matches) {
        customCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }

    const friction = 0.94; 

    for (let i = activeBroccoliList.length - 1; i >= 0; i--) {
        const b = activeBroccoliList[i];

        if (Math.abs(b.vx) > 0.01 || Math.abs(b.vy) > 0.01 || Math.abs(b.vRot) > 0.01) {
            b.x += b.vx;
            b.y += b.vy;
            b.rotation += b.vRot;

            b.vx *= friction;
            b.vy *= friction;
            b.vRot *= friction;

            if (b.x < 0) {
                b.x = 0;
                b.vx *= -0.3;
            } else if (b.x > window.innerWidth - 40) {
                b.x = window.innerWidth - 40;
                b.vx *= -0.3;
            }

            if (b.y < 0) {
                b.y = 0;
                b.vy *= -0.3;
            } else if (b.y > window.innerHeight - 40) {
                b.y = window.innerHeight - 40;
                b.vy *= -0.3;
            }

            b.element.style.left = b.x + "px";
            b.element.style.top = b.y + "px";
            b.element.style.transform = `rotate(${b.rotation}deg)`;
        }
    }

    requestAnimationFrame(globalAnimationLoop);
}

requestAnimationFrame(globalAnimationLoop);

// Gestione clic sul logo
loghino?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 1024px)").matches) {
        mobileMenu?.classList.toggle("open");
        document.body.classList.toggle("no-scroll");
        return;
    }
    spawnBroccoli();
});

// Spawn automatico ogni 5 secondi su desktop
setInterval(() => {
    if (!window.matchMedia("(max-width: 1024px)").matches) {
        spawnBroccoli();
    }
}, 5000);

/* ==========================================================================
   7. ASSEGNAZIONE EVENTI TOGGLE E INITIALIZATION
   ========================================================================== */
themeToggle?.addEventListener("click", toggleTheme);
themeToggleMobile?.addEventListener("click", toggleTheme);

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    applyTheme(savedTheme === "dark");
} else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
        applyTheme(e.matches);
    }
});

/* ==========================================================================
   8. EASTER EGGS (Filtri delle croci)
   ========================================================================== */
crosses.forEach(cross => {
    cross.addEventListener("click", () => {
        if (!document.querySelector(".broccoli")) {
            alert("Press the logo to unlock this function");
            return;
        }

        const clickedFilter = filters[cross.id];

        if (activeFilter === clickedFilter) {
            activeFilter = null;
            document.querySelectorAll(".broccoli").forEach(broccoli => {
                broccoli.style.filter = "none";
            });
            return;
        }

        activeFilter = clickedFilter;
        document.querySelectorAll(".broccoli").forEach(broccoli => {
            broccoli.style.filter = activeFilter;
        });
    });
});

/* ==========================================================================
   9. INTERAZIONE CURSORE CUSTOM SU VIDEO CONTAINER (Compatibile YT e Vimeo)
   ========================================================================== */
document.querySelectorAll('.video-container').forEach(container => {
    const overlay = container.querySelector('.video-overlay');
    
    overlay?.addEventListener('mousedown', (e) => {
        // 1. Sposta l'overlay dietro al video istantaneamente (z-index inferiore all'iframe)
        overlay.style.zIndex = '1';
        
        // 2. Crea un brevissimo delay per dare il tempo al browser di registrare il click reale
        setTimeout(() => {
            // 3. Ripristina l'overlay sopra al video
            overlay.style.zIndex = '10';
        }, 200);
    });
});
