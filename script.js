// ============================================
// MENÚ HAMBURGUESA (MÓVIL)
// ============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ============================================
// FORMULARIO DE CONTACTO CON EMAILJS
// ============================================

// CONFIGURACIÓN DE EMAILJS
// 1. Registrate gratis en: https://www.emailjs.com/
// 2. Crea un servicio de email (Gmail, Outlook, etc.)
// 3. Crea un template de email
// 4. Reemplaza estos valores con los tuyos:

const EMAILJS_CONFIG = {
    serviceID: 'TU_SERVICE_ID',      // Ejemplo: 'service_abc123'
    templateID: 'TU_TEMPLATE_ID',    // Ejemplo: 'template_xyz789'
    publicKey: 'TU_PUBLIC_KEY'       // Ejemplo: 'abcDEF123xyz'
};

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// Manejar envío del formulario
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Mostrar estado de carga
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Preparar los datos del formulario
    const templateParams = {
        nombre: contactForm.nombre.value,
        email: contactForm.email.value,
        telefono: contactForm.telefono.value,
        mensaje: contactForm.mensaje.value
    };
    
    // Enviar email usando EmailJS
    emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams
    )
    .then(function(response) {
        console.log('Email enviado exitosamente', response);
        
        // Mostrar mensaje de éxito
        formMessage.textContent = '¡Mensaje enviado exitosamente! Te contactaremos pronto.';
        formMessage.className = 'form-message success';
        
        // Limpiar formulario
        contactForm.reset();
        
        // Restaurar botón
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
        
    }, function(error) {
        console.error('Error al enviar email:', error);
        
        // Mostrar mensaje de error
        formMessage.textContent = 'Hubo un error al enviar el mensaje. Por favor, intentá nuevamente.';
        formMessage.className = 'form-message error';
        
        // Restaurar botón
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
});

// ============================================
// ANIMACIÓN DE SCROLL SUAVE
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// EFECTO NAVBAR AL HACER SCROLL
// ============================================
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});