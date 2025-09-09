const axios = a require("axios");
const cron = require("node-cron");

// --- মডিউলের কনফিগারেশন ---
module.exports.config = {
    name: "azan",
    version: "1.0.0",
    hasPermssion: 2, // শুধুমাত্র অ্যাডমিন ব্যবহার করতে পারবে
    credits: "sifat", // ক্রেডিটস
    description: "প্রতিদিন ৫ বেলা নামাজের সময় স্বয়ংক্রিয়ভাবে মেসেজ দিবে",
    commandCategory: "system",
    usages: "N/A",
    cooldowns: 5,
};

// --- বট চালু হলে এই ফাংশনটি কাজ করবে ---
module.exports.onLoad = async function ({ api }) {
    
    // --- নিজের প্রয়োজন অনুযায়ী এখানে আইডি দিন ---
    // যে গ্রুপ বা চ্যাটে মেসেজ পাঠাতে চান তার আইডি এখানে দিন।
    // একাধিক আইডি ব্যবহার করতে চাইলে, একটি অ্যারে তৈরি করে লুপ ব্যবহার করতে পারেন।
    // যেমন: const threadIDs = ["ID1", "ID2"];
    const threadID = "YOUR_THREAD_ID"; // <<<<<<<<<<<< এখানে আপনার গ্রুপ বা ইউজার আইডি দিন

    // --- প্রতিদিনের নামাজের সময়সূচী ---
    let prayerTimes = {};

    // --- নামাজের সময় নিয়ে আসার ফাংশন ---
    async function getPrayerTimes() {
        try {
            // ঢাকা, বাংলাদেশ-এর জন্য নামাজের সময় আনা হচ্ছে।
            const response = await axios.get("http://api.aladhan.com/v1/timingsByCity", {
                params: {
                    city: "Dhaka",
                    country: "Bangladesh",
                    method: 1 // University of Islamic Sciences, Karachi
                }
            });
            // শুধুমাত্র ৫ ওয়াক্ত নামাজের সময় নেওয়া হচ্ছে।
            const times = response.data.data.timings;
            prayerTimes = {
                Fajr: times.Fajr,
                Dhuhr: times.Dhuhr,
                Asr: times.Asr,
                Maghrib: times.Maghrib,
                Isha: times.Isha
            };
            console.log("আজকের নামাজের সময় সফলভাবে লোড হয়েছে:", prayerTimes);
        } catch (error) {
            console.error("নামাজের সময় আনতে সমস্যা হয়েছে:", error);
        }
    }

    // --- প্রতিদিন রাত ১২:০১ মিনিটে নতুন দিনের সময়সূচী লোড করবে ---
    cron.schedule('1 0 * * *', () => {
        console.log("নতুন দিনের জন্য নামাজের সময় আপডেট করা হচ্ছে...");
        getPrayerTimes();
    }, {
        scheduled: true,
        timezone: "Asia/Dhaka"
    });

    // --- প্রতি মিনিটে সময় চেক করার জন্য ক্রোন জব ---
    cron.schedule('* * * * *', () => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: "Asia/Dhaka" });
        
        // --- ওয়াক্ত অনুযায়ী মেসেজ ---
        let prayerName = "";
        let message = "";

        if (currentTime === prayerTimes.Fajr) {
            prayerName = "ফজরের";
            message = `🕋 আসসালামু আলাইকুম।\n\nএখন ${prayerName} আযানের সময় হয়েছে। আল্লাহ আমাদের সবাইকে নামাজ আদায় করার তৌফিক দান করুন।`;
        } else if (currentTime === prayerTimes.Dhuhr) {
            prayerName = "যোহরের";
            message = `🕋 আসসালামু আলাইকুম।\n\nএখন ${prayerName} আযানের সময় হয়েছে। দুনিয়ার সব কাজ ফেলে নামাজ আদায় করে নিন।`;
        } else if (currentTime === prayerTimes.Asr) {
            prayerName = "আসরের";
            message = `🕋 আসসালামু আলাইকুম।\n\nএখন ${prayerName} আযানের সময় হয়েছে। আল্লাহ আপনার প্রার্থনা কবুল করুন।`;
        } else if (currentTime === prayerTimes.Maghrib) {
            prayerName = "মাগরিবের";
            message = `🕋 আসসালামু আলাইকুম।\n\nএখন ${prayerName} আযানের সময় হয়েছে। মহান আল্লাহ আমাদের উপর রহমত বর্ষণ করুন।`;
        } else if (currentTime === prayerTimes.Isha) {
            prayerName = "ইশার";
            message = `🕋 আসসালামু আলাইকুম।\n\nএখন ${prayerName} আযানের সময় হয়েছে। দিনের শেষ নামাজ আদায় করে আল্লাহর কাছে ক্ষমা প্রার্থনা করুন।`;
        }

        // --- যদি নামাজের সময় হয়, তাহলে মেসেজ পাঠাবে ---
        if (message) {
            api.sendMessage(message, threadID, (err) => {
                if (err) console.error("আজানের মেসেজ পাঠাতে সমস্যা হয়েছে:", err);
                else console.log(`${prayerName} নামাজের জন্য সফলভাবে মেসেজ পাঠানো হয়েছে।`);
            });
        }

    }, {
        scheduled: true,
        timezone: "Asia/Dhaka"
    });

    // বট চালু হওয়ার সাথে সাথে প্রথমবার নামাজের সময় লোড করবে
    getPrayerTimes();
}

// --- এই কমান্ডের জন্য কোনো রান ফাংশন নেই, কারণ এটি স্বয়ংক্রিয় ---
module.exports.run = async function ({ api, event }) {
    api.sendMessage("এটি একটি স্বয়ংক্রিয় মডিউল। প্রতিদিন নামাজের সময় হলে এটি নিজে থেকেই মেসেজ দিবে।", event.threadID, event.messageID);
};
