import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter";
import fundRouter from "./routes/fundRouter";
import sipRoutes from "./routes/sipRoutes";
import investorRoute from "./routes/InvestorRoutes";
import amcRoutes from "./routes/amcRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/amcs", amcRoutes);
app.use("/api/auth", authRouter);
app.use("/api", investorRoute);
app.use("/api/funds", fundRouter);
app.use("/api/sips", sipRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
