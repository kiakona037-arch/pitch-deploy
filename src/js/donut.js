        // ===== SLIDE 17: MARKET OPPORTUNITY ENGINE =====
        var moPhase = 0;
        var moPhases = [
            { amt:'', name:'', sub:'', detail:'', color:'#34d399', center:'', csub:'', stats:['','',''] },
            { amt:'$5K', name:'Pre-Launch \u2014 Use of Funds', sub:'COMPETITION CAPITAL ALLOCATION',
              detail:'Provisional Patents \u00b7 Strategic Partnerships', color:'#5eead4',
              center:'Foundation', csub:'Pre-Launch',
              stats:['$5K \u2192 Provisional patent filings (IP protection)','DTLB Alliance \u00b7 Chamber of Commerce \u00b7 Convention Bureau','Pilot organizers \u00b7 local retail & restaurant partners'] },
            { amt:'$612K', name:'LBCC \u2014 Launch Market', sub:'LAUNCH ADDRESSABLE MARKET (LAM)',
              detail:'50 Events/yr \u00b7 12,500 Booths \u00b7 625 paying Year 1', color:'#34d399',
              center:'LBCC', csub:'Launch Market',
              stats:['50 events/yr \u00b7 12,500 booths at LBCC','5% conversion \u2192 625 paying booths Year 1','$980 avg revenue/booth \u2192 $612K ARR'] },
            { amt:'$45.5M', name:'SoCal Convention Circuit', sub:'SERVICEABLE OBTAINABLE MARKET (SOM)',
              detail:'10 Venues \u00b7 500+ Events \u00b7 100K Booths', color:'#f39c12',
              center:'SoCal', csub:'Convention Circuit',
              stats:['10 venues \u00b7 500+ events/yr \u00b7 100K booths','3% adoption at maturity \u2192 3,000 booths','$15/booth SaaS fee \u00b7 recurring annual revenue'] },
            { amt:'$2.5B', name:'Western + Texas Expansion', sub:'SERVICEABLE AVAILABLE MARKET (SAM)',
              detail:'5,000 Mid-Market Events \u00b7 900K Booths', color:'#e67e22',
              center:'Western', csub:'Expansion',
              stats:['5,000 mid-market events across 14 cities','900,000 addressable exhibitor booths','$1,100 avg spend/booth \u2192 $2.5B opportunity'] },
            { amt:'$15.8B', name:'US B2B Trade Show Market', sub:'TOTAL ADDRESSABLE MARKET (TAM)',
              detail:'13,000 Events \u00b7 1.8M Exhibitor Booths', color:'#a0917d',
              center:'USA', csub:'$15.8B',
              stats:['13,000+ trade shows annually in the US','1.8M exhibitor booths \u00b7 no real-time proximity solution','Fragmented market \u2014 no dominant proximity platform'] }
        ];
        var moDonut = {
            2: { id:'mo-d-lam', bg:'mo-d-lam-bg', off:'277', leg:'mo-leg-lam' },
            3: { id:'mo-d-som', bg:'mo-d-som-bg', off:'304', leg:'mo-leg-som' },
            4: { id:'mo-d-sam', bg:'mo-d-sam-bg', off:'208', leg:'mo-leg-sam' },
            5: { id:'mo-d-tam', bg:'mo-d-tam-bg', off:'73', leg:'mo-leg-tam' }
        };
        var moLamPins = ['mo-p-lbcc'], moLamLabels = ['mo-pl-lbcc'];
        var moSomPins = ['mo-p-lacc','mo-p-anaheim','mo-p-sandiego','mo-p-pasadena','mo-p-ontario','mo-p-riverside','mo-p-palmsprings','mo-p-santabarbara','mo-p-ventura','mo-p-delmar'];
        var moSomLabels = ['mo-pl-lacc','mo-pl-anaheim','mo-pl-sandiego','mo-pl-pasadena','mo-pl-ontario','mo-pl-riverside','mo-pl-palmsprings','mo-pl-santabarbara','mo-pl-ventura','mo-pl-delmar'];
        var moSamPins = ['mo-p2-longbeach','mo-p2-sandiego','mo-p-sf','mo-p-lv','mo-p-phx','mo-p-sea','mo-p-pdx','mo-p-den','mo-p-slc','mo-p-austin','mo-p-dallas','mo-p-houston','mo-p-abq','mo-p-sanantonio'];
        var moSamLabels = ['mo-pl2-longbeach','mo-pl2-sandiego','mo-pl-sf','mo-pl-lv','mo-pl-phx','mo-pl-sea','mo-pl-pdx','mo-pl-den','mo-pl-slc','mo-pl-austin','mo-pl-dallas','mo-pl-houston','mo-pl-abq','mo-pl-sanantonio'];
        var moTamPins = ['mo-p-chi','mo-p-nyc','mo-p-dc','mo-p-mia','mo-p-atl','mo-p-msp','mo-p-nash','mo-p-orl','mo-p-nola','mo-p-tampa','mo-p-pit','mo-p-det'];
        var moTamLabels = ['mo-pl-chi','mo-pl-nyc','mo-pl-dc','mo-pl-mia','mo-pl-atl','mo-pl-msp','mo-pl-nash','mo-pl-orl','mo-pl-nola','mo-pl-tampa','mo-pl-pit','mo-pl-det'];

        function moShow(ids, delay) {
            ids.forEach(function(id,i){
                setTimeout(function(){ var e=document.getElementById(id); if(e)e.classList.add('on'); }, delay+i*60);
            });
        }

        function resetMarketSlide() {
            moPhase = 0;
            var sl = document.getElementById('moSocalLayer'), ul = document.getElementById('moUsLayer'), si = document.getElementById('moSocalInner');
            if(sl) sl.style.opacity='1'; if(ul) ul.style.opacity='0'; if(si) si.style.transform='scale(1.3) translate(0,0)';
            document.querySelectorAll('#s5 .mo-pin, #s5 .mo-plbl').forEach(function(el){ el.classList.remove('on'); });
            document.querySelectorAll('#s5 .mo-donut-arc').forEach(function(el){ el.classList.remove('on'); el.style.strokeDashoffset=''; });
            document.querySelectorAll('#s5 .mo-leg').forEach(function(el){ el.classList.remove('on'); });
            document.querySelectorAll('#s5 .mo-stat-row').forEach(function(el){ el.classList.remove('on'); el.textContent=''; });
            document.querySelectorAll('#s5 .mo-rev-row').forEach(function(el){ el.classList.remove('on'); });
            document.querySelectorAll('#s5 .rv-corr').forEach(function(el){ el.classList.remove('on'); });
            var ch = document.getElementById('moRevCorrHead'); if(ch) ch.classList.remove('on');
            var csrc = document.getElementById('moCorrSource'); if(csrc) csrc.classList.remove('on');
            // Reset merged state
            var convHead = document.getElementById('moRevConvHead'); if(convHead){ convHead.style.opacity='1'; }
            var totalHead = document.getElementById('moRevTotalHead'); if(totalHead) totalHead.classList.remove('on');
            document.querySelectorAll('#s5 .rv-corr').forEach(function(el){ el.style.display=''; });
            document.querySelectorAll('#s5 .rv-conv').forEach(function(el){ el.classList.remove('merged','glow-snap'); });
            // Reset conv values
            var resetConv = {moRevLam:'$612K', moRevSom:'$45.5M', moRevSam:'$2.5B'};
            for(var rk in resetConv){ var rRow = document.getElementById(rk); if(rRow){ var rc=rRow.querySelector('.rv-conv'); if(rc) rc.textContent=resetConv[rk]; } }
            var pi = document.getElementById('moPhaseInfo'); if(pi) pi.classList.remove('on','us-pos');
            var cl = document.getElementById('moCLabel'); if(cl) cl.textContent='';
            var cs = document.getElementById('moCSub'); if(cs) cs.textContent='';
        }

        function goToMarket(p) {
            // Phase 7: The Merge — combine revenue columns
            if (p === 7) {
                // Hide corridor column + convention header, show total header
                var convHead = document.getElementById('moRevConvHead'); if(convHead) convHead.style.opacity='0';
                var corrHead = document.getElementById('moRevCorrHead'); if(corrHead) corrHead.classList.remove('on');
                var totalHead = document.getElementById('moRevTotalHead'); if(totalHead) totalHead.classList.add('on');
                // Hide corridor amounts
                document.querySelectorAll('#s5 .rv-corr').forEach(function(el){ el.style.display='none'; });
                // Add merged class to conv cells
                document.querySelectorAll('#s5 .rv-conv').forEach(function(el){ el.classList.add('merged'); });
                // Define merge targets: [rowId, startVal, endVal, endText, delay]
                var merges = [
                    ['moRevLam', 612000, 688000, '$688K', 0],
                    ['moRevSom', 45500000, 51200000, '$51.2M', 600],
                    ['moRevSam', 2500000000, 2812000000, '$2.81B', 1200]
                ];
                function formatMerge(val, tier) {
                    if (tier === 0) return '$' + Math.round(val/1000).toLocaleString() + 'K';
                    if (tier === 1) return '$' + (val/1000000).toFixed(1) + 'M';
                    return '$' + (val/1000000000).toFixed(2) + 'B';
                }
                merges.forEach(function(m, idx) {
                    setTimeout(function() {
                        var row = document.getElementById(m[0]);
                        if (!row) return;
                        var convEl = row.querySelector('.rv-conv');
                        if (!convEl) return;
                        var start = m[1], end = m[2], duration = 1200;
                        var startTime = null;
                        function animate(ts) {
                            if (!startTime) startTime = ts;
                            var elapsed = ts - startTime;
                            var progress = Math.min(elapsed / duration, 1);
                            // Ease-out exponential for acceleration feel
                            var eased = 1 - Math.pow(1 - progress, 3);
                            var current = start + (end - start) * eased;
                            convEl.textContent = formatMerge(current, idx);
                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            } else {
                                convEl.textContent = m[3];
                                convEl.classList.add('glow-snap');
                                setTimeout(function(){ convEl.classList.remove('glow-snap'); }, 600);
                            }
                        }
                        requestAnimationFrame(animate);
                    }, m[4]);
                });
                // Update source text
                var csrc = document.getElementById('moCorrSource');
                if(csrc){ csrc.textContent='CONVENTION + CORRIDOR COMBINED'; csrc.classList.add('on'); }
                return;
            }
            // Phase 6: Corridor Revenue reveal
            if (p === 6) {
                // Show corridor revenue header
                var ch = document.getElementById('moRevCorrHead'); if(ch) ch.classList.add('on');
                // Reveal corridor amounts with stagger
                var corrIds = ['moRevCorrLam','moRevCorrSom','moRevCorrSam'];
                corrIds.forEach(function(id,i){
                    setTimeout(function(){
                        var el = document.getElementById(id); if(el) el.classList.add('on');
                    }, 300 + i * 300);
                });
                // Show source citation
                setTimeout(function(){
                    var csrc = document.getElementById('moCorrSource'); if(csrc) csrc.classList.add('on');
                }, 1200);
                return;
            }
            var d = moPhases[p];
            var info = document.getElementById('moPhaseInfo');
            info.classList.add('on');
            document.getElementById('moPhaseAmt').textContent = d.amt;
            document.getElementById('moPhaseAmt').style.color = d.color;
            document.getElementById('moPhaseName').textContent = d.name;
            document.getElementById('moPhaseName').style.color = d.color;
            document.getElementById('moPhaseSub').textContent = d.sub;
            document.getElementById('moPhaseDetail').textContent = d.detail;
            var sl = document.getElementById('moSocalLayer'), ul = document.getElementById('moUsLayer'), si = document.getElementById('moSocalInner');
            if (p <= 3) {
                sl.style.opacity='1'; ul.style.opacity='0'; info.classList.remove('us-pos');
                if (p <= 2) si.style.transform='scale(2.5) translate(-3%, -5%)';
                if (p === 3) si.style.transform='scale(1) translate(0,0)';
            } else {
                sl.style.opacity='0'; ul.style.opacity='1'; info.classList.add('us-pos');
            }
            if (p===2){ moShow(moLamPins,200); moShow(moLamLabels,500); }
            if (p===3){ moShow(moSomPins,100); moShow(moSomLabels,400); }
            if (p===4){ moShow(moSamPins,200); moShow(moSamLabels,500); }
            if (p===5){ moShow(moTamPins,200); moShow(moTamLabels,500); }
            if (moDonut[p]) {
                var dt=moDonut[p], bg=document.getElementById(dt.bg), arc=document.getElementById(dt.id), leg=document.getElementById(dt.leg);
                if(bg) bg.classList.add('on');
                if(arc){ arc.classList.add('on'); arc.style.strokeDashoffset=dt.off; }
                if(leg) leg.classList.add('on');
            }
            document.getElementById('moCLabel').textContent=d.center;
            document.getElementById('moCLabel').style.color=d.color;
            document.getElementById('moCSub').textContent=d.csub;
            var stats=d.stats||['','',''];
            for(var s=1;s<=3;s++){
                var row=document.getElementById('moStat'+s); row.classList.remove('on'); row.textContent=stats[s-1];
                if(stats[s-1]){ setTimeout((function(r){return function(){r.classList.add('on');};})(row),200+s*200); }
            }
            // Show revenue table row for LAM/SOM/SAM phases
            var revRowMap = {2:'moRevLam', 3:'moRevSom', 4:'moRevSam'};
            if (revRowMap[p]) {
                setTimeout(function(){
                    var rr = document.getElementById(revRowMap[p]); if(rr) rr.classList.add('on');
                }, 600);
            }
        }

