import { useEffect } from "react";
import { ActivityIndicator,Alert,View } from "react-native";
import { router,useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { normalizeAuthCode,resolveAuthNext } from "../../lib/auth";
export default function AuthCallback(){const params=useLocalSearchParams<{next?:string;code?:string}>();useEffect(()=>{let active=true;(async()=>{const next=resolveAuthNext(params.next);const code=normalizeAuthCode(params.code);if(!code)throw new Error("missing_code");const {error:exchangeError}=await supabase.auth.exchangeCodeForSession(code);if(exchangeError)throw exchangeError;const {data,error}=await supabase.auth.getSession();if(error||!data.session)throw new Error("missing_session");if(active)router.replace(next)})().catch(()=>{if(active){Alert.alert("Link inválido","O link expirou ou não pôde ser confirmado. Solicite um novo link no mesmo aparelho.");router.replace("/login")}});return()=>{active=false}},[params.code,params.next]);return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><ActivityIndicator/></View>}
