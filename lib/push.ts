import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export async function requestPushPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== "granted") return null;
  }
  return Notifications.getPermissionsAsync();
}

export async function getExpoPushToken(projectId?: string) {
  if (Platform.OS === "web") return null;
  const permission = await requestPushPermission();
  if (!permission || permission.status !== "granted") return null;
  const resolvedProjectId = projectId || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  const result = await Notifications.getExpoPushTokenAsync(
    resolvedProjectId ? { projectId: resolvedProjectId } : undefined,
  );
  return result.data;
}

export function platformName() {
  return Platform.OS === "ios" ? "ios" : "android";
}

export async function registerPushToken(userId: string, projectId?: string) {
  if (!userId || Platform.OS === "web") return null;
  const token = await getExpoPushToken(projectId);
  if (!token) return null;

  const { error } = await supabase.from("push_tokens").upsert(
    { user_id: userId, token, platform: platformName() },
    { onConflict: "user_id,token" },
  );
  if (error) throw error;
  return token;
}
