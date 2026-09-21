jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({
    data: "ExponentPushToken[test]",
  }),
}));

const mockUpsert = jest.fn().mockResolvedValue({ error: null });

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({ upsert: mockUpsert })),
  },
}));

import {
  getExpoPushToken,
  platformName,
  registerPushToken,
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
  });
});
