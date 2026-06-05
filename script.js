/* ==========================================================================
   1. DICHIARAZIONE VARIABILI E ELEMENTI DOM
   ========================================================================== */
const html = document.documentElement;
const loghino = document.getElementById("loghino");
const mobileMenu = document.getElementById("mobile-menu");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");
const crosses = document.querySelectorAll(".cross-element");

let activeFilter = null;
const filters = {
    "cross-1": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(8) hue-rotate(-40deg)",
    "cross-2": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(8) hue-rotate(160deg)",
    "cross-3": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(10) hue-rotate(280deg)",
    "cross-4": "grayscale(1) contrast(1) brightness(0.8) sepia(1) saturate(8) hue-rotate(240deg)"
};

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
   3. FUNZIONI LOGICHE DEL TEMA (Istantaneo e ultra leggero)
   ========================================================================== */
function applyTheme(isDark) {
    if (isDark) {
        html.setAttribute("data-theme", "dark");
    } else {
        html.removeAttribute("data-theme");
    }

    // Sincronizzazione dinamica dei meta tag della barra del browser mobile
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isDark ? "#000000" : "#ffffff");
    }

    const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusMeta) {
        appleStatusMeta.setAttribute("content", isDark ? "black" : "default");
    }

    localStorage.setItem("theme", isDark ? "dark" : "light");
}

function toggleTheme() {
    const isDark = html.getAttribute("data-theme") !== "dark";
    applyTheme(isDark);
}

/* ==========================================================================
   4. INTERAZIONI DI NAVIGAZIONE E INTERFACCIA
   ========================================================================== */
// Click sulle immagini per andare alla scheda progetto (Attivo sulle gallerie)
document.querySelectorAll('.image-container').forEach(container => {
    container.addEventListener('click', function() {
        const url = this.dataset.url;
        if (url) window.location.href = url;
    });
});

// Chiude il menu mobile se clicchi sullo sfondo (escludendo i link e il toggle)
mobileMenu?.addEventListener("click", (e) => {
    if (e.target.tagName === 'A' || e.target.closest('.theme-toggle')) {
        return;
    }
    mobileMenu.classList.remove("open");
    document.body.classList.remove("no-scroll");
});

// Chiude il menu mobile quando premi direttamente i link interni di navigazione
document.querySelectorAll("#mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        document.body.classList.remove("no-scroll");
    });
});

/* ==========================================================================
   5. LOGICA DI SPAWN DEI BROCCOLI (Manuale e Automatica)
   ========================================================================== */
function spawnBroccoli() {
    const broccoli = document.createElement("div");
    broccoli.className = "broccoli";
    broccoli.textContent = "🥦";
    
    // Calcolo coordinate e rotazioni randomiche ad ogni esecuzione
    broccoli.style.left = Math.random() * window.innerWidth + "px";
    broccoli.style.top = Math.random() * window.innerHeight + "px";
    broccoli.style.transform = `rotate(${Math.random() * 360}deg)`;

    // Se un filtro delle croci è attivo, viene ereditato anche dal nuovo broccolo
    if (activeFilter) {
        broccoli.style.filter = activeFilter;
    }

    document.body.appendChild(broccoli);
}

// Click sul logo: Apre il menu mobile (<1024px) o fa spawnare un singolo broccolo su desktop
loghino?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 1024px)").matches) {
        mobileMenu?.classList.toggle("open");
        document.body.classList.toggle("no-scroll");
        return;
    }
    spawnBroccoli();
});

// SPAWN AUTOMATICO: Genera un broccolo ogni 5000ms (5 secondi) solo se rilevato come Desktop (>1024px)
setInterval(() => {
    if (!window.matchMedia("(max-width: 1024px)").matches) {
        spawnBroccoli();
    }
}, 5000);

/* ==========================================================================
   6. ASSEGNAZIONE EVENTI TOGGLE E INITIALIZATION
   ========================================================================== */
// Aggancio definitivo dei trigger prima di inizializzare lo stato del tema
themeToggle?.addEventListener("click", toggleTheme);
themeToggleMobile?.addEventListener("click", toggleTheme);

// Caricamento controllato del tema salvato all'avvio
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    applyTheme(savedTheme === "dark");
} else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark);
}

// Listener per captare il cambio di tema a livello di sistema operativo
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
        applyTheme(e.matches);
    }
});

/* ==========================================================================
   7. EASTER EGGS (Gestione filtri delle croci)
   ========================================================================== */
crosses.forEach(cross => {
    cross.addEventListener("click", () => {
        // Se non ci sono broccoli a schermo, blocca l'operazione con avviso
        if (!document.querySelector(".broccoli")) {
            alert("Press the logo to unlock this function");
            return;
        }

        const clickedFilter = filters[cross.id];

        // Se lo stesso filtro viene premuto due volte, si disattiva (Toggle off)
        if (activeFilter === clickedFilter) {
            activeFilter = null;
            document.querySelectorAll(".broccoli").forEach(broccoli => {
                broccoli.style.filter = "none";
            });
            return;
        }

        // Applicazione del nuovo filtro cromatico globale (Toggle on)
        activeFilter = clickedFilter;
        document.querySelectorAll(".broccoli").forEach(broccoli => {
            broccoli.style.filter = activeFilter;
        });
    });
});