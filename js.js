(() => {
    const images = document.querySelectorAll(".anim");
    const contents = document.querySelectorAll(".block .content");
    const numDigits = document.querySelectorAll(".num-chislo > div");
    let currentIndex = -1;

    function showImage(index) {
        if (index === currentIndex) return;
        currentIndex = index;

        images.forEach((b, i) => b.style.display = i === index ? "block" : "none");
        requestAnimationFrame(() => Gridify(images[index], { scroll: false, dur: 0.1, amount: 0.3, size: 50 }));

        numDigits.forEach(digit => {
            const digitHeight = digit.offsetHeight;
            const gap = 10;
            gsap.to(digit, {
                y: -(digitHeight + gap) * index,
                duration: 0.35,
                ease: "power2.out"
            });
        });
    }

    ScrollTrigger.create({
        trigger: ".container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: self => {
            const progress = self.progress;
            if (progress <= 0.25) {
                gsap.set(".anim img", { opacity: 1 });
                showImage(0);
            } else if (progress <= 0.5) showImage(1);
            else if (progress <= 0.75) showImage(2);
            else showImage(3);
        }
    });

    contents.forEach(c => gsap.fromTo(c, { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: c, start: "30% bottom", end: "bottom bottom", scrub: true } }));
    gsap.fromTo(".first", { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: ".first", start: "30% bottom", end: "bottom bottom", scrub: true } });
})();