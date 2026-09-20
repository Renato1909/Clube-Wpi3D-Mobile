export type Profile = { id: string; full_name: string; phone: string | null };

export async function getProfile(supabase: { from: (table: string) => any }, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,phone")
    .eq("id", userId)
    .maybeSingle();
  return { data: (data as Profile | null) ?? null, error };
}

export async function updateProfile(
  supabase: { from: (table: string) => any },
  userId: string,
  fullName: string,
  phone: string,
) {
  return supabase
    .from("profiles")
    .update({ full_name: fullName.trim(), phone: phone.trim() || null })
    .eq("id", userId)
    .select("id,full_name,phone")
    .single();
}
