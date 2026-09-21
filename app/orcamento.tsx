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
      const quoteDescription = buildQuoteDescription(description, items);

      const { data, error } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          description: quoteDescription,
          status: "recebido",
        })
        .select("id")
        .single();

      if (error) throw error;

      quoteId = data.id;

      for (const file of files) {
        if (!file.uri || !file.name) {
          throw new Error("Arquivo selecionado sem URI ou nome.");
        }

        const path = buildQuoteFilePath(user.id, data.id, file.name);

        const response = await fetch(file.uri);
        if (!response.ok) {
          throw new Error(`Falha ao ler o arquivo local: ${file.name}`);
        }

        const body = await response.arrayBuffer();

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
          file_path: path,
          file_name: file.name,
          user_id: user.id,
        });

        if (saved.error) throw saved.error;
      }

      Alert.alert("Orçamento enviado", "Sua solicitação foi registrada.");
      setDescription("");
      setFiles([]);
      clear();
    } catch {
      if (quoteId !== null) {
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
