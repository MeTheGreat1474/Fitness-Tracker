//add animation on entry to all elements with class animate-slide-up-fade
document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    });

    document.querySelectorAll('.animate-slide-up-fade').forEach((el) => {
        observer.observe(el);
    });
});
