import { badRequest } from "../errors.js";
export function validate(schema){ return (req,res,next)=>{ const r=schema.safeParse(req.body); if(!r.success) return next(badRequest(r.error.issues.map(i=>i.path.join(".")+": "+i.message).join("; "))); req.body=r.data; next(); }; }
