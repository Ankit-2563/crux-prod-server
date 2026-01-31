import express, { Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB error:", err));

// -----------------
// MongoDB Schema
// -----------------

interface ISensorData extends Document {
  deviceId: string;
  temperature: number;
  humidity: number;
  timestamp: number;
  receivedAt: Date;
}

const SensorSchema = new Schema<ISensorData>({
  deviceId: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  receivedAt: { type: Date, default: Date.now },
});

const SensorData = mongoose.model<ISensorData>("SensorData", SensorSchema);

// -----------------
// Routes
// -----------------

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("Crux Server running");
});

// ESP32 POST endpoint
app.post("/data", async (req: Request, res: Response) => {
  try {
    console.log("Incoming data:", req.body);

    const data = new SensorData(req.body);
    await data.save();

    res.status(200).json({
      success: true,
      message: "Data stored successfully",
    });
  } catch (error) {
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
