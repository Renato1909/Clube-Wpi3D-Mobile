jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "ExponentPushToken[test]" }),
}));

import { getExpoPushToken, platformName } from "../lib/push";

describe("push helpers", () => {
  test("returns an Expo push token after permission is granted", async () => {
    await expect(getExpoPushToken("project-id")).resolves.toBe("ExponentPushToken[test]");
  });

  test("reports the native platform", () => {
    expect(["android", "ios"]).toContain(platformName());
  });
});
