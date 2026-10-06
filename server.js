const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/verify', async (req, res) => {
    try {
        const { imageBase64, mimeType = 'image/jpeg', expectedAmount = 3500 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ isValid: false, summary: 'No image provided.' });
        }

        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are the official Royal Flare 26 automated banking fraud detection engine.
Analyze this uploaded image strictly to determine if it is an authentic Sri Lankan bank deposit slip or electronic transfer receipt.
- Event: Royal Flare 26 (Sastralians)
- Beneficiary Bank: HNB (Hatton National Bank)
- Account Number: 125020004322
- Beneficiary Name: W.L.T.L. Weerasooriya
- Required Amount: LKR ${expectedAmount}

Respond ONLY with raw JSON without markdown formatting: {"isValid": boolean, "bankName": string, "detectedAmount": number, "referenceNumber": string, "confidence": number, "summary": string}`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: cleanBase64, mimeType } }
        ]);

        const text = result.response.text().replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        res.json(JSON.parse(text));
    } catch (err) {
        console.error(err);
        res.status(500).json({ isValid: false, summary: "Error processing verification." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
