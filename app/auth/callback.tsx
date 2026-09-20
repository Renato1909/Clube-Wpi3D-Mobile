import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const params = useLocalSearchParams<{ next?: string }>();

  useEffect(() => {
    const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/minha-conta";
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? next : "/login");
    });
  }, [params.next]);

  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>;
}
