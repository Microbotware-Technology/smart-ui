/* ==========================================================
   CUSTOMER SUPPORT — LOCAL CHAT BOT
   No backend. No DB. In-memory only. Refresh = clean slate.
   ========================================================== */
(function () {
    "use strict";

    var CFG = {
        phone: "+917601866602",
        phone2: "+917639866602",
        email: "office@smarthelpfoundation.org",
        whatsapp: "917639866602",
        replyDelayMs: 500,
        storageKey: "shf_chat_messages_v1", // sessionStorage key
        maxMessages: 200,
    };

    var RULES = [
    // Greeting
    {
        patterns: [
            /^\s*hi+\b/i,
            /^\s*hey+\b/i,
            /^\s*h(e|a)l+o+w*\b/i,
            /^\s*hlo+\b/i,
            /^\s*hai+\b/i,
            /^\s*yo+\b/i,
            /^\s*(vanakkam|vanakam|namaste|namaskar)\b/i,
            /^\s*good\s+(morning|afternoon|evening|night)\b/i,
        ],
        reply:
            "Hi 👋 Welcome to *Smart Help Foundation*.\n" +
            "How can we help you today?\n\n" +
            "Type a keyword like:\n" +
            "📦 [[package]] — view all packages\n" +
            "🍽️ [[food]] — food prices\n" +
            "🎂 [[birthday]] — birthday celebration\n" +
            "📞 [[contact]] — reach us",
    },

    // How to donate / What is the process
    {
        patterns: [
            /\bhow\s+to\s+donat/i,
            /\bhow\s+(do|can)\s+i\s+donat/i,
            /\bdonat(e|ion)\s+(process|steps?|method)/i,
            /\bepdi\s+donat/i,
            /\bwhat\s+is\s+the\s+process\b/i,
            /\bprocess\b/i,
            /\bprocess\s+(for|to)\s+donat/i,
            /\bhow\s+does\s+it\s+work\b/i,
            /\bepdi\s+process\b/i,
        ],
        reply:
            "❤️ *Donating is simple!*\n\n" +
            "Just follow these steps:\n\n" +
            "1️⃣ Click the link below\n" +
            "2️⃣ Enter your details\n" +
            "3️⃣ Complete payment\n\n" +
            "👉 [Click Here to Donate](/donate)\n\n" +
            "Every contribution brings hope. 🙏",
    },

    // Founder
    {
        patterns: [
            /\bfounder\b/i,
            /\bwho\s+(is|was)\s+(the\s+)?founder/i,
            /\bfounder\s+(name|who|yaaru|yaar|details?)/i,
            /\byaaru\s+(the\s+)?founder/i,
            /\bfounder\s+yaaru/i,
            /\bwho\s+(started|founded)\b/i,
        ],
        reply:
            "👤 *Our Founder*\n\n" +
            "Sivaranjini — Founder of Smart Help Foundation\n\n" +
            "For full details, visit [Contact Page](/contact)\n\n" +
            "Reply [[contact]] to reach us directly.",
    },

    // Is this NGO / Trust / Charity
    {
        patterns: [
            /\bis\s+this\s+(an?\s+)?(ngo|trust|charity)/i,
            /\bare\s+you\s+(an?\s+)?(ngo|trust|charity)/i,
            /\bngo\b/i,
            /\btrust\b/i,
            /\bcharity\b/i,
        ],
        reply:
            "✅ Yes, Smart Help Foundation is a registered non-profit NGO/Trust.\n\n" +
            "We work for underprivileged children's food & education.\n\n" +
            "Reply [[contact]] to reach us directly.",
    },

    // Location / Address / Map
    {
        patterns: [
            /\blocation\b/i,
            /\bloca\b/i,
            /\baddress\b/i,
            /\bwhere\s+(are|is)\s+(you|u|we)\b/i,
            /\bwhere\s+(you|u)\s+(located|based)/i,
            /\benga\s+irukku/i,
            /\bengae\s+irukku/i,
            /\benga\s+location/i,
            /\bmap\b/i,
            /\bdirection/i,
            /\blocation\s+map/i,
            /\bgoogle\s+map/i,
        ],
        reply:
            "📍 *Our Location*\n\n" +
            "Villupuram, Tamil Nadu\n\n" +
            "[Open in Google Maps](https://www.google.com/maps/place/SMART+HELP+FOUNDATION+TRUST/@11.9802127,79.5064214,17.25z/data=!4m12!1m5!3m4!2zMTHCsDU4JzUyLjkiTiA3OcKwMzAnMjQuNCJF!8m2!3d11.981372!4d79.506773!3m5!1s0x3a5351d1d9a54d15:0x578b2fcce6b8fd83!8m2!3d11.9813722!4d79.5093478!16s%2Fg%2F11xv82q7js?entry=ttu&g_ep=EgoyMDI2MTAxMS4wIKXMDSoASAFQAw%3D%3D)\n\n" +
            "Reply [[contact]] to call or WhatsApp us directly.",
    },

    // Instagram
    {
        patterns: [/\binstagram\b/i, /\binsta\b/i, /\big\b/i],
        reply:
            "📸 Follow us on Instagram:\n" +
            "[@smart_help_foundation](https://www.instagram.com/smart_help_foundation)\n\n" +
            "Stay updated with our stories & events!",
    },

    // Working hours
    {
        patterns: [/\bworking\s+hours\b/i, /\boffice\s+timing/i, /\btiming/i, /\bhours\b/i],
        reply:
            "🕘 *Our Working Hours:*\n\n" +
            "• Mon–Fri: 10 AM – 6 PM\n" +
            "• Sat: 10 AM – 3 PM\n" +
            "• Sun: Closed",
    },

    // 80G / Tax exemption
    {
        patterns: [/\b80g\b/i, /\btax\s+exemption/i, /\btax\s+benefit/i],
        reply:
            "✅ Yes, we provide *80G tax exemption certificates* for donations.\n\n" +
            "Reply [[contact]] for more details.",
    },

    // Receipt / Certificate
    {
        patterns: [/\breceipt/i, /\bcertificate/i],
        reply:
            "🧾 We provide donation receipts.\n\n" +
            "Please reply [[contact]] after donating so we can send it to you.",
    },

    // Monthly / Recurring donation
    {
        patterns: [/\bmonthly\b/i, /\brecurring/i],
        reply:
            "🔁 You can set up *monthly recurring donations*.\n\n" +
            "👉 [Start Monthly Donation](/donate)\n\n" +
            "Every month, you bring hope. 🙏",
    },

    // Help intent
    {
        patterns: [/\bhelp\b/i, /\bhow\s+can\b/i, /\bwhat\s+can\b/i],
        reply:
            "🤝 *Here's how Smart Help Foundation helps:*\n\n" +
            "🍽️ Food for children — min. 20 kids (from ₹1,000)\n" +
            "📚 Education kits — ₹80\n" +
            "🥫 Grocery kits — ₹300\n" +
            "🎂 Birthday celebrations — from ₹1,200\n" +
            "🎥 Wish videos — ₹400\n\n" +
            "❤️ [Donate Now](/donate) to make a difference!\n\n" +
            "Reply with a keyword: [[package]] [[food]] [[birthday]] [[contact]]",
    },

    // Donate intent
    {
        patterns: [/\bdonat/i, /\bcontribut/i, /\bdonate\s+now/i],
        reply:
            "❤️ *Donate to Smart Help Foundation*\n\n" +
            "Every rupee counts:\n\n" +
            "🍽️ *Food (min. 20 kids — food cost only):*\n" +
            "• Large Food (Veg) — ₹50/child (from ₹1,000)\n" +
            "• Large Food (with Egg) — ₹60/child (from ₹1,200)\n" +
            "• Chicken Biryani — ₹100/child (from ₹2,000)\n" +
            "• Special Biryani — ₹120/child (from ₹2,400)\n\n" +
            "📦 *Other kits:*\n" +
            "• Grocery kit — ₹300\n" +
            "• Education kit — ₹80\n\n" +
            "👉 [Donate Now](/donate)\n\n" +
            "Reply *package* for all packages.",
    },

    // Thanks
    {
        patterns: [/\bthank/i, /\bnandri\b/i, /\bthx\b/i],
        reply: "You're welcome! 🙏 Happy to help.",
    },

    // Contact (with extra patterns)
    {
        patterns: [
            /\bcontact\b/i,
            /\bphone\b/i,
            /\bcall\b/i,
            /\bemail\b/i,
            /\bnumber\b/i,
            /\bmail\b/i,
            /\bwhatsapp\b/i,
            /\bphone\s*(number|no)\b/i,
            /\bmobile\s*(number|no)\b/i,
            /\bcontact\s*(number|no)\b/i,
            /\bcall\s*(number|no)\b/i,
            /\bnumber\s*kudu\b/i,
        ],
        reply:
            "📞 *Reach Us*\n\n" +
            "• Call: [+91 7601866602](tel:+917601866602)\n" +
            "• Call: [+91 7639866602](tel:+917639866602)\n" +
            "• Email: [office@smarthelpfoundation.org](mailto:office@smarthelpfoundation.org)\n" +
            "• Chat: [Open WhatsApp](https://wa.me/917639866602)\n" +
            "• Instagram: [@smart_help_foundation](https://www.instagram.com/smart_help_foundation)\n\n" +
            "Tap any number or link to connect instantly.",
    },

    // Video
    {
        patterns: [/\bvideo\b/i, /\bwish\s*video/i],
        reply:
            "🎥 *Birthday Wish Video*\n\n" +
            "• 60-second edited birthday wish — ₹400\n\n" +
            "🎁 *FREE wish video* when you donate a large food package for *50+ kids*!\n\n" +
            "*Note:*\n" +
            "1. Videos are sent directly to your WhatsApp number.\n" +
            "2. Instagram posts are at management's discretion.\n" +
            "3. Instagram posts available only for 80+ kids.",
    },

    // Cake
    {
        patterns: [/\bcake\b/i, /\bphoto\s*cake\b/i],
        reply: "🎂 *Cake Prices*\n\n• Birthday Cake — ₹450\n• Photo Cake — ₹800",
    },

    // Birthday
    {
        patterns: [/\bbirthday\b/i, /\bcelebration\b/i],
        reply:
            "🎂 *Smart Help Foundation — Birthday Packages*\n" +
            "_(Food cost only)_\n\n" +
            "👧🧒 *20 Kids*\n" +
            "• Large Food — ₹1,200\n" +
            "• Chicken Biryani — ₹2,000\n" +
            "• Special Chicken Biryani — ₹2,400\n\n" +
            "👧🧒 *50 Kids*\n" +
            "• Large Food — ₹3,000\n" +
            "• Chicken Biryani — ₹5,000\n" +
            "• Special Chicken Biryani — ₹6,000\n\n" +
            "👧🧒 *100 Kids*\n" +
            "• Large Food — ₹6,000\n" +
            "• Chicken Biryani — ₹10,000\n" +
            "• Special Chicken Biryani — ₹12,000\n\n" +
            "💡 *Bonus:* Free 60-90-sec wish video for food donations above 50 kids!",
    },

    // Grocery
    {
        patterns: [/\bgrocer/i, /\brice\b/i, /\bdhal\b/i, /\bdal\b/i],
        reply:
            "🥫 *Grocery Kit — ₹300*\n\nIncludes:\n" +
            "• Rice — 2 Kg\n• Dhal — 200 g\n• Oil — 200 ml\n" +
            "• Chilli powder — 1 pkt\n• Curry masala — 1 pkt\n" +
            "• Turmeric powder — 1 pkt\n• Ginger Garlic Paste — 1 pkt",
    },

    // Education
    {
        patterns: [/\beducation/i, /\bschool\b/i, /\bstationar/i, /\bnotebook/i, /\bpencil\b/i],
        reply:
            "📚 *Education / Stationary Kit — ₹80*\n\nIncludes:\n" +
            "• Scale, Pencil, Eraser, Sharpener\n• Colouring book, Pen\n• Crayons, Note books",
    },

    // Extra items
    {
        patterns: [/\bextra\b/i, /\badd[- ]?ons?\b/i, /\bsnack/i, /\bjuice\b/i],
        reply:
            "🍫 *Extra Food Items* _(per cost)_\n\n" +
            "• Chocolate — ₹10\n• Milk — ₹20\n• Butter milk — ₹10\n" +
            "• Water bottle — ₹10\n• Fruit salad — ₹30\n• Banana — ₹10\n" +
            "• Biscuits — ₹10\n• Watermelon juice — ₹20",
    },

    // Food prices
    {
        patterns: [
            /\bfood\b/i,
            /\bfood\s+(price|cost|rate)\b/i,
            /\bmenu\b/i,
            /\bbiryani\b/i,
            /\bbiriyani\b/i
        ],
        reply:
            "🍽️ *Smart Help Foundation — Food*\n\n" +
            "_(Food cost only — min. 20 children)_\n\n" +
            "🥗 *Large Food — Variety Rice (Veg)*\n" +
            "• Without Egg — ₹50 per child\n" +
            "• With Egg — ₹60 per child\n\n" +
            "🍗 *Normal Chicken Biryani*\n" +
            "• With Egg — ₹100 per child\n\n" +
            "🍗 *Special Chicken Biryani*\n" +
            "• With Egg, Raita & Kesari — ₹120 per child",
    },

    // Package menu
    {
        patterns: [/\bpackage/i, /\bplan\b/i, /\bprice/i, /\bcost\b/i, /\bmoney\b/i],
        reply:
            "📦 *Smart Help Foundation — Packages*\n\n" +
            "Reply with a keyword for full details:\n\n" +
            '🍽️ [[food]] — Food prices (₹50–₹120)\n' +
            '🎂 [[birthday]] — Birthday celebration (from ₹1,200)\n' +
            '🍰 [[cake]] — Cake prices (₹450 / ₹800)\n' +
            '📚 [[education]] — Education kit (₹80)\n' +
            '🥫 [[grocery]] — Grocery kit (₹300)\n' +
            '🎁 [[extra]] — Extra items (from ₹10)\n' +
            '🎥 [[video]] — 60-90-sec wish video (₹400)\n\n' +
            "Or visit [Donate Page](/donate) to donate directly.",
    },
];

    var FALLBACK_REPLY =
        "Thank you for reaching out! 🙏\n\n" +
        "I didn't fully understand your question, but here's how we can help:\n\n" +
        "❤️ [Donate Now](/donate) — Feed 20+ children from ₹1,000\n" +
        "📦 [[package]] — View all packages\n" +
        "🍽️ [[food]] — Food prices\n" +
        "🎂 [[birthday]] — Birthday celebration\n" +
        "📞 [Call Us](tel:+917601866602)\n\n" +
        "Please choose a keyword above, or simply type your question below. 😊We’re here to help!.";

    // ---------------- HELPERS ----------------
    function escapeHtml(t) {
        if (t == null) return "";
        return String(t)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function timeNow() {
        return new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit", minute: "2-digit", hour12: true,
        });
    }

    function formatMessage(raw, isUser) {
        if (!raw) return "";

        var text = escapeHtml(raw);

        if (isUser) {
            return text.replace(/\n/g, "<br>");
        }

        text = text.replace(/\[\[([a-z0-9_-]+)\]\]/gi, function (m, keyword) {
            return '<button type="button" class="shf-keyword" data-keyword="' +
                escapeHtml(keyword) +
                '">' +
                '<strong>' + escapeHtml(keyword) + '</strong>' +
                '</button>';
        });

        // 1. Extract markdown links to placeholders to prevent auto-linker from double-wrapping
        var mdLinks = [];
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, url) {
            mdLinks.push({ label: label, url: url });
            return '__MDLINK_PLACEHOLDER_' + (mdLinks.length - 1) + '__';
        });

        // 2. Auto-link plain URLs
        text = text.replace(
            /(^|[^"'=])((?:https?:\/\/|wa\.me\/|tel:|mailto:)[^\s<]+)/g,
            '$1<a href="$2" class="shf-link" target="_blank" rel="noopener">$2</a>'
        );

        // 3. Restore markdown links
        text = text.replace(/__MDLINK_PLACEHOLDER_(\d+)__/g, function (m, index) {
            var link = mdLinks[index];
            var safeUrl = link.url.replace(/"/g, "&quot;");
            var ext = /^https?:/i.test(safeUrl);
            var tgt = ext ? ' target="_blank" rel="noopener"' : "";
            return '<a href="' + safeUrl + '"' + tgt + ' class="shf-link">' + link.label + '</a>';
        });

        // 4. Bold and Italic formatting (safe regex for italics to avoid Instagram username breaking)
        text = text.replace(/\*([^\*\n]+)\*/g, "<strong>$1</strong>");
        text = text.replace(/(^|\s)_([^_\n]+)_(\s|$)/g, '$1<em>$2</em>$3');
        text = text.replace(/\n/g, "<br>");

        return text;
    }

    function findReply(text) {
        var t = (text || "").trim();
        for (var i = 0; i < RULES.length; i++) {
            var rule = RULES[i];
            for (var j = 0; j < rule.patterns.length; j++) {
                if (rule.patterns[j].test(t)) return rule.reply;
            }
        }
        return FALLBACK_REPLY;
    }

    // ---------------- CSS ----------------
    function injectCSS() {
        if (document.getElementById("shf-chat-style")) return;
        var css = `
/* FAB container — transparent, stacks curve + circle */
.shf-fab{position:fixed;right:25px;bottom:65px;z-index:99999;background:transparent;border:none;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;transition:opacity .25s;font-family:inherit;}

/* Curved "We Are Here!" wrapper — tighter spacing */
.shf-fab-curve-wrap{position:relative;width:140px;height:55px;margin-bottom:-38px;pointer-events:none;}
.shf-fab-curve{width:100%;height:100%;overflow:visible;display:block;}
.shf-fab-curve-text{fill:#F74F22;font-size:22px;font-weight:800;font-family:"Nunito","Inter",sans-serif;letter-spacing:.5px;paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round;}

/* Hand wave emoji */
.shf-fab-wave{position:absolute;left:-2px;bottom:0;font-size:24px;transform-origin:70% 70%;animation:shfWave 2.4s ease-in-out infinite;display:inline-block;}
@keyframes shfWave{0%,60%,100%{transform:rotate(0deg);}10%{transform:rotate(14deg);}20%{transform:rotate(-8deg);}30%{transform:rotate(14deg);}40%{transform:rotate(-4deg);}50%{transform:rotate(10deg);}}

/* Circle button */
.shf-fab-circle{position:relative;width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#ff6a00,#ee0979);color:#fff;box-shadow:0 8px 25px rgba(255,106,0,.5),0 4px 12px rgba(238,9,121,.35);display:flex;align-items:center;justify-content:center;border:3px solid #fff;}
.shf-fab-circle i{line-height:1;font-size:26px;}

/* Hide FAB when chat open */
body.shf-chat-open .shf-fab{opacity:0;pointer-events:none;transform:scale(.8);}
.shf-fab-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#ff3b30;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 6px rgba(0,0,0,.25);}
.shf-fab-badge.show{display:flex;}

.shf-chat{position:fixed;right:30px;bottom:30px;z-index:100000;width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 130px);background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;opacity:0;visibility:hidden;transform:translateY(20px) scale(.95);transition:opacity .28s cubic-bezier(.2,.9,.3,1.1),transform .28s cubic-bezier(.2,.9,.3,1.1),visibility .28s;}
.shf-chat.open{opacity:1;visibility:visible;transform:translateY(0) scale(1);}

.shf-head{background:linear-gradient(135deg,#ff6a00,#ee0979);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;}
.shf-head-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:22px;}
.shf-head-info{flex:1;min-width:0;}
.shf-head-info h4{margin:0;font-size:15px;font-weight:700;color:#fff;line-height:1.2;font-family:inherit;}
.shf-head-info span{font-size:12px;opacity:.9;display:flex;align-items:center;gap:5px;margin-top:2px;}
.shf-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;box-shadow:0 0 6px #4ade80;}
.shf-head-actions{display:flex;gap:6px;}
.shf-icon-btn{width:32px;height:32px;border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:background .2s;text-decoration:none;}
.shf-icon-btn:hover{background:rgba(255,255,255,.32);color:#fff;text-decoration:none;}

.shf-quick{display:flex;gap:6px;padding:10px 12px;background:#fafafa;border-bottom:1px solid #f0f0f0;overflow-x:auto;flex-shrink:0;}
.shf-quick::-webkit-scrollbar{display:none;}
.shf-quick a{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#fff;border:1.5px solid #ff6a00;border-radius:20px;font-size:12px;color:#ff6a00;text-decoration:none;white-space:nowrap;font-weight:600;transition:all .2s ease;box-shadow:0 1px 2px rgba(255,106,0,.08);}
.shf-quick a i{font-size:13px;color:#ff6a00;transition:color .2s;}
.shf-quick a:hover{background:linear-gradient(135deg,#ff6a00,#ee0979);border-color:#ee0979;color:#fff;text-decoration:none;transform:translateY(-1px);box-shadow:0 4px 10px rgba(238,9,121,.28);}
.shf-quick a:hover i{color:#fff;}
.shf-quick a:active{transform:translateY(0);box-shadow:0 2px 5px rgba(238,9,121,.2);}

.shf-body{flex:1;overflow-y:auto;padding:18px 14px;background:#f7f8fa;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}
.shf-body::-webkit-scrollbar{width:6px;}
.shf-body::-webkit-scrollbar-thumb{background:#d4d4d4;border-radius:3px;}

.shf-msg{max-width:82%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;word-wrap:break-word;position:relative;animation:shfIn .25s ease-out;text-align:left;}
.shf-msg strong{font-weight:700;}
.shf-msg .shf-link{color:inherit;text-decoration:underline;font-weight:600;word-break:break-word;}
.shf-msg.user .shf-link{color:#fff;}
.shf-msg.admin .shf-link,.shf-msg.bot .shf-link{color:#ee0979;}
@keyframes shfIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.shf-msg.user{align-self:flex-end;background:linear-gradient(135deg,#ff6a00,#ee0979);color:#fff;border-bottom-right-radius:4px;}
.shf-msg.admin,.shf-msg.bot{align-self:flex-start;background:#fff;color:#222;border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06);}
.shf-msg-time{font-size:10px;opacity:.7;margin-top:4px;display:block;text-align:right;}
.shf-msg.admin .shf-msg-time,.shf-msg.bot .shf-msg-time{color:#999;}

.shf-keyword{
    border:0;
    background:transparent;
    color:#ee0979;
    padding:0;
    margin:0;
    font:inherit;
    font-weight:600;
    cursor:pointer;
    text-decoration:none;
}

.shf-keyword:hover{
    color:#ff6a00;
}


.shf-foot{padding:10px 12px;background:#fff;border-top:1px solid #f0f0f0;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}
.shf-foot textarea{flex:1;resize:none;border:1.5px solid #eee;border-radius:20px;padding:10px 14px;font-size:14px;font-family:inherit;outline:none;max-height:100px;line-height:1.4;box-sizing:border-box;}
.shf-foot textarea:focus{border-color:#ee0979;}
.shf-send{width:42px;height:42px;border-radius:50%;border:0;background:linear-gradient(135deg,#ff6a00,#ee0979);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s;}
.shf-send:hover{transform:scale(1.06);}
.shf-send:disabled{opacity:.5;cursor:wait;}

.shf-typing{align-self:flex-start;background:#fff;padding:12px 16px;border-radius:16px;border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06);display:flex;gap:4px;}
.shf-typing span{width:7px;height:7px;background:#ccc;border-radius:50%;animation:shfBounce 1.2s infinite;}
.shf-typing span:nth-child(2){animation-delay:.15s;}
.shf-typing span:nth-child(3){animation-delay:.3s;}
@keyframes shfBounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}

.shf-credit{text-align:center;font-size:10px;color:#bbb;padding:6px;background:#fff;}

@media (max-width:575px){
  .shf-fab{right:5px;bottom:65px;}
  .shf-fab-curve-wrap{width:118px;height:48px;margin-bottom:-32px;}
  .shf-fab-curve-text{font-size:18px;stroke-width:2.5px;}
  .shf-fab-wave{font-size:20px;left:-2px;bottom:0;}
  .shf-fab-circle{width:60px;height:60px;}
  .shf-fab-circle i{font-size:22px;}
  .shf-chat{right:12px;bottom:80px;left:12px;width:auto;height:calc(100vh - 100px);max-height:520px;}
}
        `;
        var s = document.createElement("style");
        s.id = "shf-chat-style";
        s.textContent = css;
        document.head.appendChild(s);
    }

    // ---------------- HTML ----------------
    function injectHTML() {
        if (document.querySelector(".shf-fab")) return;
        var wa = "https://wa.me/" + CFG.whatsapp;
        var html = `
<button type="button" class="shf-fab" id="shfFab" aria-label="Chat with us">
  <div class="shf-fab-curve-wrap">
    <svg class="shf-fab-curve" viewBox="0 0 140 55" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="shf-arc-path" d="M 12 48 A 58 58 0 0 1 128 48" fill="none" />
      </defs>
      <text class="shf-fab-curve-text">
        <textPath href="#shf-arc-path" startOffset="50%" text-anchor="middle">
          We Are Here!
        </textPath>
      </text>
    </svg>
    <span class="shf-fab-wave">👋</span>
  </div>
  <div class="shf-fab-circle">
    <i class="far fa-comment-dots"></i>
  </div>
  <span class="shf-fab-badge" id="shfBadge">0</span>
</button>

<div class="shf-chat" id="shfChat" role="dialog" aria-label="Chat support">
  <div class="shf-head">
    <div class="shf-head-avatar"><i class="ti-headphone"></i></div>
    <div class="shf-head-info">
      <h4>Smart Help Support</h4>
      <span><span class="shf-dot"></span> Auto-reply bot</span>
    </div>
    <div class="shf-head-actions">
      <a href="${wa}" target="_blank" rel="noopener" class="shf-icon-btn" title="WhatsApp">
        <i class="fa-brands fa-whatsapp"></i>
      </a>
      <button type="button" class="shf-icon-btn" id="shfClose" title="Close">
        <i class="ti-close"></i>
      </button>
    </div>
  </div>

  <div class="shf-quick">
    <a href="tel:${CFG.phone}"><i class="fa-solid fa-phone"></i> Call</a>
    <a href="mailto:${CFG.email}"><i class="fa-solid fa-envelope"></i> Email</a>
    <a href="${wa}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
    <a href="/donate"><i class="ti-heart"></i> Donate</a>
  </div>

  <div class="shf-body" id="shfBody"></div>

  <div class="shf-foot" id="shfFoot" style="display:none;">
    <textarea id="shfInput" rows="1" placeholder="Type your message..."></textarea>
    <button type="button" class="shf-send" id="shfSend" aria-label="Send">
      <i class="ti-arrow-up"></i>
    </button>
  </div>

  <div class="shf-credit">Powered by Smart Help Foundation</div>
</div>
        `;
        var wrap = document.createElement("div");
        wrap.innerHTML = html;
        while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    }

    // ---------------- STATE ----------------
    var els = {};
    var state = {
        name: sessionStorage.getItem("shf_chat_name") || "Sir/Mam",
        messages: loadMessages(),
        open: false,
        busy: false,
        nextId: 1,
        unreadCount: 0,
    };

    function loadMessages() {
        try {
            var raw = sessionStorage.getItem(CFG.storageKey);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function saveMessages() {
        try {
            var arr = state.messages.slice(-CFG.maxMessages);
            sessionStorage.setItem(CFG.storageKey, JSON.stringify(arr));
        } catch (e) {
            // sessionStorage full / disabled — silently ignore
        }
    }

    function cacheEls() {
        els.fab = document.getElementById("shfFab");
        els.chat = document.getElementById("shfChat");
        els.body = document.getElementById("shfBody");
        els.foot = document.getElementById("shfFoot");
        els.input = document.getElementById("shfInput");
        els.send = document.getElementById("shfSend");
        els.close = document.getElementById("shfClose");
        els.badge = document.getElementById("shfBadge");
    }

    function scrollBottom() {
        if (!els.body) return;
        requestAnimationFrame(function () {
            if (els.body) els.body.scrollTop = els.body.scrollHeight;
            setTimeout(function () {
                if (els.body) els.body.scrollTop = els.body.scrollHeight;
            }, 50);
        });
    }

    function updateFabBadge() {
        if (!els.badge) return;
        if (state.unreadCount > 0 && !state.open) {
            els.badge.textContent = state.unreadCount > 9 ? "9+" : state.unreadCount;
            els.badge.classList.add("show");
        } else {
            els.badge.classList.remove("show");
        }
    }

    // ---------------- TITLE BLINK ----------------
    var originalTitle = document.title;
    var titleBlinkTimer = null;
    var titleBlinkOn = false;

    function startTitleBlink(count) {
        if (titleBlinkTimer) clearInterval(titleBlinkTimer);
        var msg = count === 1
            ? "(1) 💬 New message!"
            : "(" + count + ") 💬 New messages!";
        titleBlinkOn = false;
        titleBlinkTimer = setInterval(function () {
            titleBlinkOn = !titleBlinkOn;
            document.title = titleBlinkOn ? msg : originalTitle;
        }, 1000);
    }

    function stopTitleBlink() {
        if (titleBlinkTimer) {
            clearInterval(titleBlinkTimer);
            titleBlinkTimer = null;
        }
        document.title = originalTitle;
    }

    // Stop blinking when tab gets focus
    window.addEventListener("focus", function () {
        // Only stop if chat is open; otherwise keep blinking to catch attention
        if (state.open) stopTitleBlink();
    });

    function renderWelcomeMessage(m) {
        if (!els.body) return;

        var el = document.createElement("div");
        el.className = "shf-msg bot";

        el.innerHTML =
            "Hi 👋 Welcome to <strong>Smart Help Foundation</strong>.<br>" +
            "How can we help you today?<br><br>" +
            "Type a keyword like:<br>" +
            '<button type="button" class="shf-keyword" data-keyword="package">📦 <strong>package</strong></button> — view all packages<br>' +
            '<button type="button" class="shf-keyword" data-keyword="food">🍽️ <strong>food</strong></button> — food prices<br>' +
            '<button type="button" class="shf-keyword" data-keyword="birthday">🎂 <strong>birthday</strong></button> — birthday celebration<br>' +
            '<button type="button" class="shf-keyword"  data-keyword="contact">📞 <strong>contact</strong></button> — reach us' +
            '<span class="shf-msg-time">' +
            escapeHtml(m.time || timeNow()) +
            "</span>";

        els.body.appendChild(el);

        el.querySelectorAll(".shf-keyword").forEach(function (btn) {
            btn.addEventListener("click", function () {
                els.input.value = btn.dataset.keyword;
                sendMessage();
            });
        });
    }
    // ---------------- RENDER ----------------
    function renderMessage(m) {
        if (!els.body) return;

        var cls = m.sender === "user" ? "user" : "bot";

        var el = document.createElement("div");
        el.className = "shf-msg " + cls;

        el.innerHTML =
            formatMessage(m.message, cls === "user") +
            '<span class="shf-msg-time">' +
            escapeHtml(m.time || timeNow()) +
            "</span>";

        els.body.appendChild(el);

        if (cls === "bot") {
            el.querySelectorAll(".shf-keyword").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    els.input.value = btn.dataset.keyword;
                    sendMessage();
                });
            });
        }
    }

    function maybeAddDonateNudge() {
    // Count bot replies
    var botCount = state.messages.filter(function(m) {
        return m.sender === "bot";
    }).length;

    // Every 5th bot reply, add nudge
    if (botCount > 0 && botCount % 5 === 0) {
        var lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg && lastMsg.sender === "bot" && !lastMsg.isNudge) {
            var nudge = {
                id: state.nextId++,
                sender: "bot",
                message:
                    "💝 *Ready to make a difference?*\n\n" +
                    "[Donate Now](/donate) — Feed 20+ children from just ₹1,000.\n\n" +
                    "Every contribution brings hope. 🙏",
                time: timeNow(),
                isNudge: true,
            };
            state.messages.push(nudge);
            saveMessages();
            renderMessage(nudge);
        }
    }
}

    function pushMessage(msg) {
        state.messages.push(msg);
        saveMessages();
        renderMessage(msg);

        // Bot message + chat closed → increment unread badge + start title blink
        if (msg.sender === "bot" && !state.open) {
            state.unreadCount++;
            updateFabBadge();
            startTitleBlink(state.unreadCount);
        }
    }

    function showTyping(show) {
        var t = els.body && els.body.querySelector(".shf-typing");
        if (show && !t) {
            var el = document.createElement("div");
            el.className = "shf-typing";
            el.innerHTML = "<span></span><span></span><span></span>";
            els.body.appendChild(el);
            scrollBottom();
        } else if (!show && t) {
            t.remove();
        }
    }

    // ---------------- SEND ----------------
    function sendMessage() {
        var text = (els.input.value || "").trim();
        if (!text || state.busy) return;

        pushMessage({
            id: state.nextId++,
            sender: "user",
            message: text,
            time: timeNow(),
        });

        els.input.value = "";
        els.input.style.height = "auto";
        state.busy = true;
        els.send.disabled = true;
        scrollBottom();

        var reply = findReply(text);

        showTyping(true);
        setTimeout(function () {
            showTyping(false);
            pushMessage({
                id: state.nextId++,
                sender: "bot",
                message: reply,
                time: timeNow(),
            });
            maybeAddDonateNudge(); 
            scrollBottom();
            state.busy = false;
            els.send.disabled = false;
            els.input.focus();
        }, CFG.replyDelayMs);
    }


    // ---------------- OPEN / CLOSE ----------------
    function openChat() {
        state.open = true;
        els.chat.classList.add("open");
        document.body.classList.add("shf-chat-open");

        state.unreadCount = 0;
        updateFabBadge();
        stopTitleBlink();

        els.body.innerHTML = "";

        if (state.messages.length) {
            state.messages.forEach(function (message) {
                if (
                    message.sender === "bot" &&
                    message.message.indexOf("Welcome to") !== -1
                ) {
                    renderWelcomeMessage(message);
                } else {
                    renderMessage(message);
                }
            });

            scrollBottom();
        } else {
            var welcome = {
                id: state.nextId++,
                sender: "bot",
                message:
                    "👋 Welcome to *Smart Help Foundation*!\n" +
                    "How can we help you today?",
                time: timeNow(),
            };

            state.messages.push(welcome);
            renderWelcomeMessage(welcome);
            scrollBottom();
        }

        els.foot.style.display = "flex";

        setTimeout(function () {
            els.input.focus();
        }, 200);
    }
    function closeChat() {
        state.open = false;
        els.chat.classList.remove("open");
        document.body.classList.remove("shf-chat-open");
    }

    // ---------------- EVENTS ----------------
    function bindEvents() {
        els.fab.addEventListener("click", function (e) {
            e.stopPropagation();
            state.open ? closeChat() : openChat();
        });
        els.close.addEventListener("click", function (e) {
            e.stopPropagation();
            closeChat();
        });

        els.send.addEventListener("click", sendMessage);

        els.input.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        els.input.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 100) + "px";
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && state.open) closeChat();
        });

        document.addEventListener("click", function (e) {
            if (!state.open) return;
            var t = e.target;
            if (els.chat && els.chat.contains(t)) return;
            if (els.fab && els.fab.contains(t)) return;
            closeChat();
        });
    }

    // ---------------- INIT ----------------
    function ensureFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) return;
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
        document.head.appendChild(link);
    }

    function init() {
        ensureFontAwesome();
        injectCSS();
        injectHTML();
        cacheEls();
        bindEvents();

        // Remove old localStorage leftover (safety cleanup)
        try {
            localStorage.removeItem("shf_chat_messages_v1");
            localStorage.removeItem("shf_chat_name");
            sessionStorage.removeItem("shf_welcome_shown");
        } catch (e) { }

        // Show welcome only if this tab has no messages yet
        if (state.messages.length === 0) {
            var greeting =
                "👋 Welcome to *Smart Help Foundation*!\n" +
                "How can we help you today?";

            state.messages.push({
                id: state.nextId++,
                sender: "bot",
                message: greeting,
                time: timeNow(),
            });

            saveMessages();
            state.unreadCount = 1;
            updateFabBadge();
            startTitleBlink(1);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();