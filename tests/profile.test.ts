import { getProfile, updateProfile } from "../lib/profile";

describe("profile helpers", () => {
  test("loads the authenticated user's profile", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: { id: "u1", full_name: "Renato", phone: null }, error: null });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    const supabase = { from: jest.fn(() => ({ select })) };

    const result = await getProfile(supabase, "u1");
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(eq).toHaveBeenCalledWith("id", "u1");
    expect(result.data?.full_name).toBe("Renato");
  });

  test("normalizes blank phone before persisting", async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: "u1", full_name: "Renato", phone: null }, error: null });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    const supabase = { from: jest.fn(() => ({ update })) };

    await updateProfile(supabase, "u1", " Renato ", "   ");
    expect(update).toHaveBeenCalledWith({ full_name: "Renato", phone: null });
    expect(eq).toHaveBeenCalledWith("id", "u1");
  });
});
