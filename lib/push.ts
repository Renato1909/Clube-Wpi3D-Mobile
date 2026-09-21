import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { supabase } from "./supabase";

const PUSH_TOKEN_STORAGE_KEY = "clube-wpi3d.push-token";

export async function configureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Clube WPI3D",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestPushPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== "granted") return null;
  }
  return Notifications.getPermissionsAsync();
}

function resolveEasProjectId(projectId?: string) {
  return (
    projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  );
}

export async function getExpoPushToken(projectId?: string) {
  if (Platform.OS === "web") return null;

  await configureAndroidNotificationChannel();

  const permission = await requestPushPermission();
  if (!permission || permission.status !== "granted") return null;

  const resolvedProjectId = resolveEasProjectId(projectId);
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

  await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, token);
  return token;
}

export async function unregisterPushToken(userId: string) {
  if (!userId || Platform.OS === "web") return null;

  const token = await SecureStore.getItemAsync(PUSH_TOKEN_STORAGE_KEY);
  if (!token) return null;

  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("token", token);
  if (error) throw error;

  await SecureStore.deleteItemAsync(PUSH_TOKEN_STORAGE_KEY);
  return token;
}
