import jwt from "jsonwebtoken"; import { env } from "../config/env.js"; import { unauthorized } from "../errors.js";
export const COOKIE_NAME="autoshorts_session";
export function signToken(user){ return jwt.sign({id:user.id,email:user.email,role:user.role}, env.jwtSecret, {expiresIn:"7d"}); }
export function cookieOptions(){ return { httpOnly:true, sameSite:"lax", path:"/", maxAge:7*24*3600*1000 }; }
export function requireAuth(req,res,next){ try{ const t=req.cookies?.[COOKIE_NAME]; if(!t) throw unauthorized(); req.user=jwt.verify(t, env.jwtSecret); next(); }catch{ next(unauthorized()); } }
export function csrfToken(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }
export function requireCsrf(req,res,next){ if(["GET","HEAD","OPTIONS"].includes(req.method)) return next(); const h=req.headers["x-csrf-token"]; const c=req.cookies?.autoshorts_csrf; if(!h||!c||h!==c) return next(unauthorized("CSRF token missing or invalid")); next(); }
