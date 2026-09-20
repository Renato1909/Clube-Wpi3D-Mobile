import AsyncStorage from'@react-native-async-storage/async-storage';import React,{createContext,useContext,useEffect,useMemo,useState}from'react';import{CartItem,addCartItem,cartTotalCents,removeCartItem,normalizeQuantity}from'../lib/cart';
const KEY='@clube-wpi3d/cart';const C=createContext<any>(null);
export function CartProvider({children}:{children:React.ReactNode}){const[items,setItems]=useState<CartItem[]>([]);
useEffect(()=>{AsyncStorage.getItem(KEY).then(x=>{if(x)try{setItems(JSON.parse(x))}catch{}})},[]);useEffect(()=>{AsyncStorage.setItem(KEY,JSON.stringify(items)).catch(()=>{})},[items]);
const value=useMemo(()=>({items,add:(i:any,q=1)=>setItems(x=>addCartItem(x,i,q)),remove:(s:string)=>setItems(x=>removeCartItem(x,s)),setQuantity:(s:string,q:number)=>setItems(x=>x.map(i=>i.slug===s?{...i,quantity:normalizeQuantity(q)}:i)),totalCents:cartTotalCents(items)}),[items]);return <C.Provider value={value}>{children}</C.Provider>}
export function useCart(){const v=useContext(C);if(!v)throw new Error('useCart fora do CartProvider');return v}
