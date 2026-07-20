const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static(__dirname));

app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No image uploaded"
            });
        }

        let filename = req.file.originalname || "image.jpg";
        if (filename === "blob") filename = "image.jpg";

        const form = new FormData();
        form.append("images", fs.createReadStream(req.file.path), {
            filename: filename,
            contentType: req.file.mimetype || "image/jpeg"
        });
        form.append("organs", "auto");

        const response = await axios.post(
            `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`,
            form,
            {
                headers: form.getHeaders()
            }
        );

        const bestMatch = response.data.results[0];

        fs.unlinkSync(req.file.path);

        const plantName =
            bestMatch?.species?.commonNames?.[0] || "Unknown";

        const scientificName =
            bestMatch?.species?.scientificNameWithoutAuthor || "Unknown";

        res.json({
            plantName,
            scientificName,

            benefits: [
                "Air purification",
                "Low maintenance",
                "Natural oxygen production"
            ],

            negatives: [
                "Can be toxic to pets",
                "Overwatering may cause root rot"
            ],

            uses: [
                "Indoor decoration",
                "Air cleaner",
                "Home gardening"
            ],

            aiAdvice:
                req.body.plantProblem ||
                "Keep in indirect sunlight and avoid overwatering."
        });

    } catch (error) {
        console.error(error.response?.data || error.message);

        if (error.response?.status === 404) {
            return res.status(404).json({
                error: "Plant not found in the image. Please try a clearer picture."
            });
        }

        const apiError = error.response?.data?.message || error.response?.data?.error || "PlantNet API failed";
        
        res.status(500).json({
            error: `API Error: ${apiError}`
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
    if (process.env.PLANTNET_API_KEY) {
        console.log("PlantNet API Key is loaded successfully.");
    } else {
        console.warn("WARNING: PlantNet API Key is MISSING from .env!");
    }
});