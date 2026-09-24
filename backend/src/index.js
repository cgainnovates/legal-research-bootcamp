import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import paymentRoutes from "./routes/payments.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "legal-research-bootcamp-api",
    time: new Date().toISOString(),
  });
});

app.use("/api/payments", paymentRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Bootcamp API listening on port ${env.port}`);
  console.log(`Allowed frontend origin: ${env.frontendUrl}`);
  if (!env.paystackSecretKey) {
    console.warn("PAYSTACK_SECRET_KEY is not set. Payment initialisation will fail until it is configured.");
  }
});
