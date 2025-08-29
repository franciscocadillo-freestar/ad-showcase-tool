document.addEventListener('DOMContentLoaded', () => {
    // A single source of truth for all ad products.
    const adProducts = [
        { name: "Display - Leaderboard", size: "728x90", description: "Standard leaderboard for the top of pages.", behavior: { mockup: { type: "in-content", placement: "top" }, live: { type: "draggable" } }, className: "ad-728x90" },
        { name: "Display - MPU", size: "300x250", description: "A versatile medium rectangle that fits well within content.", behavior: { mockup: { type: "in-content", placement: "in-article" }, live: { type: "draggable" } }, className: "ad-300x250" },
        { name: "Siderail", size: "300x600", description: "A high-impact unit for sidebars. Formerly Half Page.", behavior: { mockup: { type: "in-content", placement: "sidebar" }, live: { type: "draggable" } }, className: "ad-300x600" },
        { name: "Tall Siderail", size: "160x600", description: "A tall, narrow unit for webpage sidebars. Formerly Skyscraper.", behavior: { mockup: { type: "in-content", placement: "sidebar" }, live: { type: "draggable" } }, className: "ad-160x600" },
        { name: "Sticky Footer", size: "320x50", description: "Remains fixed at the bottom of the user’s screen as they scroll.", behavior: { mockup: { type: "special", id: "sticky-footer" }, live: { type: "special", id: "sticky-footer" } } },
        { name: "Sidewalls", size: "160x600", description: "Sticky ads appearing in the left and right margins of a desktop webpage.", behavior: { mockup: { type: "special", id: "sidewalls" }, live: { type: "special", id: "sidewalls" } } },
        { name: "Interstitial", size: "300x250", description: "A full-screen ad that covers the interface, shown between page loads.", behavior: { mockup: { type: "special", id: "interstitial" }, live: { type: "special", id: "interstitial" } } },
        { name: "Primis Video Slider", size: "300x250", description: "A video unit that slides into view at the bottom corner of the page.", behavior: { mockup: { type: 'special', id: 'primis-slider' }, live: { type: "special", id: 'primis-slider' } } }
    ];
    const freestarLogoUrl = 'images/freestar-logo.png';
    let currentMode = 'mockup';

    // Get all DOM elements
    const body = document.body;
    const collapseButton = document.getElementById('collapse-button');
    const mockupModeBtn = document.getElementById('mockup-mode-btn'), liveModeBtn = document.getElementById('live-mode-btn');
    const liveUrlLoader = document.getElementById('live-url-loader');
    const urlInput = document.getElementById('url-input'), loadSiteButton = document.getElementById('load-site-button');
    const adUnitList = document.getElementById('ad-unit-list');
    const clearButton = document.getElementById('clear-demos-button');
    const infoContainer = document.getElementById('ad-info-container');
    const previewContainer = document.getElementById('preview-container');
    const adOverlayContainer = document.getElementById('ad-overlay-container');
    const mockupPlaceholders = { top: document.getElementById('top-leaderboard-spot'), inArticle: document.getElementById('in-article-spot'), sidebar: document.getElementById('sidebar-spot') };

    // --- 1. Top Level Controls ---
    collapseButton.addEventListener('click', () => {
        const isCollapsed = body.classList.toggle('controls-collapsed');
        collapseButton.textContent = isCollapsed ? 'Show Controls' : 'Hide Controls';
    });

    function switchMode(newMode) {
        currentMode = newMode;
        mockupModeBtn.classList.toggle('active', newMode === 'mockup');
        liveModeBtn.classList.toggle('active', newMode === 'live');
        liveUrlLoader.classList.toggle('is-hidden', newMode === 'mockup');
        previewContainer.className = `${newMode}-mode`;
        renderAllCheckedAds();
    }
    mockupModeBtn.addEventListener('click', () => switchMode('mockup'));
    liveModeBtn.addEventListener('click', () => switchMode('live'));
    switchMode('mockup');

    loadSiteButton.addEventListener('click', () => {
        let url = urlInput.value.trim(); if (!url) return;
        if (!url.startsWith('http')) { url = 'https://' + url; urlInput.value = url; }
        document.getElementById('site-iframe').src = url;
    });

    // --- 2. Ad Library Population ---
    adProducts.forEach(product => {
        const item = document.createElement('div'); item.className = 'unit-item';
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `cb-${product.name.replace(/\s/g,'')}`; checkbox.dataset.productName = product.name;
        const label = document.createElement('label'); label.htmlFor = checkbox.id; label.textContent = `${product.name} (${product.size})`;
        item.append(checkbox, label); adUnitList.appendChild(item);
        checkbox.addEventListener('change', renderAllCheckedAds);
    });

    // --- 3. Master Rendering Logic ---
    function renderAllCheckedAds() {
        adOverlayContainer.innerHTML = '';
        for(const key in mockupPlaceholders) { mockupPlaceholders[key].innerHTML = ''; }
        infoContainer.innerHTML = ''; // Clear info container
        
        const checkedCheckboxes = adUnitList.querySelectorAll('input:checked');

        // MODIFIED: Logic to populate the info container
        if (checkedCheckboxes.length === 0) {
            infoContainer.innerHTML = '<p>Select one or more ad products to demonstrate.</p>';
        } else if (checkedCheckboxes.length === 1) {
            const product = adProducts.find(p => p.name === checkedCheckboxes[0].dataset.productName);
            if (product) {
                infoContainer.innerHTML = `<h2>${product.name}</h2><p>${product.description}</p>`;
            }
        } else {
            infoContainer.innerHTML = '<h2>Currently Active Demos:</h2>';
            const list = document.createElement('ul');
            checkedCheckboxes.forEach(checkbox => {
                const item = document.createElement('li');
                item.textContent = checkbox.dataset.productName;
                list.appendChild(item);
            });
            infoContainer.appendChild(list);
        }
        
        checkedCheckboxes.forEach(checkbox => {
            const product = adProducts.find(p => p.name === checkbox.dataset.productName);
            if(product) {
                const behavior = product.behavior[currentMode];
                if(behavior) renderSingleAd(product, behavior);
            }
        });
    }

    function renderSingleAd(product, behavior) {
        let adElement;
        if (behavior.type === 'in-content') {
            adElement = document.createElement('div');
            adElement.className = `ad-box ${product.className}`;
            adElement.appendChild(createCreative(product));
            mockupPlaceholders[behavior.placement].appendChild(adElement);
        } else if (behavior.type === 'draggable') {
            adElement = document.createElement('div');
            adElement.className = `draggable-ad ${product.className}`;
            adElement.appendChild(createCreative(product));
            makeDraggable(adElement);
            adOverlayContainer.appendChild(adElement);
        } else if (behavior.type === 'special') {
            adElement = createSpecialAd(behavior.id, product);
            if (adElement) adOverlayContainer.appendChild(adElement);
        }
    }

    function createCreative(product) {
        const creative = document.createElement('div'); creative.className = 'ad-creative-content';
        const logo = document.createElement('img'); logo.src = freestarLogoUrl; logo.className = 'logo';
        const text = document.createElement('div'); text.className = 'creative-text'; text.textContent = `${product.name} (${product.size})`;
        creative.append(logo, text); return creative;
    }

    function createSpecialAd(id, product) {
        let adElement;
        const closeAndUncheck = () => { adUnitList.querySelector(`[data-product-name="${product.name}"]`).checked = false; renderAllCheckedAds(); };

        if (id === 'sticky-footer') {
            adElement = document.createElement('div'); adElement.className = 'sticky-footer-demo';
            const creative = createCreative(product); creative.style.width = '320px'; creative.style.height = '50px';
            adElement.appendChild(creative);
        } else if (id === 'sidewalls') {
            const left = document.createElement('div'); left.className = 'sidewall-container sidewall-left'; left.appendChild(createCreative(product));
            const right = document.createElement('div'); right.className = 'sidewall-container sidewall-right'; right.appendChild(createCreative(product));
            adOverlayContainer.append(left, right); return null;
        } else if (id === 'interstitial') {
            adElement = document.createElement('div'); adElement.className = 'interstitial-container';
            const content = document.createElement('div'); content.style.width='300px'; content.style.height='250px'; content.appendChild(createCreative(product));
            const close = document.createElement('span'); close.className = 'interstitial-close'; close.innerHTML = '&times;'; close.onclick = closeAndUncheck;
            adElement.append(close, content);
        } else if (id === 'primis-slider') {
            adElement = document.createElement('div'); adElement.className = 'primis-slider-demo';
            const close = document.createElement('span'); close.className = 'interstitial-close'; close.innerHTML = '&times;'; close.onclick = closeAndUncheck;
            adElement.append(close, createCreative(product));
        }
        return adElement;
    }

    function makeDraggable(el) {
        let p1=0, p2=0, p3=0, p4=0;
        el.onmousedown = e => {
            e.preventDefault(); p3 = e.clientX; p4 = e.clientY;
            document.onmouseup = () => { document.onmouseup=null; document.onmousemove=null; };
            document.onmousemove = e => {
                e.preventDefault(); p1=p3-e.clientX; p2=p4-e.clientY; p3=e.clientX; p4=e.clientY;
                el.style.top = (el.offsetTop-p2)+"px"; el.style.left=(el.offsetLeft-p1)+"px";
            };
        };
    }
    
    // --- Filter and Clear ---
    document.getElementById('ad-filter-input').addEventListener('keyup', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.unit-item').forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
        });
    });
    clearButton.addEventListener('click', () => {
        adUnitList.querySelectorAll('input:checked').forEach(c => c.checked = false);
        renderAllCheckedAds();
    });
});
