export class ApiError extends Error { constructor(status, code, message){ super(message); this.status=status; this.code=code; } }
export const badRequest=(m)=>new ApiError(400,"BAD_REQUEST",m);
export const unauthorized=(m="Unauthorized")=>new ApiError(401,"UNAUTHORIZED",m);
export const forbidden=(m="Forbidden")=>new ApiError(403,"FORBIDDEN",m);
export const notFound=(m="Not found")=>new ApiError(404,"NOT_FOUND",m);
export function ok(res,data,status=200){ res.status(status).json({success:true,data}); }
export function errorHandler(err,req,res,next){ if(err instanceof ApiError) return res.status(err.status).json({success:false,error:{code:err.code,message:err.message}}); if(err?.code==="P2002") return res.status(409).json({success:false,error:{code:"CONFLICT",message:"Duplicate value"}}); console.error("error", err?.message||err); res.status(500).json({success:false,error:{code:"INTERNAL",message:"Internal server error"}}); }
