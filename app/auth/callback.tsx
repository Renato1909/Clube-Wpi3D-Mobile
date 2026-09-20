import { useEffect } from "react";
import { ActivityIndicator,View } from "react-native";
import { router,useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { normalizeAuthCode,resolveAuthNext } from "../../lib/auth";
export default function AuthCallback(){const params=useLocalSearchParams<{next?:string;code?:string}>();useEffect(()=>{let active=true;(async()=>{const next=resolveAuthNext(params.next);const code=normalizeAuthCode(params.code);if(code)await supabase.auth.exchangeCodeForSession(code);const {data}=await supabase.auth.getSession();if(active)router.replace(data.session?next:"/login")})().catch(()=>{if(active)router.replace("/login")});return()=>{active=false}},[params.code,params.next]);return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><ActivityIndicator/></View>}