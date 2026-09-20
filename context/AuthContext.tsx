import React,{createContext,useContext,useEffect,useMemo,useState}from'react';
import type{Session,User}from'@supabase/supabase-js';
import{supabase}from'../lib/supabase';
const C=createContext<{session:Session|null;user:User|null;loading:boolean;signOut:()=>Promise<void>}|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){const[session,setSession]=useState<Session|null>(null);const[loading,setLoading]=useState(true);
useEffect(()=>{let mounted=true;supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session);setLoading(false)}});const{data}=supabase.auth.onAuthStateChange((_,s)=>{setSession(s);setLoading(false)});return()=>{mounted=false;data.subscription.unsubscribe()}},[]);
const value=useMemo(()=>({session,user:session?.user??null,loading,signOut:async()=>{const{error}=await supabase.auth.signOut({scope:'local'});if(error)throw error}}),[session,loading]);return <C.Provider value={value}>{children}</C.Provider>}
export function useAuth(){const v=useContext(C);if(!v)throw new Error('useAuth fora do AuthProvider');return v}
