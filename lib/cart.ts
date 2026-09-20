export type CartItem={slug:string;title:string;image:string;priceCents:number|null;quantity:number};
export function normalizeQuantity(value:number){return Math.max(1,Math.min(99,Math.trunc(value)))}
export function addCartItem(items:CartItem[],item:Omit<CartItem,'quantity'>,quantity=1){const q=normalizeQuantity(quantity);const found=items.find(x=>x.slug===item.slug);if(!found)return[...items,{...item,quantity:q}];return items.map(x=>x.slug===item.slug?{...x,quantity:normalizeQuantity(x.quantity+q)}:x)}
export function removeCartItem(items:CartItem[],slug:string){return items.filter(x=>x.slug!==slug)}
export function cartTotalCents(items:CartItem[]){return items.some(x=>x.priceCents===null)?null:items.reduce((s,x)=>s+(x.priceCents as number)*x.quantity,0)}
