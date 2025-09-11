const schedule = require('node-schedule');
const moment = require('moment-timezone');
const chalk = require('chalk');

module.exports.config = {
    name: 'azaan',
    version: '11.0.0',
    hasPermssion: 0,
    credits: 'SIFAT',
    description: 'Automatically sends prayer reminders at scheduled times (BD Time)',
    commandCategory: 'group messenger',
    usages: '[]',
    cooldowns: 3
};

// অনুগ্রহ করে নিচের সময়সূচী প্রতিদিন পরিবর্তন করে নিবেন।
const messages = [
    { time: '4:30 AM', message: 'আস-সালাতু খাইরুম মিনান নাউম।\nএখন ফজর নামাজের সময়। স্নিগ্ধ ভোরের এই পবিত্র মুহূর্তে মহান আল্লাহর দরবারে সিজদাহ করে দিনের সূচনা করুন। 🕌✨' },
    { time: '1:00PM', message: 'কর্মব্যস্ততার মাঝে এখন যোহরের নামাজের সময়।\nকিছুক্ষণের জন্য দুনিয়ার কাজ থামিয়ে আখেরাতের জন্য প্রস্তুতি নিন। আল্লাহ আপনার প্রতি সহায় হোন। ☀️🕋' },
    { time: '4:40 PM', message: 'এখন আসর নামাজের সময়।\nদিনের শেষভাগে আল্লাহর নেয়ামতের শুকরিয়া আদায় করে নামাজ পড়ে নিন। নিশ্চয়ই তিনি পরম করুণাময়। 🌇🤲' },
    { time: '6:20 PM', message: 'সূর্য অস্ত رفتهছে, এখন মাগরিবের সময়।\nসারাদিনের ব্যস্ততা শেষে পরিবার নিয়ে সময়মতো নামাজ আদায় করুন এবং আল্লাহর কাছে দোয়া করুন। 🌆💖' },
    { time: '7:35 PM', message: 'এখন এশার নামাজের সময়।\nদিনের শেষ নামাজ আদায় করে প্রশান্তির সাথে আপনার দিন শেষ করুন। আল্লাহ আমাদের ইবাদত কবুল করুন। 🌙✨' }
];

module.exports.onLoad = ({ api }) => {
    console.log(chalk.bold.hex("#00c300")("============ NAMAZ REMINDER LOADED (BD TIME) ============"));

    messages.forEach(({ time, message }) => {
        const [hour, minute, period] = time.split(/[: ]/);
        let hour24 = parseInt(hour, 10);
        if (period === 'PM' && hour !== '12') {
            hour24 += 12;
        } else if (period === 'AM' && hour === '12') {
            hour24 = 0;
        }

        const rule = new schedule.RecurrenceRule();
        rule.tz = 'Asia/Dhaka';
        rule.hour = hour24;
        rule.minute = parseInt(minute, 10);

        schedule.scheduleJob(rule, () => {
            if (!global.data?.allThreadID) return;
            global.data.allThreadID.forEach(threadID => {
                api.sendMessage(message, threadID, (error) => {
                    if (error) {
                        console.error(`Failed to send message to ${threadID}:`, error);
                    }
                });
            });
        });

        console.log(chalk.hex("#00FFFF")(`Scheduled (BDT): ${time} => ${message}`));
    });
};

module.exports.run = () => {
    // Main logic is in onLoad
};
