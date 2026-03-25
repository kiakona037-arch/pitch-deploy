    <script>
        var cur = 1, maxStages = {}, stageAt = {};
        for (var i = 1; i <= 11; i++) { maxStages[i] = 0; stageAt[i] = 0 }

        // Count max stages per slide
        var els = document.querySelectorAll('.anim');
        for (var i = 0; i < els.length; i++) {
            var s = parseInt(els[i].getAttribute('data-s'));
            var st = parseInt(els[i].getAttribute('data-st'));
            if (s && !isNaN(st)) { if (st > maxStages[s]) maxStages[s] = st }
        }
        // Slide 5: ensure GTM phases can animate (5 stages)
        maxStages[5] = 7; // 7 donut gram phases

        function showSlide(n) {
            if (n < 1 || n > 10) return;
            var slides = document.querySelectorAll('.slide');
            for (var i = 0; i < slides.length; i++)slides[i].className = 'slide';
            document.getElementById('s' + n).className = 'slide active';
            cur = n; stageAt[n] = 0;
            document.getElementById('snum').textContent = n + ' / 10';
            // Reset all anims for this slide
            var anims = document.querySelectorAll('.anim[data-s="' + n + '"]');
            for (var i = 0; i < anims.length; i++)anims[i].classList.remove('on');
            // Auto-show stage 0 after brief delay
            setTimeout(function () { advanceSlide() }, 400);
            if (n === 1) {
                var el = document.getElementById('s1-connections');
                if (el) { el.style.opacity = 1; el.style.pointerEvents = 'auto'; }
                // Reset "entire" word animation
                var entireEl = document.getElementById('s1-entire');
                if (entireEl) { entireEl.style.maxWidth = '0'; entireEl.style.opacity = '0'; }
                // Reset streak animation
                var streaks = document.querySelectorAll('.s1-streak');
                for (var i = 0; i < streaks.length; i++) {
                    streaks[i].style.animation = 'none';
                    streaks[i].offsetHeight;
                    streaks[i].style.animation = '';
                }
                // Expand "entire" after streak finishes (1.5s delay + 2.5s animation = 4s)
                setTimeout(function () {
                    var e = document.getElementById('s1-entire');
                    if (e) {
                        e.style.maxWidth = '130px';
                        e.style.opacity = '1';
                        e.style.color = '#4cdd86';
                        e.style.textShadow = '0 0 12px rgba(76,221,134,0.6)';
                    }
                }, 4200);
                // Fade "entire" back to tan
                setTimeout(function () {
                    var e = document.getElementById('s1-entire');
                    if (e) { e.style.color = '#a0917d'; e.style.textShadow = 'none'; }
                }, 5500);
            }
            // Slide 5: market opportunity (donut gram) init
            if (n === 5) { resetMarketSlide(); }
            initCanvas(n);
            manageVideos(n);
            // Slide 4 & 8: reset GTM bars
            if (n === 4 || n === 8) {
                var slideEl = document.getElementById('s' + n);
                var bars = slideEl.querySelectorAll('.gtm-bar');
                for (var i = 0; i < bars.length; i++) bars[i].style.maxWidth = '0';
            }
            // Slide 6: reset dimmed threat cards
            if (n === 6) {
                var cards = document.querySelectorAll('.s7-card');
                for (var i = 0; i < cards.length; i++) cards[i].classList.remove('dimmed');
            }
            // Slide 10: cinematic animation
            if (n === 10) { setTimeout(function () { startOriginAnimation(); }, 500); }
            if (n !== 10) { clearS11(); }
        }

        function advanceSlide() {
            var st = stageAt[cur];
            var anims = document.querySelectorAll('.anim[data-s="' + cur + '"][data-st="' + st + '"]');
            for (var i = 0; i < anims.length; i++)anims[i].classList.add('on');
            if (cur === 1) {
                if (st === 1) { var el = document.getElementById('s1-connections'); if (el) { el.style.opacity = 0; el.style.pointerEvents = 'none'; } }
            }
            // Slide 5: market opportunity custom advance (donut gram)
            if (cur === 5 && moPhase < 7) {
                moPhase++;
                goToMarket(moPhase);
                stageAt[cur]++;
                return;
            }
            // Slide 4: animate GTM bars when their stage triggers
            if (cur === 4 && st >= 3 && st <= 5) {
                var bars = document.querySelectorAll('.gtm-bar.anim[data-st="' + st + '"]');
                for (var i = 0; i < bars.length; i++) bars[i].style.maxWidth = '60px';
            }
            // Slide 8: animate timeline bars when timeline divider appears
            if (cur === 8 && st === 2) {
                var s8bars = document.getElementById('s8').querySelectorAll('.gtm-bar');
                for (var i = 0; i < s8bars.length; i++) s8bars[i].style.maxWidth = '60px';
            }
            // Slide 6: dim threat cards when Sonar appears
            if (cur === 6 && st === 2) {
                var cards = document.querySelectorAll('.s7-card');
                for (var i = 0; i < cards.length; i++) cards[i].classList.add('dimmed');
            }

            stageAt[cur]++;
        }

        // Show a slide with ALL animations already revealed (for going back a slide)
        function showSlideComplete(n) {
            if (n < 1 || n > 10) return;
            var slides = document.querySelectorAll('.slide');
            for (var i = 0; i < slides.length; i++) slides[i].className = 'slide';
            document.getElementById('s' + n).className = 'slide active';
            cur = n;
            document.getElementById('snum').textContent = n + ' / 10';
            // Show ALL animation stages
            var anims = document.querySelectorAll('.anim[data-s="' + n + '"]');
            for (var i = 0; i < anims.length; i++) anims[i].classList.add('on');
            stageAt[n] = maxStages[n] + 1; // all stages shown
            // Apply special slide effects in their final state
            if (n === 1) {
                var el = document.getElementById('s1-connections');
                if (el) { el.style.opacity = 1; el.style.pointerEvents = 'auto'; }
            }
            // Slide 5: show all donut gram phases
            if (n === 5) {
                resetMarketSlide();
                moPhase = 7;
                for(var mp=1;mp<=7;mp++) goToMarket(mp);
            }
            if (n === 6) {
                var cards = document.querySelectorAll('.s7-card');
                for (var i = 0; i < cards.length; i++) cards[i].classList.add('dimmed');
            }
            if (n === 4 || n === 8) {
                var slideEl = document.getElementById('s' + n);
                var bars = slideEl.querySelectorAll('.gtm-bar');
                for (var i = 0; i < bars.length; i++) bars[i].style.maxWidth = '60px';
            }
            initCanvas(n);
        }

        // Reverse one animation step on the current slide
        function reverseStep() {
            if (stageAt[cur] <= 1) {
                // Already at stage 0 (or 1), go back a full slide (showing it complete)
                if (cur > 1) showSlideComplete(cur - 1);
                return;
            }
            stageAt[cur]--;
            var st = stageAt[cur];
            // Hide elements at this stage
            var anims = document.querySelectorAll('.anim[data-s="' + cur + '"][data-st="' + st + '"]');
            for (var i = 0; i < anims.length; i++) anims[i].classList.remove('on');
            // Reverse special slide effects
            if (cur === 1 && st === 1) {
                var el = document.getElementById('s1-connections');
                if (el) { el.style.opacity = 1; el.style.pointerEvents = 'auto'; }
            }
            // Slide 5: market opportunity custom reverse (donut gram)
            if (cur === 5) {
                if (moPhase > 0) {
                    var targetPhase = moPhase - 1;
                    resetMarketSlide();
                    moPhase = targetPhase;
                    stageAt[cur]--;
                    for(var mp=1;mp<=moPhase;mp++) goToMarket(mp);
                    if(moPhase===0){ document.getElementById('moPhaseInfo').classList.remove('on','us-pos'); document.getElementById('moSocalLayer').style.opacity='1'; document.getElementById('moUsLayer').style.opacity='0'; document.getElementById('moSocalInner').style.transform='scale(1.3) translate(0,0)'; }
                    return;
                }
            }
        }

        // Forward one step (existing logic wrapped)
        function forwardStep() {
            if (stageAt[cur] <= maxStages[cur]) { advanceSlide(); }
            else { showSlide(cur + 1); }
        }

        // ===== SLIDE 12 CINEMATIC ANIMATION =====
        var s11Timers = [];
        function clearS11() {
            for (var i = 0; i < s11Timers.length; i++) clearTimeout(s11Timers[i]);
            s11Timers = [];
            var vid = document.getElementById('s12-video');
            if (vid) { vid.pause(); vid.currentTime = 0; }
        }
        function startOriginAnimation() {
            clearS11();
            // Reset elements
            var phone = document.getElementById('s12-phone');
            var text = document.getElementById('s12-text');
            var footer = document.getElementById('s12-footer');
            if (!phone) return;
            phone.style.opacity = '0'; phone.style.transform = 'scale(0.05)';
            text.style.opacity = '0';
            footer.style.opacity = '0';
            // Phone expand + video play (1s)
            s11Timers.push(setTimeout(function () {
                phone.style.opacity = '1';
                phone.style.transform = 'scale(1)';
                var vid = document.getElementById('s12-video');
                if (vid) vid.play();
            }, 1000));
            // Text decode (2.5s)
            s11Timers.push(setTimeout(function () {
                text.style.opacity = '1';
                decodeText(document.getElementById('s12-tag'), 'SONAR LIVE // WHERE IT ALL BEGAN');
                decodeText(document.getElementById('s12-title'), 'The Origin');
                decodeText(document.getElementById('s12-sub'), 'The social engine that started it all');
            }, 2500));
            // Footer fade in (3.5s)
            s11Timers.push(setTimeout(function () {
                footer.style.opacity = '1';
            }, 3500));
        }
        function decodeText(el, finalText) {
            if (!el) return;
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!&';
            var iterations = 0;
            var interval = setInterval(function () {
                el.textContent = finalText.split('').map(function (c, i) {
                    if (c === ' ') return ' ';
                    if (i < iterations) return finalText[i];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
                iterations += 0.3125;
                if (iterations >= finalText.length) {
                    clearInterval(interval);
                    el.textContent = finalText;
                }
            }, 25);
        }

        var lock = false;
        document.body.onclick = function () {
            if (lock) return; lock = true; setTimeout(function () { lock = false }, 400);
            forwardStep();
        };

        document.onkeydown = function (e) {
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                forwardStep();
            }
            else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
                e.preventDefault();
                reverseStep();
            }
            else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                showSlide(cur + 1);
            }
            else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (cur > 1) showSlideComplete(cur - 1);
            }
        };

        // ===== CANVAS ANIMATIONS =====
        var ctxs = {};
        var animPaused = false;
        function initCanvas(n) {
            var cv = document.getElementById('c' + n);
            if (!cv) return;
            cv.width = window.innerWidth; cv.height = window.innerHeight;
            ctxs[n] = cv.getContext('2d');
        }
        // Debounced resize for performance
        var resizeTimer;
        window.onresize = function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                for (var n = 1; n <= 11; n++) {
                    var cv = document.getElementById('c' + n);
                    if (cv) { cv.width = window.innerWidth; cv.height = window.innerHeight }
                }
            }, 150);
        };
        // Pause animations when tab is hidden
        document.addEventListener('visibilitychange', function() {
            animPaused = document.hidden;
            // Pause all videos when tab hidden
            var vids = document.querySelectorAll('video');
            if (document.hidden) {
                for (var i = 0; i < vids.length; i++) vids[i].pause();
            } else {
                // Resume video on active slide only
                manageVideos(cur);
            }
        });

        // Slide-specific data
        var s2booths = [], s2att = [], s2miss = 0, s2cost = 0;
        for (var r = 0; r < 4; r++)for (var c = 0; c < 8; c++)s2booths.push({ x: 100 + c * 140, y: 130 + r * 130, w: 55, h: 35 });
        for (var i = 0; i < 100; i++)s2att.push({ x: Math.random() * 1920, y: Math.random() * 1080, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, r: 2 + Math.random() * 2, t: Math.random() * 200 });

        // Revenue calculator
        var s5rev = 0;

        // Video management: pause inactive videos, play active
        function manageVideos(n) {
            var allVids = document.querySelectorAll('video');
            for (var i = 0; i < allVids.length; i++) {
                var slide = allVids[i].closest('.slide');
                if (slide && !slide.classList.contains('active')) {
                    allVids[i].pause();
                }
            }
            // Play video on active slide
            var activeSlide = document.getElementById('s' + n);
            if (activeSlide) {
                var activeVids = activeSlide.querySelectorAll('video[autoplay]');
                for (var i = 0; i < activeVids.length; i++) {
                    activeVids[i].play().catch(function(){});
                }
            }
        }

        function drawAll() {
            // Skip rendering when tab is hidden
            if (animPaused) { requestAnimationFrame(drawAll); return; }
            // Only render the active slide's canvas for performance
            var n = cur;
            var cv = document.getElementById('c' + n);
            if (cv && cv.getContext) {
                var cx = cv.getContext('2d');
                var W = cv.width, H = cv.height;
                cx.clearRect(0, 0, W, H);

                // Grid for all slides
                cx.strokeStyle = 'rgba(30,25,20,0.2)'; cx.lineWidth = 1;
                for (var x = 0; x < W; x += 80) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke() }
                for (var y = 0; y < H; y += 80) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke() }

                if (n === 1) {
                    // Concentric sonar rings
                    var t = Date.now() / 1000;
                    for (var r = 0; r < 5; r++) {
                        var rad = 80 + r * 90 + (Math.sin(t + r) * 10);
                        cx.beginPath(); cx.arc(W / 2, H / 2, rad, 0, Math.PI * 2);
                        cx.strokeStyle = 'rgba(230,126,34,' + (0.08 - r * 0.015) + ')'; cx.lineWidth = 2; cx.stroke();
                    }
                    // Particles
                    for (var p = 0; p < 40; p++) {
                        var a = t * 0.3 + p * 0.16;
                        var d = 150 + p * 8 + Math.sin(t + p) * 20;
                        var px = W / 2 + Math.cos(a) * d;
                        var py = H / 2 + Math.sin(a) * d;
                        cx.beginPath(); cx.arc(px, py, 1.5, 0, Math.PI * 2);
                        cx.fillStyle = 'rgba(230,126,34,' + (0.1 + Math.sin(t + p) * 0.1) + ')'; cx.fill();
                    }
                }
                else if (n === 2 && document.getElementById('s2').classList.contains('active')) {
                    // Convention floor
                    for (var b = 0; b < s2booths.length; b++) { var bo = s2booths[b]; cx.fillStyle = 'rgba(60,45,30,0.35)'; cx.fillRect(bo.x, bo.y, bo.w, bo.h); cx.strokeStyle = 'rgba(80,60,40,0.3)'; cx.strokeRect(bo.x, bo.y, bo.w, bo.h) }
                    for (var a = 0; a < s2att.length; a++) {
                        var p = s2att[a]; p.t--; if (p.t <= 0) { p.vx = (Math.random() - 0.5) * 2; p.vy = (Math.random() - 0.5) * 2; p.t = 100 + Math.random() * 200 }
                        p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                        for (var b = 0; b < s2booths.length; b++) { var bo = s2booths[b]; if (Math.abs(p.x - (bo.x + bo.w / 2)) < 50 && Math.abs(p.y - (bo.y + bo.h / 2)) < 50 && Math.random() < 0.001) s2miss++ }
                        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cx.fillStyle = 'rgba(160,140,110,0.4)'; cx.fill()
                    }
                    if (stageAt[2] >= 1) { s2cost += 0.47; document.getElementById('s2cost').textContent = '$' + Math.floor(s2cost).toLocaleString() }
                    if (stageAt[2] >= 2) document.getElementById('s2miss').textContent = s2miss;
                }
                else if (n === 3 && document.getElementById('s5').classList.contains('active')) {
                    // Gold particles
                    var t = Date.now() / 1000;
                    for (var p = 0; p < 30; p++) {
                        var px = (p * 67) % W;
                        var py = H - 50 - ((t * 20 + p * 30) % H);
                        cx.beginPath(); cx.arc(px, py, 1 + Math.sin(t + p) * 0.5, 0, Math.PI * 2);
                        cx.fillStyle = 'rgba(243,156,18,' + (0.1 + Math.sin(t * 2 + p) * 0.1) + ')'; cx.fill();
                    }
                    if (stageAt[5] >= 4 && s5rev < 103225) { s5rev += 17; document.getElementById('s4rev').textContent = '$' + Math.floor(s5rev).toLocaleString() }
                }
                else if (n === 3) {
                    // Radar sweep
                    var t = Date.now() / 1000;
                    var angle = t * 0.8;
                    cx.save(); cx.translate(W / 2, H / 2);
                    for (var r = 0; r < 4; r++) { cx.beginPath(); cx.arc(0, 0, 80 + r * 70, 0, Math.PI * 2); cx.strokeStyle = 'rgba(230,126,34,' + (0.06 - r * 0.012) + ')'; cx.lineWidth = 1; cx.stroke() }
                    cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(Math.cos(angle) * 300, Math.sin(angle) * 300); cx.strokeStyle = 'rgba(230,126,34,0.15)'; cx.lineWidth = 2; cx.stroke();
                    cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, 300, angle - 0.3, angle); cx.closePath();
                    var grd = cx.createRadialGradient(0, 0, 0, 0, 0, 300); grd.addColorStop(0, 'rgba(230,126,34,0.08)'); grd.addColorStop(1, 'rgba(230,126,34,0)');
                    cx.fillStyle = grd; cx.fill();
                    cx.restore();
                }
                else if (n === 3) {
                    // Spotlight
                    var t = Date.now() / 1000;
                    cx.save();
                    var grd = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 350);
                    grd.addColorStop(0, 'rgba(243,156,18,0.06)'); grd.addColorStop(0.5, 'rgba(243,156,18,0.02)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
                    cx.fillStyle = grd; cx.fillRect(0, 0, W, H);
                    // Rising embers
                    for (var p = 0; p < 20; p++) {
                        var px = W / 2 + (Math.sin(t + p * 2) * 80);
                        var py = H - ((t * 30 + p * 50) % H);
                        cx.beginPath(); cx.arc(px, py, 1 + Math.sin(t * 3 + p) * 0.5, 0, Math.PI * 2);
                        cx.fillStyle = 'rgba(243,156,18,' + (0.15 + Math.sin(t + p) * 0.1) + ')'; cx.fill();
                    }
                    cx.restore();
                }
                else {
                    // Default: subtle orange particles
                    var t = Date.now() / 1000;
                    for (var p = 0; p < 15; p++) {
                        var px = (p * 131 + Math.sin(t + p) * 20) % W;
                        var py = (p * 97 + Math.cos(t + p) * 20) % H;
                        cx.beginPath(); cx.arc(px, py, 1, 0, Math.PI * 2);
                        cx.fillStyle = 'rgba(230,126,34,0.08)'; cx.fill();
                    }
                }
            }
            requestAnimationFrame(drawAll);
        }

