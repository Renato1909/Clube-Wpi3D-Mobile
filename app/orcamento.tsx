import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { buildQuoteDescription } from "../lib/quote-description";
import {
  buildQuoteFilePath,
  rollbackQuoteSubmission,
} from "../lib/quote-submission";

const MAX_FILES = 5;
const MAX_BYTES = 20 * 1024 * 1024;

export default function Orcamento() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [sending, setSending] = useState(false);

  async function pick() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [
        "model/stl",
        "model/3mf",
        "model/obj",
        "image/*",
        "application/pdf",
        "video/*",
      ],
    });

    if (result.canceled) return;

    const selected = result.assets.filter(
      (asset) => (asset.size ?? 0) <= MAX_BYTES,
    );

    setFiles(selected.slice(0, MAX_FILES));

    if (
      selected.length > MAX_FILES ||
      selected.length !== result.assets.length
    ) {
      Alert.alert("Arquivos", "Até 5 arquivos de até 20 MB cada.");
    }
  }

  async function submit() {
    if (!user) {
      Alert.alert(
        "Login necessário",
        "Entre na sua conta para solicitar um orçamento.",
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert("Descrição", "Informe o que você deseja produzir.");
      return;
    }

    setSending(true);

    let quoteId: number | null = null;
    const uploadedPaths: string[] = [];

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,phone")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const fullName = String(profile?.full_name ?? "").trim();
      const email = String(user.email ?? "").trim();
      const phone = String(profile?.phone ?? "").trim();

      if (fullName.length < 2 || fullName.length > 120 || !phone) {
        throw new Error("profile_incomplete");
      }

      if (phone.length < 10 || phone.length > 25) {
        throw new Error("profile_phone_invalid");
      }

      if (!email || email.length > 254) {
        throw new Error("account_email_invalid");
      }

      const quoteDescription = buildQuoteDescription(description, items);
      const quantity = Math.max(
        1,
        items.reduce((total, item) => total + item.quantity, 0),
      );

      const { data, error } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          description: quoteDescription,
          quantity,
          material: "recomendacao",
          status: "recebido",
        })
        .select("id")
        .single();

      if (error) throw error;

      quoteId = data.id;

      for (const [index, file] of files.entries()) {
        if (!file.uri || !file.name) {
          throw new Error("Arquivo selecionado sem URI ou nome.");
        }

        const path = buildQuoteFilePath(user.id, data.id, file.name, index);

        const response = await fetch(file.uri);
        if (!response.ok) {
          throw new Error(`Falha ao ler o arquivo local: ${file.name}`);
        }

        const body = await response.arrayBuffer();

        if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
          throw new Error(`Arquivo fora do limite: ${file.name}`);
        }

        const upload = await supabase.storage
          .from("quote-files")
          .upload(path, body, {
            contentType: file.mimeType ?? "application/octet-stream",
            upsert: false,
          });

        if (upload.error) throw upload.error;

        uploadedPaths.push(path);

        const saved = await supabase.from("quote_files").insert({
          quote_id: data.id,
          user_id: user.id,
          storage_path: path,
          original_name: file.name,
          mime_type: file.mimeType ?? null,
          size_bytes: body.byteLength,
        });

        if (saved.error) throw saved.error;
      }

      Alert.alert("Orçamento enviado", "Sua solicitação foi registrada.");
      setDescription("");
      setFiles([]);
      clear();
    } catch (error) {
      if (error instanceof Error && error.message === "profile_incomplete") {
        Alert.alert(
          "Perfil incompleto",
          "Preencha seu nome e telefone em Minha conta antes de solicitar um orçamento.",
        );
      } else if (
        error instanceof Error &&
        error.message === "profile_phone_invalid"
      ) {
        Alert.alert(
          "Telefone inválido",
          "Atualize seu telefone em Minha conta antes de enviar o orçamento.",
        );
      } else if (
        error instanceof Error &&
        error.message === "account_email_invalid"
      ) {
        Alert.alert(
          "E-mail inválido",
          "Sua conta precisa ter um e-mail válido para solicitar um orçamento.",
        );
      } else if (quoteId !== null) {
        const rollback = await rollbackQuoteSubmission(
          supabase,
          user.id,
          quoteId,
          uploadedPaths,
        );

        if (!rollback.ok) {
          Alert.alert(
            "Erro no envio",
            "Não foi possível concluir o orçamento e a limpeza automática também falhou. Verifique sua conta antes de tentar novamente.",
          );
        } else {
          Alert.alert(
            "Erro no envio",
            "Não foi possível enviar o orçamento. Nenhuma solicitação incompleta foi mantida.",
          );
        }
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível enviar o orçamento. Tente novamente.",
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={s.page}>
      <Text style={s.title}>Solicitar orçamento</Text>

      {items.length > 0 && (
        <View style={s.cartBox}>
          <Text style={s.section}>Itens do carrinho</Text>
          {items.map((item) => (
            <Text key={item.slug}>
              {item.quantity}x {item.title}
            </Text>
          ))}
        </View>
      )}

      <TextInput
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva sua peça, medidas e referências"
        style={s.input}
      />

      <Text style={s.info}>{files.length} arquivo(s) selecionado(s)</Text>

      <Pressable style={s.secondary} onPress={pick} disabled={sending}>
        <Text>Selecionar arquivos</Text>
      </Pressable>

      <Pressable disabled={sending} style={s.button} onPress={submit}>
        <Text style={s.buttonText}>
          {sending ? "Enviando…" : "Enviar orçamento"}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  cartBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  input: {
    minHeight: 160,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
  },
  info: { marginVertical: 12, color: "#555" },
  secondary: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  button: {
    marginTop: 14,
    backgroundColor: "#0A2E5D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
});
