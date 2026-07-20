require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No image uploaded"
            });
        }

        const form = new FormData();
        form.append("images", fs.createReadStream(req.file.path));

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

        res.status(500).json({
            error: "PlantNet API failed"
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});