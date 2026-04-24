const express = require('express');
const cors = require('cors');
const { buildHierarchies } = require('./utils/graphProcessor');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration
const ID_DETAILS = {
    user_id: "hariraman_24102005",
    email_id: "hr4331@srmist.edu.in",
    college_roll_number: "RA2311003050215"
};

app.use(cors());
app.use(express.json());

/**
 * @route POST /bfhl
 * @desc Process node relationships and return tree structures
 */
app.post('/bfhl', (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                is_success: false,
                message: "Invalid input. 'data' must be an array of strings."
            });
        }

        const processedData = buildHierarchies(data);

        const response = {
            ...ID_DETAILS,
            ...processedData
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({
            is_success: false,
            message: "Internal server error during processing."
        });
    }
});

/**
 * @route GET /bfhl
 * @desc Health check or test route (Optional but good practice)
 */
app.get('/bfhl', (req, res) => {
    res.status(200).json({ operation_code: 1 });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
