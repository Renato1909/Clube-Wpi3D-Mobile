import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getProfile, updateProfile } from "../lib/profile";

const labels: Record<string, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  aguardando_cliente: "Aguardando você",
  aprovado: "Aprovado",
  recusado: "Não aprovado",
  concluido: "Concluído",
};

type Quote = {
  id: number;
  description: string;
  status: string;
  created_at: string;
};

export default function MinhaConta() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const currentUser = user;
    let active = true;

    async function load() {
      setLoading(true);

      const [{ data: profile }, { data: quoteData }] = await Promise.all([
        getProfile(supabase, currentUser.id),
        supabase
          .from("quotes")
          .select("id,description,status,created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (!active) return;

      setName(
        profile?.full_name ??
          (typeof currentUser.user_metadata?.full_name === "string"
            ? currentUser.user_metadata.full_name
            : ""),
      );
      setPhone(
        profile?.phone ??
          (typeof currentUser.user_metadata?.phone === "string"
            ? currentUser.user_metadata.phone
            : ""),
      );
      setQuotes((quoteData as Quote[] | null) ?? []);
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [user]);

  async function save() {
    if (!user || name.trim().length < 2) {
      Alert.alert("Perfil", "Informe um nome válido.");
      return;
    }

    setSaving(true);
    const { error } = await updateProfile(supabase, user.id, name, phone);
    setSaving(false);

    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Perfil", "Dados atualizados.");
  }

  async function logout() {
    await signOut();
    router.replace("/");
  }

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Minha conta</Text>
      <Text style={s.label}>E-mail</Text>
      <Text style={s.value}>{user.email}</Text>
      <Text style={s.label}>Nome</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={s.input}
        maxLength={120}
      />
      <Text style={s.label}>Telefone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={s.input}
        maxLength={25}
      />
      <Pressable style={s.button} onPress={save} disabled={saving}>
        <Text style={s.buttonText}>
          {saving ? "Salvando…" : "Salvar perfil"}
        </Text>
      </Pressable>
      <Text style={s.section}>Meus orçamentos</Text>
      {loading ? (
        <Text>Carregando…</Text>
      ) : quotes.length === 0 ? (
        <Text>Nenhum orçamento enviado.</Text>
      ) : (
        quotes.map((quote) => (
          <View key={quote.id} style={s.quote}>
            <Text style={s.quoteStatus}>
              {labels[quote.status] ?? quote.status}
            </Text>
            <Text numberOfLines={3}>{quote.description}</Text>
            <Text style={s.date}>
              {new Date(quote.created_at).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        ))
      )}
      <Pressable style={s.link} onPress={() => router.push("/loja")}>
        <Text>Ir para a loja</Text>
      </Pressable>
      <Pressable style={s.danger} onPress={logout}>
        <Text style={s.dangerText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#f4f6f8", gap: 8 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 13, color: "#666", marginTop: 8 },
  value: { fontWeight: "600" },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
  },
  button: {
    backgroundColor: "#0A2E5D",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "700" },
  section: { fontSize: 21, fontWeight: "700", marginTop: 22 },
  quote: { backgroundColor: "white", padding: 14, borderRadius: 10, marginTop: 8 },
  quoteStatus: { fontWeight: "700", marginBottom: 5 },
  date: { color: "#777", marginTop: 8 },
  link: { padding: 14, alignItems: "center" },
  danger: { padding: 14, alignItems: "center" },
  dangerText: { color: "#b00020", fontWeight: "700" },
});
