(() => {
    gsap.registerPlugin(ScrollTrigger);

    const blockClass = "transition-image";
    const defaultSize = 120;
    const defaultStart = 50;
    const defaultDur = 0.05;
    const defaultAmount = 0.25;

    const queue = new Set();
    let raf = 0;

    function build(el, opts = {}) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;

        const size = opts.size ?? (+el.dataset.size || defaultSize);
        const start = opts.start ?? (+el.dataset.start || defaultStart);
        const dur = opts.dur ?? (+el.dataset.dur || defaultDur);
        const amount = opts.amount ?? (+el.dataset.amount || defaultAmount);
        const scroll = opts.scroll !== undefined ? opts.scroll : true;
        const animate = (el.hasAttribute("data-animate") && scroll) || opts.animate;

        el.querySelectorAll("." + blockClass).forEach(n => n.remove());

        const dpr = window.devicePixelRatio || 1;
        const W = Math.round(r.width * dpr);
        const H = Math.round(r.height * dpr);
        const cols = Math.max(1, Math.ceil(W / Math.round(size * dpr)));
        const rows = Math.max(1, Math.ceil(H / Math.round(size * dpr)));
        const baseW = Math.floor(W / cols);
        const baseH = Math.floor(H / rows);
        let remW = W - baseW * cols;
        let remH = H - baseH * rows;

        const blocks = [];
        let top = 0;

        for (let y = 0; y < rows; y++) {
            const hh = baseH + (remH-- > 0 ? 1 : 0);
            let left = 0, rw = remW;

            for (let x = 0; x < cols; x++) {
                const ww = baseW + (rw-- > 0 ? 1 : 0);
                const d = document.createElement("div");

                d.className = blockClass;
                d.style.cssText = `
                    width:${ww / dpr}px;
                    height:${hh / dpr}px;
                    left:${left / dpr}px;
                    top:${top / dpr}px;
                    opacity:1;
                    position:absolute;
                    pointer-events:none;
                `;

                el.appendChild(d);
                blocks.push(d);
                left += ww;
            }

            top += hh;
        }

        if (animate && scroll) {
            gsap.set(blocks, { opacity: 1 });

            ScrollTrigger.create({
                trigger: el,
                start: `top ${start}%`,
                onEnter: () => gsap.to(blocks, {
                    opacity: 0,
                    duration: dur,
                    ease: "power2.out",
                    stagger: { amount, from: "random" },
                    overwrite: true
                }),
                onLeaveBack: () => gsap.to(blocks, {
                    opacity: 1,
                    duration: dur,
                    ease: "power2.in",
                    stagger: { amount, from: "random" },
                    overwrite: true
                })
            });

        } else {
            gsap.to(blocks, {
                opacity: 0,
                duration: dur,
                ease: "power2.out",
                stagger: { amount, from: "random" },
                overwrite: true
            });
        }
    }

    function schedule(el, opts) {
        queue.add({ el, opts });

        if (raf) return;

        raf = requestAnimationFrame(() => {
            raf = 0;
            queue.forEach(item => build(item.el, item.opts));
            queue.clear();
        });
    }

    const ro = new ResizeObserver(entries => {
        entries.forEach(e => schedule(e.target, e.target.__gridOpts));
    });

    window.Gridify = function(target = ".animation-block", opts = {}) {
        const elements =
            target instanceof Element ? [target] :
            target instanceof NodeList ? Array.from(target) :
            document.querySelectorAll(target);

        elements.forEach(el => {

            el.__gridOpts = opts; 

            if (!el.__gridReady) {
                el.__gridReady = true;
                ro.observe(el);
            }

            schedule(el, opts);
        });
    };

    requestAnimationFrame(() => Gridify());
})();