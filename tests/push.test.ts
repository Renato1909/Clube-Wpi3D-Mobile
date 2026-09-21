jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({
    data: "ExponentPushToken[test]",
  }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  AndroidImportance: { HIGH: "high" },
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest
    .fn()
    .mockResolvedValue("ExponentPushToken[test]"),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockDeleteEq = jest
  .fn()
  .mockReturnValueOnce({
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
const mockDelete = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null }),
  }),
});

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: mockUpsert,
      delete: mockDelete,
    })),
  },
}));

import * as SecureStore from "expo-secure-store";
import {
  configureAndroidNotificationChannel,
  getExpoPushToken,
  platformName,
  registerPushToken,
  unregisterPushToken,
} from "../lib/push";

describe("push helpers", () => {
  test("returns an Expo push token after permission is granted", async () => {
    await expect(getExpoPushToken("project-id")).resolves.toBe(
      "ExponentPushToken[test]",
    );
  });

  test("reports the native platform", () => {
    expect(["android", "ios"]).toContain(platformName());
  });

  test("persists the token for the authenticated user", async () => {
    await expect(
      registerPushToken("user-123", "project-id"),
    ).resolves.toBe("ExponentPushToken[test]");

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: "user-123",
        token: "ExponentPushToken[test]",
        platform: expect.any(String),
      },
      { onConflict: "user_id,token" },
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "clube-wpi3d.push-token",
      "ExponentPushToken[test]",
    );
  });

  test("removes the current device token for the authenticated user", async () => {
    await expect(unregisterPushToken("user-123")).resolves.toBe(
      "ExponentPushToken[test]",
    );

    expect(mockDelete).toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "clube-wpi3d.push-token",
    );
  });

  test("configures the Android notification channel without failing on other platforms", async () => {
    await expect(configureAndroidNotificationChannel()).resolves.toBeUndefined();
  });
});
