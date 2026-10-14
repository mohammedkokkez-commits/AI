const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// الواجهة الرئيسية
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>شات الذكاء الاصطناعي</title>
        </head>

        <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right; background: #f9f9f9;">
            <h2>محادثة الذكاء الاصطناعي (مجاني)</h2>
            <form action="/chat" method="POST" style="background: #fff; padding: 15px; border: 1px solid #ccc; max-width: 500px;">
                <label><strong>اكتب سؤالك هنا:</strong></label><br><br>
                <textarea name="message" style="width: 95%; height: 100px; padding: 8px;" required></textarea><br><br>
                <input type="submit" value="إرسال الطلب" style="padding: 10px 20px; font-size: 16px; background: #0066cc; color: white; border: none; cursor: pointer;">
            </form>
        </body>
        </html>
    `);
});

// معالجة الرسالة
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.redirect('/');

    try {
        // إرسال الطلب لـ Pollinations AI (خدمة مجانية بالكامل وبدون مفتاح)
        const promptText = encodeURIComponent(`أجب باللغة العربية باختصار: ${userMessage}`);
        const response = await fetch(`https://text.pollinations.ai/${promptText}`);
        
        const botReply = await response.text();

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>النتيجة</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right; background: #f4f4f4;">
                <div style="background: #fff; padding: 15px; border: 1px solid #ccc; max-width: 600px;">
                    <p style="color: #0066cc;"><strong>سؤالك:</strong> ${escapeHtml(userMessage)}</p>
                    <hr>
                    <p style="color: #008000; white-space: pre-wrap;"><strong>الجواب:</strong><br>${escapeHtml(botReply)}</p>
                </div>
                <br>
                <a href="/" style="padding: 10px 15px; background: #333; color: white; text-decoration: none;">← سؤال جديد</a>
            </body>
            </html>
        `);

    } catch (error) {
        res.send("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: " + error.message);
    }
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
