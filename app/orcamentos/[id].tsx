import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

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

type QuoteFile = {
  id: number;
  file_name: string;
  file_path: string;
  signed_url: string | null;
};

function parseQuoteId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return null;

  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default function QuoteDetails() {
  const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
  const { user, loading: authLoading } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [files, setFiles] = useState<QuoteFile[]>([]);
  const [loading, setLoading] = useState(true);

  const quoteId = parseQuoteId(rawId);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentUser = user;

    if (quoteId === null) {
      setQuote(null);
      setFiles([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("id,description,status,created_at")
        .eq("id", quoteId)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (quoteError) {
        if (active) {
          setQuote(null);
          setFiles([]);
          setLoading(false);
        }
        return;
      }

      if (!quoteData) {
        if (active) {
          setQuote(null);
          setFiles([]);
          setLoading(false);
        }
        return;
      }

      const { data: fileData, error: filesError } = await supabase
        .from("quote_files")
        .select("id,file_name,file_path")
        .eq("quote_id", quoteId)
        .eq("user_id", currentUser.id)
        .order("id");

      if (!active) return;

      if (filesError) {
        setQuote(quoteData as Quote);
        setFiles([]);
        setLoading(false);
        return;
      }

      const hydratedFiles = await Promise.all(
        ((fileData ?? []) as Omit<QuoteFile, "signed_url">[]).map(
          async (file) => {
            const { data } = await supabase.storage
              .from("quote-files")
              .createSignedUrl(file.file_path, 900);

            return {
              ...file,
              signed_url: data?.signedUrl ?? null,
            };
          },
        ),
      );

      if (!active) return;

      setQuote(quoteData as Quote);
      setFiles(hydratedFiles);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [authLoading, quoteId, user]);

  async function openFile(file: QuoteFile) {
    if (!file.signed_url) {
      Alert.alert("Arquivo", "Não foi possível gerar o link temporário.");
      return;
    }

    try {
      await Linking.openURL(file.signed_url);
    } catch {
      Alert.alert("Arquivo", "Não foi possível abrir o arquivo.");
    }
  }

  if (authLoading || loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator />
        <Text>Carregando orçamento…</Text>
      </View>
    );
  }

  if (!user) return null;

  if (!quote) {
    return (
      <View style={s.center}>
        <Text style={s.title}>Orçamento não encontrado.</Text>
        <Pressable style={s.button} onPress={() => router.replace("/minha-conta")}>
          <Text style={s.buttonText}>Voltar para minha conta</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Pressable onPress={() => router.back()}>
        <Text>← Voltar</Text>
      </Pressable>

      <Text style={s.title}>Orçamento #{quote.id}</Text>

      <View style={s.card}>
        <Text style={s.label}>Status</Text>
        <Text style={s.status}>{labels[quote.status] ?? quote.status}</Text>

        <Text style={s.label}>Enviado em</Text>
        <Text>{new Date(quote.created_at).toLocaleString("pt-BR")}</Text>

        <Text style={s.label}>Descrição</Text>
        <Text style={s.description}>{quote.description}</Text>
      </View>

      <Text style={s.section}>Arquivos anexados</Text>

      {files.length === 0 ? (
        <Text>Nenhum arquivo anexado.</Text>
      ) : (
        files.map((file) => (
          <View key={file.id} style={s.file}>
            <Text style={s.fileName}>{file.file_name}</Text>
            <Pressable
              style={s.secondary}
              onPress={() => openFile(file)}
              disabled={!file.signed_url}
            >
              <Text>{file.signed_url ? "Abrir arquivo" : "Indisponível"}</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#f4f6f8", gap: 10 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  label: { fontSize: 13, color: "#666", marginTop: 8 },
  status: { fontSize: 18, fontWeight: "700" },
  description: { lineHeight: 22 },
  section: { fontSize: 21, fontWeight: "700", marginTop: 18 },
  file: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  fileName: { fontWeight: "600" },
  secondary: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0A2E5D",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
});
