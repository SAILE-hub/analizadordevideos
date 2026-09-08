import express from "express";
import dotenv from "dotenv";
import { analyzeVideo } from "./services/analyzer.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/analyze", async (req, res) => {
    try {
        const { url, amount } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "Debes proporcionar una URL."
            });
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            return res.status(400).json({
                error: "La URL no parece ser de YouTube."
            });
        }

        const clips = await analyzeVideo(url, amount);

        res.json({
            success: true,
            clips
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "No se pudo analizar el video."
        });
    }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Iniciar el servidor solo si este archivo se ejecuta directamente: `node server.js`
if (process.argv[1] && process.argv[1] === __filename) {
    app.listen(PORT, () => {
        console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
}

export default app;