# Viral AI Shorts Planner

An AI-powered application that generates trending and viral YouTube Shorts ideas, scripts, and video clips on-demand across various genres using Google's Gemini and Veo models.

## ✨ Features

- **Bright & Vibrant UI:** A colorful, modern, and inspiring user interface that makes creativity a joy.
- **AI-Powered Idea Generation:** Get 10 unique, viral-engineered video ideas by selecting a genre and duration.
- **Rich Genre Selection:** Choose from a wide range of categories including Funny Clips, Horror, Mysteries, Gaming (Roblox, Minecraft), Pet Calming videos, and more.
- **Idea Management:** Save your favorite ideas, filter them by genre, and delete them when you're done. The app keeps your last 5 saved ideas.
- **Trend Analysis:** A unique "Trending" filter uses AI to analyze the current digital landscape and highlight which of your saved ideas align with viral topics on YouTube and TikTok.
- **Advanced Scriptwriting:**
    - Generate a detailed, production-ready shooting script from any idea.
    - Provide suggestions and iteratively regenerate the script to perfection.
    - Finalize the script into a clean, structured JSON format, ready for any production pipeline.
- **Automated SEO & Marketing Kit:** Upon finalizing a script, the AI automatically generates a catchy title, an engaging SEO-optimized description, and relevant hashtags/keywords to maximize your video's reach.
- **Persistent Script History:** The app automatically saves your last 5 finalized scripts (including the full idea, JSON, and SEO kit) to your browser's local storage for easy access.
- **Idea Refinement:** Directly edit the title, concept, story arc, and visual cues of any generated idea to match your creative vision.
- **(Optional) Video Generation:** Bring your ideas to life by generating a short video clip using Google's powerful Veo model. This feature is on-demand and requires API key selection.

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Models:**
    - **Google Gemini 2.5 Pro:** For idea generation, scriptwriting, trend analysis, and SEO content.
    - **Google Veo:** For AI video generation.

## 🏃‍♂️ How to Use

1.  **Select a Genre and Duration:** Choose from the dropdown menus to set the context for the AI.
2.  **Generate Ideas:** Click the "✨ Generate 10 Viral Ideas" button.
3.  **Review & Manage:** Browse the generated ideas. You can:
    - **Save** an idea to your personal list.
    - **Edit** an idea to refine its details.
    - **Create Script** to move to the scriptwriting phase.
    - **Generate Video** to create a video clip (this will prompt for an API key if not already selected).
4.  **Refine Scripts:** In the script modal, you can generate an initial script, provide text feedback, and regenerate until it's perfect.
5.  **Finalize & Get SEO:** Once the script is ready, finalize it to get a clean JSON output and an automatically generated SEO kit.
6.  **Review History:** Access your last 5 finalized projects from the "Script History" section on the main page.
7.  **Find a Viral Hit:** Use the "Trending" filter in the "Your Saved Ideas" section to see which of your concepts are most likely to take off right now.