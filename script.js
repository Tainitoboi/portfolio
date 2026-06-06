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
   5. GESTIONE CURSORE PERSONALIZZATO (Solo Desktop - Movimento Istantaneo)
   ========================================================================== */
if (customCursor && !window.matchMedia("(max-width: 1024px)").matches) {
    // MODIFICATO: Sposta il cursore ISTANTANEAMENTE nell'esatto momento in cui il mouse si muove
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        customCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
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
   6. LOGICA DI SPAWN E FISICA DEI BROCCOLI 
   ========================================================================== */
// ... (tieni pure invariata la funzione spawnBroccoli() così com'è) ...

// MOTORE GLOBALE DI ANIMAZIONE (Ora calcola SOLO la fisica dei broccoli, lasciando stare il cursore)
function globalAnimationLoop() {
    // RIMOSSO il blocco che muoveva il cursore qui dentro per togliere l'effetto smooth

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
   9. INTERAZIONE CURSORE CUSTOM SU VIDEO CONTAINER (Ripristino cursore nativo)
   ========================================================================== */
document.querySelectorAll('.video-container').forEach(container => {
    const overlay = container.querySelector('.video-overlay');
    
    // Rimuoviamo la necessità di bloccare i pointer-events sull'overlay per lasciare l'iframe libero
    if (overlay) {
        overlay.style.pointerEvents = 'none'; 
    }

    // Quando il mouse entra nel video, nascondiamo il cerchio nero custom
    container.addEventListener('mouseenter', () => {
        html.classList.add('cursor-video');
    });
    
    // Quando il mouse esce dal video, facciamo tornare il cerchio nero custom
    container.addEventListener('mouseleave', () => {
        html.classList.remove('cursor-video');
    });
});
