/**
 * Aidus Live - FastAPI Frontend API Client
 * Dynamically connects UI forms, event buttons, donations, volunteers, and admin tools to FastAPI endpoints.
 */

(function () {
    const API_BASE = window.location.origin + '/api';
    const RAZORPAY_PAYMENT_URL = 'https://razorpay.me/@microbotwaretechnology';

    // Helper Toast Notification
    function showToast(message, type = 'success') {
        let toastContainer = document.getElementById('aidus-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'aidus-toast-container';
            toastContainer.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#ff5528';
        toast.style.cssText = `background:${bgColor};color:#fff;padding:14px 22px;border-radius:12px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.3);opacity:0;transform:translateY(20px);transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
        toast.innerText = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    // =========================================================
    // Donate button loading state — toggles "Donating..." spinner
    // =========================================================
    function setDonatingState(on) {
        var btns = [
            document.getElementById('payButton'),
            document.getElementById('drawerDonateBtn')
        ];
        btns.forEach(function (b) {
            if (!b) return;
            if (on) {
                if (!b.dataset.origHtml) b.dataset.origHtml = b.innerHTML;
                b.disabled = true;
                b.style.opacity = '0.75';
                b.style.cursor = 'wait';
                b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Donating...';
            } else {
                b.disabled = false;
                b.style.opacity = '';
                b.style.cursor = '';
                if (b.dataset.origHtml) b.innerHTML = b.dataset.origHtml;
            }
        });
    }
    function getField(form, selectors, fallback = '') {
        return form.querySelector(selectors)?.value?.trim() || fallback;
    }

    // function collectDonationItems(form) {
    //     const items = [];
    //     form.querySelectorAll('.food-checkee:checked').forEach(input => {
    //         const qtyInput = input.closest('label')?.querySelector('.food-qty');
    //         const name = qtyInput?.dataset.foodName || input.closest('label')?.querySelector('span')?.innerText || `Item ${input.value}`;
    //         const quantity = parseInt(qtyInput?.value || '1', 10) || 1;
    //         const price = parseFloat(input.dataset.price || '0') || 0;
    //         items.push({ id: input.value, name, quantity, price, total: price * quantity });
    //     });
    //     form.querySelectorAll('.food-dropdown').forEach(select => {
    //         const option = select.selectedOptions?.[0];
    //         if (!select.value || !option) return;
    //         const price = parseFloat(option.dataset.price || '0') || 0;
    //         items.push({ id: select.value, name: option.textContent.trim(), quantity: 1, price, total: price });
    //     });
    //     return items;
    // }
    function collectDonationItems(form) {
    const items = [];

    // ============================================================
    // Compute active food qty (max across selected food items)
    // — needed for per-person add-ons
    // ============================================================
    function getActiveFoodQty() {
        let maxQty = 0;
        form.querySelectorAll('.is-food .food-checkee:checked').forEach(cb => {
            const qtyInput = form.querySelector(
                '.food-qty[name="food_qty[' + cb.value + ']"]'
            );
            if (qtyInput && qtyInput.type !== 'hidden') {
                const v = parseInt(qtyInput.value, 10);
                if (!isNaN(v) && v > maxQty) maxQty = v;
            }
        });
        return maxQty;
    }
    const activeFoodQty = getActiveFoodQty();

    form.querySelectorAll('.food-checkee:checked').forEach(input => {
        const itemEl = input.closest('.food-itemee');
        const qtyInput = itemEl?.querySelector('.food-qty');
        const nameSpan = itemEl?.querySelector('.food-name-span')
                      || itemEl?.querySelector('span');

        const varietyInput = itemEl?.querySelector('.variety-input');
        const variety = (varietyInput?.value || '').trim();

        let name = qtyInput?.dataset.foodName
            || (nameSpan ? nameSpan.innerText.split('\n')[0].trim() : '')
            || `Item ${input.value}`;

        if (variety) {
            name = name.split('·')[0].trim();
            name = name + ' · ' + variety;
        }

        // ✅ Strip trailing "× N" badge text from name (if present)
        name = name.replace(/\s*×\s*\d+\s*$/, '').trim();

        const isFlat  = itemEl?.classList.contains('is-flat');
        const isAddon = itemEl?.classList.contains('is-addon');

        // ============================================================
        // Quantity resolution — single source of truth
        // ============================================================
        let quantity;
        if (isFlat) {
            // Print radios / Flex banner → read shared qty input
            if (input.classList.contains('print-size-cb')) {
                quantity = parseInt(
                    form.querySelector('#printQty')?.value || '1', 10
                ) || 1;
            } else if (input.classList.contains('flex-banner-cb')) {
                quantity = parseInt(
                    form.querySelector('#flexBannerQty')?.value || '1', 10
                ) || 1;
            } else {
                quantity = 1;   // Video, Celebration Pack, Teddy Wish
            }
        } else if (isAddon) {
            // Add-on: own-qty OR per-person
            const ownQtyInput = itemEl?.querySelector('.food-qty.addon-qty');
            if (ownQtyInput) {
                // Grocery Kit / Dog Feed / Plant Saplings
                quantity = parseInt(ownQtyInput.value || '1', 10) || 1;
            } else {
                // ✅ Per-person add-on → use active food qty
                //    (Chocolate, Biscuits, Milk, Water Bottle, Banana, etc.)
                quantity = activeFoodQty > 0 ? activeFoodQty : 1;
            }
        } else {
            // Regular food item
            quantity = parseInt(qtyInput?.value || '1', 10) || 1;
        }

        const price = parseFloat(input.dataset.price || '0') || 0;

// ============================================================
// FREE detection — same rule as calculateTotal() in donate.html
// Video (id=14) is FREE when active food qty > 50
// ============================================================
const VIDEO_ID_LOCAL = '14';
const FREE_VIDEO_THRESHOLD_LOCAL = 50;
const isFree = (input.value === VIDEO_ID_LOCAL)
               && activeFoodQty > FREE_VIDEO_THRESHOLD_LOCAL;

items.push({
    id: input.value,
    name: name,                                // ✅ clean — flag handles it
    quantity,
    price: isFree ? 0 : price,
    total: isFree ? 0 : (price * quantity),
    is_free: isFree
});
    });

// Dropdown items (.food-dropdown) — special donations
form.querySelectorAll('.food-dropdown').forEach(select => {
    const option = select.selectedOptions?.[0];
    if (!select.value || !option) return;
    const price = parseFloat(option.dataset.price || '0') || 0;
    items.push({
        id: select.value,
        name: option.textContent.trim(),
        quantity: 1,
        price,
        total: price,
        is_free: false
    });
});

// ✅ CAKE — separate dropdown (class="cake-dropdown")
const cakeSelect = form.querySelector('#cake-dropdown')
                || form.querySelector('select[name="cake_id"]');
if (cakeSelect && cakeSelect.value) {
    const cakeOpt = cakeSelect.selectedOptions?.[0];
    if (cakeOpt) {
        const cakePrice = parseFloat(cakeOpt.dataset.price || '0') || 0;

        // Quantity = weight (kg), 1..5
        const kgRaw = form.querySelector('#cakeQty')?.value
                   || form.querySelector('[name="cake_qty"]')?.value
                   || '1';
        const kg = Math.max(1, Math.min(5, parseInt(kgRaw, 10) || 1));

        // Shape
        const shapeInput = form.querySelector('input[name="cake_shape"]:checked');
        const shape = shapeInput ? shapeInput.value : 'Round';

        // Base name — strip trailing " — ₹XXX" from option text
        const rawText = (cakeOpt.textContent || '').trim();
        const baseName = rawText.replace(/\s*—\s*₹[\d,.]+.*$/, '').trim();

        items.push({
            id: cakeSelect.value,
            name: baseName + ' (' + shape + ')',
            quantity: kg,
            price: cakePrice,
            total: cakePrice * kg,
            is_free: false
        });
    }
}

return items;

}   
    function updateDonationTotal(form) {
        const items = collectDonationItems(form);
        const total = items.reduce((sum, item) => sum + item.total, 0);
        const totalText = form.querySelector('#totalee');
        const totalInput = form.querySelector('#total_amtee');

        form.querySelectorAll('.food-checkee').forEach(input => {
            const qtyInput = input.closest('label')?.querySelector('.food-qty');
            if (qtyInput && qtyInput.type !== 'hidden') {
                qtyInput.style.display = input.checked ? 'block' : 'none';
            }
        });

        if (totalText) {
            totalText.textContent = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
            }).format(total);
        }

        if (totalInput) {
            totalInput.value = total.toFixed(2);
        }

        return total;
    }

    // Modal Builder for Event Registration
    function showEventRegisterModal(eventId, eventTitle = 'Charity Event') {
        let existingModal = document.getElementById('event-register-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'event-register-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        modal.innerHTML = `
            <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;max-width:450px;width:100%;color:#fff;font-family:'Outfit',sans-serif;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Register for Event</h3>
                    <button id="close-event-modal" style="background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">Event: <strong style="color:#ff5528;">${eventTitle}</strong></p>
                <form id="event-modal-form">
                    <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:6px;font-size:13px;color:#94a3b8;">Your Full Name</label>
                        <input type="text" id="event_reg_name" required placeholder="John Doe" style="width:100%;padding:12px 16px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div style="margin-bottom:24px;">
                        <label style="display:block;margin-bottom:6px;font-size:13px;color:#94a3b8;">Email Address</label>
                        <input type="email" id="event_reg_email" required placeholder="john@example.com" style="width:100%;padding:12px 16px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <button type="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#ff5528,#ff6f42);border:none;border-radius:12px;color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 4px 15px rgba(255,85,40,0.4);">Confirm Registration</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-event-modal').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        document.getElementById('event-modal-form').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('event_reg_name').value;
            const email = document.getElementById('event_reg_email').value;

            try {
                const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email })
                });

                if (res.ok) {
                    const data = await res.json();
                    showToast(`🎉 Registration Successful! Total Registered: ${data.registered_count}`, 'success');
                    modal.remove();
                } else {
                    const err = await res.json();
                    showToast(err.detail || 'Registration failed.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Server connection error.', 'error');
            }
        };
    }

    document.addEventListener('DOMContentLoaded', function () {
        console.log("Smart Help Foundation FastAPI Client Initialized.");

        document.addEventListener('click', function (e) {
            const cta = e.target.closest('a, button');
            if (!cta || cta.closest('#donationForm') || cta.closest('#summaryDrawer') || cta.id === 'drawerDonateBtn') return;

            const ctaText = cta.textContent.trim().toLowerCase();
            const ctaHref = cta.getAttribute('href') || '';
            let targetPage = '';

            if (ctaText.includes('donate now') || ctaText === 'donate' || ctaHref.endsWith('donate.html') || ctaHref.endsWith('/donate')) targetPage = '/donate';
            else if (ctaText.includes('add to cart') || ctaHref.endsWith('cart.html')) targetPage = 'cart.html';
            else if (ctaText.includes('checkout') || ctaText.includes('proceed to checkout') || ctaHref.endsWith('checkout.html')) targetPage = 'checkout.html';
            else if (ctaText.includes('contact with us') || ctaText === 'contact us' || ctaHref.endsWith('contact.html')) targetPage = 'contact.html';
            else if (ctaText.includes('become volunteer')) targetPage = 'become-volunteer.html';
            else if (ctaText === 'volunteer') targetPage = 'volunteer-1.html';
            else if (ctaText.includes('our causes') || ctaText === 'causes') targetPage = 'causes.html';
            else if (ctaText === 'services') targetPage = 'service.html';
            else if (ctaText === 'portfolio') targetPage = 'portfolio.html';
            else if (ctaText === 'shop') targetPage = 'shop.html';
            else if (ctaText === 'blog') targetPage = 'blog.html';
            else if (cta.classList.contains('comment-reply-link')) targetPage = 'blog-single.html#comment-form';
            else if (ctaHref === '#' && cta.getAttribute('aria-label') === 'Previous') targetPage = 'blog.html';
            else if (ctaHref === '#' && cta.getAttribute('aria-label') === 'Next') targetPage = 'blog.html';

            if (targetPage && (ctaHref === '#' || ctaHref === '' || ctaHref.endsWith(targetPage) || cta.tagName === 'BUTTON')) {
    e.preventDefault();
    window.location.href = targetPage;
    return;
}

            if (ctaHref === '#' && cta.closest('.mini-cart-item, .cart-area')) {
                e.preventDefault();
                const removableItem = cta.closest('.mini-cart-item, .cart-item, tr');
                if (removableItem) removableItem.remove();
                showToast('Item removed from cart.', 'success');
                return;
            }

            if (ctaHref === '#' && cta.closest('.social-media, .footer-socialicon')) {
    e.preventDefault();
    window.location.href = 'contact.html';
}
        }, true);

        document.querySelectorAll('.header-search-form form').forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = form.querySelector('input')?.value.trim().toLowerCase() || '';
                const routes = [
                    ['donate', 'donate.html'],
                    ['payment', 'donate.html'],
                    ['cause', 'causes.html'],
                    ['event', 'event.html'],
                    ['volunteer', 'volunteer-1.html'],
                    ['service', 'service.html'],
                    ['shop', 'shop.html'],
                    ['cart', 'cart.html'],
                    ['checkout', 'checkout.html'],
                    ['contact', 'contact.html'],
                    ['about', 'about.html'],
                    ['blog', 'blog.html'],
                    ['project', 'portfolio.html'],
                    ['gallery', 'portfolio.html']
                ];
                const match = routes.find(([term]) => query.includes(term));
                window.location.href = match ? match[1] : 'index.html';

            });
        });

        // ==========================================
        // 1. EVENT BUTTONS BINDING (ALL EVENT BUTTONS)
        // ==========================================
        function bindEventButtons() {
            // Find all buttons, links, or cards associated with event joining / registration
            const eventButtons = document.querySelectorAll(
                'a[href*="event-single"], button.event-btn, .card-mv a, a.join-event, .event-item button, .event-btn'
            );

            eventButtons.forEach((btn, index) => {
                const text = btn.innerText.trim().toLowerCase();
                const isPlusOrIcon = text === '+' || text === '' || btn.querySelector('i');
                const isRegisterOrJoin = text.includes('join') || text.includes('register') || text.includes('book') || text.includes('event') || isPlusOrIcon;

                if (isRegisterOrJoin && !btn.dataset.apiBound) {
                    btn.dataset.apiBound = "true";
                    btn.addEventListener('click', function (e) {
                        // If it's a join/register button, open interactive registration modal
                        const cardTitle = btn.closest('.card-mv, .event-item, .event-card')?.querySelector('h2, h3, h4')?.innerText || `Charity Event #${(index % 3) + 1}`;
                        const eventId = (index % 3) + 1; // map to seeded event IDs (1, 2, 3)

                        e.preventDefault();
                        showEventRegisterModal(eventId, cardTitle);
                    });
                }
            });
        }

        bindEventButtons();

        // ==========================================
        // 2. CONTACT FORMS BINDING
        // ==========================================
        const contactForms = document.querySelectorAll('form[action*="contact"], form#contact-form, form#contactForm, form#contact-form-main, .contact-validation-active');
        contactForms.forEach(form => {
            if (form.closest('.volunteer-contact-form')) return;
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                const name = getField(form, '[name="name"], #name', 'Guest User');
                const email = getField(form, '[name="email"], #email');
                const phone = getField(form, '[name="phone"], #phone');
                const subject = getField(form, '[name="subject"], #subject', 'General Inquiry');
                const message = getField(form, '[name="note"], [name="message"], #note, #message');

                if (!email || !message) {
                    showToast('Please provide both your email address and message.', 'error');
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE}/contact`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, phone, subject, message })
                    });
                    if (res.ok) {
                        showToast('Thank you! Your message has been sent to the Smart Help Foundation team.', 'success');
                        form.reset();
                    } else {
                        showToast('Failed to send message. Please try again.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Server connection error.', 'error');
                }
            });
        });

        // ==========================================
        // 3. NEWSLETTER SUBSCRIPTION FORMS
        // ==========================================
        const newsletterForms = document.querySelectorAll('.form-fild, form[action*="newsletter"]');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', async function (e) {
                const emailInput = form.querySelector('input[type="email"]');
                if (!emailInput) return;
                e.preventDefault();
                const email = emailInput.value;
                if (!email) return;

                try {
                    const res = await fetch(`${API_BASE}/newsletter`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    if (res.ok) {
                        showToast('Subscribed! Thank you for supporting Smart Help Foundation Charity.', 'success');
                        form.reset();
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        });

        // ==========================================
        // 4. VOLUNTEER FORM BINDING
        // ==========================================
        const volunteerForms = document.querySelectorAll('form[action*="volunteer"], #volunteer-form, .volunteer-contact-form form');
        volunteerForms.forEach(form => {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                const full_name = getField(form, '[name="name"], #name', 'Volunteer Applicant');
                const email = getField(form, '[name="email"], #email');
                const phone = getField(form, '[name="phone"], #phone');
                const occupation = getField(form, '[name="occupation"], #occupation, [name="subject"], #subject');
                const skills = getField(form, '[name="skills"], #skills');
                const message = getField(form, '[name="note"], [name="message"], #note, #message');

                if (!email) {
                    showToast('Please enter a valid email address.', 'error');
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE}/volunteers`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ full_name, email, phone, occupation, skills, message })
                    });
                    if (res.ok) {
                        showToast('Volunteer application submitted! We will contact you soon.', 'success');
                        form.reset();
                    } else {
                        showToast('Failed to submit application.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        });

                // ==========================================
        // 5. DONATION FORM — expose global starter
        //    (Submit handled by inline script in donate.html)
        // ==========================================
        const donateForms = document.querySelectorAll('form[action*="donate"], #donate-form, #donationForm');
        donateForms.forEach(form => {
            if (window.__aidusInlineDonation) return;

            updateDonationTotal(form);
            form.querySelectorAll('.food-checkee, .food-dropdown, .food-qty').forEach(input => {
                input.addEventListener('change', () => updateDonationTotal(form));
                input.addEventListener('input', () => updateDonationTotal(form));
            });
        });

        // ------------------------------------------------------------
        // Global function called by inline donate.html AFTER validation
        // ------------------------------------------------------------
        window.startRazorpayDonation = async function (opts = {}) {
            const form = opts.form || document.getElementById('donationForm');
            if (!form) return;

            setDonatingState(true);
            try {

            const items = collectDonationItems(form);
            const donor_name = getField(form, '[name="donor_name"]', 'Generous Donor');
            const email = getField(form, '[name="email"]') || null; 
            const phone = getField(form, '[name="phone"]');
            const amount = parseFloat(getField(form, '#total_amtee', '0'))
                || parseFloat(opts.amount)
                || 0;
            const payment_method = form.querySelector('[name="payment_method"]:checked')?.value || 'Razorpay';

            if (!amount || amount <= 0) {
                showToast('Please select at least one donation item.', 'error');
                return;
            }

            const donationPayload = {
                donor_name,
                email,
                phone,
                country_code: getField(form, '[name="country_code"]'),
                instagram: getField(form, '[name="instagram"]'),
                occasion: getField(form, '[name="occasion"]'),
                label: getField(form, '[name="label"]'),
                service_date: getField(form, '[name="date"], #serviceDate'),
                special_requests: getField(form, '[name="special_requests"], #specialRequests'),
                items_json: JSON.stringify(items),
                amount,
                payment_method,
                currency: 'INR',

                // Extended fields
                state:         getField(form, '[name="state"]') || null,
                city:          getField(form, '[name="city"]') || null,
                banner_name:   getField(form, '[name="banner_name"]') || null,
                cake_name:     getField(form, '[name="cake_name"]') || null,
                occasion_date: getField(form, '[name="occasion_date"]') || null,
                cake_qty:      (function () {
                    var v = parseInt(getField(form, '[name="cake_qty"]', '0'), 10);
                    return isNaN(v) || v <= 0 ? null : v;
                })(),
                cake_shape:    (form.querySelector('[name="cake_shape"]:checked') || {}).value || null,
            };

            // =========================================================
            // Upload photos first (if any) → get URLs
            // =========================================================
            // =========================================================
            // Upload photos (parcel / print / banner / cake) — batched
            // =========================================================
            let parcelUrl = null;
            let printUrl  = null;
            let cakeUrl   = null;
            let bannerUrls = [];
            let printUrlsFinal = [];   // ← moved OUT of try block

            try {
                const bundle = (typeof window.getSelectedPhotos === 'function')
                    ? window.getSelectedPhotos()
                    : {};

                const parcelArr = (bundle.parcel || []).filter(function (p) { return p && p.file; });
                const printArr  = (bundle.print  || []).filter(function (p) { return p && p.file; });
                const bannerArr = (bundle.banner || []).filter(function (p) { return p && p.file; });
                const cakeArr   = bundle.cake && bundle.cake.file ? [bundle.cake] : [];
                const useSamePrint  = !!bundle.useSamePrint;
                const bannerSource  = bundle.bannerSource || 'custom';   // 'parcel' | 'print' | 'custom'

                // Flatten — order matters
                const allFiles = [].concat(parcelArr, printArr, bannerArr, cakeArr);

                let allUrls = [];
                if (allFiles.length > 0) {
                    const fd = new FormData();
                    allFiles.forEach(function (p) { fd.append('files', p.file); });

                    const upRes = await fetch(`${API_BASE}/donations/upload-photos`, {
                        method: 'POST',
                        body: fd
                    });

                    if (!upRes.ok) {
                        const errText = await upRes.text();
                        console.error('Photo upload failed:', upRes.status, errText);
                        showToast('Photo upload failed. Please try again.', 'error');
                        return;
                    }

                    const upData = await upRes.json();
                    allUrls = upData.urls || [];
                }

                // Split URLs back into categories
                let idx = 0;
                const parcelUrls = allUrls.slice(idx, idx + parcelArr.length); idx += parcelArr.length;
                const printUrls  = allUrls.slice(idx, idx + printArr.length);  idx += printArr.length;
                const bnrUrls    = allUrls.slice(idx, idx + bannerArr.length); idx += bannerArr.length;
                const cakeUrls   = allUrls.slice(idx, idx + cakeArr.length);   idx += cakeArr.length;

                parcelUrl = parcelUrls[0] || null;
                cakeUrl   = cakeUrls[0]   || null;

                // Print — array. Either the uploaded set, or parcel reused for all copies.
                if (useSamePrint && parcelUrl) {
                    const copies = Math.max(1,
                        parseInt(getField(form, '[name="print_qty"]', '1'), 10) || 1
                    );
                    printUrlsFinal = new Array(copies).fill(parcelUrl);
                } else {
                    printUrlsFinal = printUrls;
                }
                // Back-compat single field = first URL (or null)
                printUrl = printUrlsFinal[0] || null;

                // Banner photo source resolution
                const bannerCount = Math.max(1,
                    parseInt(getField(form, '[name="flex_banner_qty"]', '1'), 10) || 1
                );

                if (bannerSource === 'custom') {
                    bannerUrls = bnrUrls;                                   // may be partial
                } else if (bannerSource === 'print' && printUrl) {
                    bannerUrls = new Array(bannerCount).fill(printUrl);
                } else if (bannerSource === 'parcel' && parcelUrl) {
                    bannerUrls = new Array(bannerCount).fill(parcelUrl);
                } else {
                    bannerUrls = bnrUrls;
                }
            } catch (err) {
                console.error('Photo upload error:', err);
                showToast('Photo upload error.', 'error');
                return;
            }

            // Attach photo URLs to payload
            donationPayload.parcel_photo        = parcelUrl;
            donationPayload.print_photo         = printUrl;            // first URL (compat)
            donationPayload.print_photos_json   = printUrlsFinal;      // full array
            donationPayload.cake_photo          = cakeUrl;
            donationPayload.banner_photos_json  = bannerUrls;

                        // ---- Extract selected print size label ("A3" | "A4") ----
            let printSizeLabel = null;
            const printSizeRadio = form.querySelector('.print-size-cb:checked');
            if (printSizeRadio) {
                const card = printSizeRadio.closest('.food-itemee');
                const labelEl = card ? card.querySelector('span') : null;
                if (labelEl) {
                    // "A3 Photo Wishes — ₹150.00" → "A3"
                    const m = labelEl.textContent.match(/^\s*(A3|A4)/i);
                    if (m) printSizeLabel = m[1].toUpperCase();
                }
            }

            donationPayload.print_size = printSizeLabel;   // ← NEW

            sessionStorage.setItem('smarthelp_pending_donation', JSON.stringify(donationPayload));
   
// =========================================================
// STEP 1: Create Razorpay order FIRST
// =========================================================
let orderData = null;
showToast('Initializing secure payment...', 'success');

try {
    const orderRes = await fetch(`${API_BASE}/donations/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: amount,
            currency: 'INR',
            receipt: 'don_' + Date.now()
        })
    });
    if (orderRes.ok) {
        orderData = await orderRes.json();
    } else {
        const errText = await orderRes.text();
        console.warn('create-order unavailable, falling back:', orderRes.status, errText);
    }
} catch (err) {
    console.warn('create-order error, falling back:', err);
}

// =========================================================
// STEP 2: Save as Pending (transaction_id = order_id)
// =========================================================
let pendingDonationId = null;
try {
    const pendingRes = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...donationPayload,
            payment_method: 'Razorpay',
            transaction_id: orderData?.order_id || null,
            status: 'Pending'
        })
    });
    if (pendingRes.ok) {
        const saved = await pendingRes.json();
        pendingDonationId = saved.id;
        sessionStorage.setItem('smarthelp_pending_donation_id', saved.id);
    } else {
        // ❌ Pending save fail → STOP — don't open Razorpay
        const errText = await pendingRes.text();
        console.error('Pending donation save failed:', pendingRes.status, errText);
        let detail = 'Could not save donation.';
        try { detail = JSON.parse(errText).detail || detail; } catch (_) {}
        showToast('❌ ' + detail + ' Please check your details.', 'error');
        setDonatingState(false);
        return;
    }
} catch (err) {
    console.warn('Could not pre-create donation:', err);
    showToast('❌ Network error. Please try again.', 'error');
    setDonatingState(false);
    return;
}

            // =========================================================
            // PATH A: Razorpay Checkout (keys present) — proper flow
            // =========================================================
            if (orderData && orderData.order_id && orderData.key_id) {
                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: orderData.currency || 'INR',
                    name: 'SmartHelp Foundation',
                    description: 'Donation',
                    order_id: orderData.order_id,
                    notes:{donation_id: pendingDonationId},
                    prefill: { name: donor_name, email: email, contact: phone },
                    theme: { color: '#ff5528' },
                    handler: async function (response) {
    try {
        // Verify signature + mark existing Pending → Completed
        const verifyRes = await fetch(`${API_BASE}/donations/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                donation_id: pendingDonationId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
            })
        });

        if (!verifyRes.ok) {
    const errText = await verifyRes.text();
    console.error('Verify failed:', verifyRes.status, errText);
    if (typeof window.__allowUnloadNow === 'function') window.__allowUnloadNow();
    showToast('Payment received. Verifying...', 'warning');
    setTimeout(() => {
        window.location.href = 'thank-you.html?status=verifying';
    }, 1200);
    return;
}

// Success path
try {
    const verifyData = await verifyRes.json();
    sessionStorage.setItem(
        'smarthelp_last_donation_id',
        verifyData.transaction_id || String(pendingDonationId || '')
    );
} catch (_) {
    sessionStorage.setItem('smarthelp_last_donation_id', String(pendingDonationId || ''));
}

if (typeof window.__allowUnloadNow === 'function') window.__allowUnloadNow();
showToast('✅ Payment successful! Thank you.', 'success');
setTimeout(() => {
    window.location.href = 'thank-you.html?status=success';
}, 1200);
    } catch (err) {
        console.error(err);
        showToast('Payment received, but verification failed. Contact support.', 'error');
    }
},
                    modal: {
                        ondismiss: function () {
                            showToast('Payment cancelled.', 'error');
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();
                return;
            }

            // =========================================================
            // PATH B: Fallback — razorpay.me/@handle?amount=XXX
            // Only save here if STEP 2 didn't already create a record
            // =========================================================
            if (!pendingDonationId) {
    try {
        const fallbackRes = await fetch(`${API_BASE}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...donationPayload,
                payment_method: 'Razorpay-Link'
            })
        });
        if (fallbackRes.ok) {
            const saved = await fallbackRes.json();
            pendingDonationId = saved.id;
            sessionStorage.setItem('smarthelp_pending_donation_id', saved.id);
        }
    } catch (err) {
        console.warn('Could not save pending donation:', err);
    }
}
if (typeof window.__allowUnloadNow === 'function') window.__allowUnloadNow();
            showToast(
                'Redirecting to Razorpay. Please enter ₹' + Math.round(amount) + ' manually.',
                'success'
            );

            // razorpay.me does NOT support ?amount= param — redirect plain
            setTimeout(() => {
                window.location.assign(RAZORPAY_PAYMENT_URL);
            }, 1500);

            } finally {
                // Reset button state whenever the function exits
                // (Razorpay modal sits on top of the button anyway)
                setDonatingState(false);
            }
        };

        // ==========================================
        // 6. CHECKOUT ORDER BINDING
        // ==========================================
        const checkoutForm = document.querySelector('.checkout-area form');
        if (checkoutForm && !checkoutForm.dataset.apiBound) {
            checkoutForm.dataset.apiBound = "true";
            checkoutForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const firstName = getField(checkoutForm, '#fname, #fname3, [name="fname"]');
                const lastName = getField(checkoutForm, '#fname2, [name="lname"]');
                const customer_name = `${firstName} ${lastName}`.trim() || 'Shop Customer';
                const email = getField(checkoutForm, '#emails, [name="email"]', 'customer@example.com');
                const phone = getField(checkoutForm, '#emaild, [name="phone"]', 'N/A');
                const city = getField(checkoutForm, '#City, #City2, [name="City"]', 'N/A');
                const address = getField(checkoutForm, '#Adress, #Adress2, [name="Adress"]', 'N/A');
                const totalText = document.querySelector('.o-bottom span')?.innerText || '0';
                const total_amount = parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;
                const payment_method = checkoutForm.querySelector('[name="payment"]:checked')?.nextElementSibling?.innerText || 'Card';
                const items = Array.from(document.querySelectorAll('.oreder-item li:not(.o-header):not(.s-total):not(.o-bottom)')).map(row => ({
                    label: row.childNodes[0]?.textContent?.trim(),
                    amount: row.querySelector('span')?.innerText?.trim()
                })).filter(item => item.label);

                try {
                    const res = await fetch(`${API_BASE}/shop/orders`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customer_name, email, phone, address, city, total_amount, items_json: JSON.stringify(items), payment_method })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        showToast(`Order placed successfully. Order #${data.id}`, 'success');
                    } else {
                        const err = await res.json();
                        showToast(err.detail || 'Order could not be placed.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Server connection error.', 'error');
                }
            });
        }
    });
})();
