// ============================================
// MENÚ HAMBURGUESA (MÓVIL)
// ============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
    });
});

// ============================================
// FORMULARIO DE CONTACTO CON EMAILJS
// ============================================
const EMAILJS_CONFIG = {
    serviceID:  'TU_SERVICE_ID',
    templateID: 'TU_TEMPLATE_ID',
    publicKey:  'TU_PUBLIC_KEY'
};

emailjs.init(EMAILJS_CONFIG.publicKey);

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnText   = submitBtn.querySelector('.btn-text');
    const original  = btnText.textContent;

    btnText.textContent = 'Enviando...';
    submitBtn.disabled  = true;

    const templateParams = {
        nombre:   contactForm.nombre.value,
        email:    contactForm.email.value,
        telefono: contactForm.telefono.value,
        mensaje:  contactForm.mensaje.value
    };

    emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, templateParams)
    .then(function() {
        formMessage.style.display = '';
        formMessage.textContent = '¡Mensaje enviado! Te contactaremos pronto.';
        formMessage.className   = 'form-message success';
        contactForm.reset();
        btnText.textContent = original;
        submitBtn.disabled  = false;
        setTimeout(() => { formMessage.className = 'form-message'; }, 5000);
    }, function() {
        formMessage.style.display = '';
        formMessage.textContent = 'Hubo un error. Por favor intentá nuevamente.';
        formMessage.className   = 'form-message error';
        btnText.textContent = original;
        submitBtn.disabled  = false;
        setTimeout(() => { formMessage.className = 'form-message'; }, 5000);
    });
});

// ============================================
// SCROLL SUAVE
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
        }
    });
});

// ============================================
// GALERÍA LIGHTBOX
// ============================================
const projectGalleries = {
    1: {
        images: ['images/projects/project1/1.jpg'],
        name: 'Techo teja pizarra española'
    },
    2: {
        images: [
            'images/projects/proyecto2/1.jpg',
            'images/projects/proyecto2/2.jpg',
            'images/projects/proyecto2/3.jpg',
            'images/projects/proyecto2/4.jpg',
            'images/projects/proyecto2/5.jpg',
            'images/projects/proyecto2/6.jpg',
            'images/projects/proyecto2/7.jpg',
            'images/projects/proyecto2/8.jpg',
            'images/projects/proyecto2/9.jpg',
            'images/projects/proyecto2/10.jpg'
        ],
        name: 'Reparación cubierta techo parabólico'
    },
    3: {
        images: [
            'images/projects/proyecto3/1.jpg',
            'images/projects/proyecto3/2.jpg',
            'images/projects/proyecto3/3.jpg',
            'images/projects/proyecto3/4.jpg',
            'images/projects/proyecto3/5.jpg',
            'images/projects/proyecto3/6.jpg',
            'images/projects/proyecto3/7.jpg'
        ],
        name: 'Proyecto 3'
    }
};

let currentProject  = null;
let currentImageIndex = 0;

const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightbox-img');
const lightboxClose  = document.querySelector('.lightbox-close');
const lightboxPrev   = document.querySelector('.lightbox-prev');
const lightboxNext   = document.querySelector('.lightbox-next');
const currentImgSpan = document.getElementById('current-image');
const totalImgsSpan  = document.getElementById('total-images');
const lightboxTitle  = document.querySelector('.lightbox-title-text');

document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function() {
        openLightbox(this.getAttribute('data-project'));
    });
});

function openLightbox(projectId) {
    currentProject = projectGalleries[projectId];
    if (!currentProject) return;
    currentImageIndex = 0;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightboxImage();
}

function updateLightboxImage() {
    if (!currentProject) return;
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
        lightboxImg.src = currentProject.images[currentImageIndex];
        lightboxTitle.textContent = currentProject.name;
        currentImgSpan.textContent = currentImageIndex + 1;
        totalImgsSpan.textContent  = currentProject.images.length;
        lightboxImg.style.opacity  = 1;
    }, 100);
}

lightboxImg.style.transition = 'opacity 0.25s';

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    currentProject = null;
}

lightboxPrev.addEventListener('click', e => {
    e.stopPropagation();
    if (!currentProject) return;
    currentImageIndex = (currentImageIndex - 1 + currentProject.images.length) % currentProject.images.length;
    updateLightboxImage();
});

lightboxNext.addEventListener('click', e => {
    e.stopPropagation();
    if (!currentProject) return;
    currentImageIndex = (currentImageIndex + 1) % currentProject.images.length;
    updateLightboxImage();
});

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lightboxPrev.click();
    if (e.key === 'ArrowRight')  lightboxNext.click();
});

// ============================================
// HERO SLIDESHOW (JavaScript — CSS keyframes
// no animan background-image correctamente)
// ============================================
const heroSlides = [
    'images/hero-slides/1.jpg',
    'images/hero-slides/7.jpg',
    'images/hero-slides/10.jpg'
];

const heroSlideshow = document.querySelector('.hero-slideshow');
let heroIndex = 0;

function setHeroSlide(index) {
    heroSlideshow.style.backgroundImage = `url('${heroSlides[index]}')`;
}

setHeroSlide(0);

setInterval(() => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    setHeroSlide(heroIndex);
}, 7000);