import { getAIResponse } from "../services/ai.service.js";

export const chatController = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        const reply = await getAIResponse(message);

        res.json({
            success: true,
            userMessage: message,
            aiReply: reply
        });

    } catch (error) {
        const isRateLimit = error.message.includes("currently busy");
        res.status(isRateLimit ? 503 : 500).json({
            success: false,
            error: error.message
        });
    }
};