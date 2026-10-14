const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.redirect('/');

    try {
        // استخدام نموذج مفتوح ومجاني بشكل مباشر من Hugging Face
        const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                inputs: `<|system|>\nYou are a helpful assistant. Reply in Arabic.<|end|>\n<|user|>\n${userMessage}<|end|>\n<|assistant|>`,
                parameters: { max_new_tokens: 250 }
            })
        });

        const data = await response.json();
        let botReply = "عذراً، لم أتمكن من الحصول على رد.";

        if (Array.isArray(data) && data[0]?.generated_text) {
            const rawText = data[0].generated_text;
            botReply = rawText.split('<|assistant|>')[1] || rawText;
        }

        res.send(`
            <html>
            <head>
                <meta charset="utf-8">
                <title>محادثة الآيباد</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; color: #333; direction: rtl; }
                    .box { background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc; }
                    .user { color: #0066cc; }
                    .bot { color: #008000; white-space: pre-wrap; }
                    a { display: inline-block; margin-top: 15px; padding: 10px 15px; background: #0066cc; color: #fff; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h2>المحادثة المجانية (iPad 1)</h2>
                <div class="box">
                    <p class="user"><strong>السؤال:</strong> ${escapeHtml(userMessage)}</p>
                    <hr>
                    <p class="bot"><strong>الجواب:</strong><br>${escapeHtml(botReply.trim())}</p>
                </div>
                <a href="/">← سؤال جديد</a>
            </body>
            </html>
        `);

    } catch (error) {
        res.send("حدث خطأ أثناء الاتصال: " + error.message);
    }
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
