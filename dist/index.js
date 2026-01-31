"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importStar(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB connection
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas connected"))
    .catch((err) => console.error("MongoDB error:", err));
const SensorSchema = new mongoose_1.Schema({
    deviceId: { type: String, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    receivedAt: { type: Date, default: Date.now },
});
const SensorData = mongoose_1.default.model("SensorData", SensorSchema);
// -----------------
// Routes
// -----------------
// Health check
app.get("/", (_req, res) => {
    res.send("Crux Server running");
});
// ESP32 POST endpoint
app.post("/data", async (req, res) => {
    try {
        console.log("Incoming data:", req.body);
        const data = new SensorData(req.body);
        await data.save();
        res.status(200).json({
            success: true,
            message: "Data stored successfully",
        });
    }
    catch (error) {
        console.error("Save error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to store data",
        });
    }
});
// -----------------
// Server start
// -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
