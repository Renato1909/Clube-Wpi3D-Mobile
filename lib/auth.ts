export function resolveAuthNext(next?:string){return typeof next==="string"&&next.startsWith("/")?next:"/minha-conta";}
export function normalizeAuthCode(code?:string){return typeof code==="string"&&code.length>0?code:null;}
