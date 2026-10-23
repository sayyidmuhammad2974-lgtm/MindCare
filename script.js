function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    const targetNav = document.getElementById(`nav-${viewName}`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Event Listener saat Halaman di-Scroll ke Bawah
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    switchView('landing');
});