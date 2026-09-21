jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({
    data: "ExponentPushToken[test]",
  }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  AndroidImportance: { HIGH: "high" },
}));

const mockSetItem = jest.fn().mockResolvedValue(undefined);
const mockGetItem = jest
  .fn()
  .mockResolvedValue("ExponentPushToken[test]");
const mockDeleteItem = jest.fn().mockResolvedValue(undefined);

jest.mock("expo-secure-store", () => ({
  setItemAsync: mockSetItem,
  getItemAsync: mockGetItem,
  deleteItemAsync: mockDeleteItem,
}));

const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockDelete = jest.fn();

const mockDeleteChain = {
  eq: jest.fn(),
};

mockDeleteChain.eq.mockImplementationOnce(() => mockDeleteChain);
mockDeleteChain.eq.mockReturnValue(
  Promise.resolve({ error: null }),
);
mockDelete.mockReturnValue(mockDeleteChain);

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: mockUpsert,
      delete: mockDelete,
    })),
  },
}));

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
    expect(mockSetItem).toHaveBeenCalledWith(
      "clube-wpi3d.push-token",
      "ExponentPushToken[test]",
    );
  });

  test("removes the current device token for the authenticated user", async () => {
    await expect(unregisterPushToken("user-123")).resolves.toBe(
      "ExponentPushToken[test]",
    );

    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteChain.eq).toHaveBeenNthCalledWith(1, "user_id", "user-123");
    expect(mockDeleteChain.eq).toHaveBeenNthCalledWith(
      2,
      "token",
      "ExponentPushToken[test]",
    );
    expect(mockDeleteItem).toHaveBeenCalledWith("clube-wpi3d.push-token");
  });

  test("configures the Android notification channel without failing on other platforms", async () => {
    await expect(configureAndroidNotificationChannel()).resolves.toBeUndefined();
  });
});
