import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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
  const result = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return result.data;
}

export function platformName() {
  return Platform.OS === "ios" ? "ios" : "android";
}
