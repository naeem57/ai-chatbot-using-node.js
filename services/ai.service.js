import axios from "axios";
import { OPENROUTER_API_KEY } from "../config/env.js";

const FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.0-flash-001",
    "mistralai/mistral-7b-instruct:free",
    "deepseek/deepseek-r1:free"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAIResponse = async (message) => {
    let lastError = null;

    for (const model of FREE_MODELS) {
        let retries = 3;
        let delay = 1000;

        while (retries > 0) {
            try {
                console.log(`Attempting with model: ${model} (${retries} retries left)`);
                const response = await axios.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: "You are a senior backend developer AI assistant."
                            },
                            {
                                role: "user",
                                content: message
                            }
                        ]
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                return response.data.choices[0].message.content;

            } catch (error) {
                lastError = error;
                const status = error.response?.status;
                const errorMsg = error.response?.data?.error?.message || error.message;

                console.error(`AI Error (${model}):`, errorMsg);

                if (status === 429) {
                    console.warn(`Rate limit hit for ${model}. Retrying in ${delay}ms...`);
                    await sleep(delay);
                    retries--;
                    delay *= 2; // Exponential backoff
                } else {
                    // For other errors, skip to the next model immediately
                    break;
                }
            }
        }
    }

    // If we reach here, all models failed
    const finalErrorMessage = lastError?.response?.data?.error?.message || lastError?.message || "Unknown error";
    
    if (finalErrorMessage.includes("rate-limited")) {
        throw new Error("All free AI models are currently busy. Please try again later or add your own OpenRouter API key for dedicated capacity.");
    }

    throw new Error(`AI service failed after trying multiple models: ${finalErrorMessage}`);
};