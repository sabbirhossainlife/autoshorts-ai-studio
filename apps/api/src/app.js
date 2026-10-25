import express from "express"; import cors from "cors"; import helmet from "helmet"; import cookieParser from "cookie-parser"; import rateLimit from "express-rate-limit"; import { env } from "./config/env.js"; import { errorHandler, ok } from "./errors.js"; import { requireAuth, requireCsrf } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js"; import projectRoutes from "./routes/projects.js"; import trendRoutes from "./routes/trends.js"; import scriptRoutes from "./routes/scripts.js"; import mediaRoutes from "./routes/media.js"; import youtubeRoutes from "./routes/youtube.js"; import miscRoutes from "./routes/misc.js";
export function createApp(){
  const app=express();
  app.use(helmet()); app.use(cors({origin:env.corsOrigin, credentials:true})); app.use(express.json({limit:"2mb"})); app.use(cookieParser());
  app.use("/api/", rateLimit({windowMs:60*1000, max:300}));
  app.get("/health", (req,res)=>ok(res,{status:"ok", service:"autoshorts-api"}));
  app.use("/api/auth", authRoutes);
  app.use("/api", requireAuth, requireCsrf);
  app.use("/api/projects", projectRoutes); app.use("/api/trends", trendRoutes); app.use("/api", scriptRoutes); app.use("/api", mediaRoutes); app.use("/api/youtube", youtubeRoutes); app.use("/api", miscRoutes);
  app.use(errorHandler);
  return app;
}
