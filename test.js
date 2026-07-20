const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

async function test() {
    try {
        const form = new FormData();
        form.append("image", fs.createReadStream("test_image.jpg"));
        
        const response = await axios.post("http://localhost:5000/analyze", form, {
            headers: form.getHeaders()
        });
        
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}
test();
