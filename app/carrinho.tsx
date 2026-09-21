import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/products";

export default function Carrinho() {
  const { items, remove, setQuantity, totalCents } = useCart();

  return (
    <View style={s.page}>
      <Text style={s.title}>Carrinho</Text>
      {items.length === 0 ? (
        <Text>Seu carrinho está vazio.</Text>
      ) : (
        items.map((item) => (
          <View key={item.slug} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.title}</Text>
              <Text>{formatPrice(item.priceCents)}</Text>
            </View>
            <View style={s.controls}>
              <Pressable onPress={() => setQuantity(item.slug, item.quantity - 1)}>
                <Text style={s.control}>−</Text>
              </Pressable>
              <Text>{item.quantity}</Text>
              <Pressable onPress={() => setQuantity(item.slug, item.quantity + 1)}>
                <Text style={s.control}>+</Text>
              </Pressable>
              <Pressable onPress={() => remove(item.slug)}>
                <Text style={s.remove}>Remover</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      {items.length > 0 && (
        <>
          <Text style={s.total}>
            Total: {totalCents === null ? "A definir" : formatPrice(totalCents)}
          </Text>
          <Pressable
            style={s.button}
            onPress={() => router.push("/orcamento")}
          >
            <Text style={s.buttonText}>Solicitar orçamento</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  row: { backgroundColor: "white", padding: 14, borderRadius: 12, marginBottom: 10 },
  name: { fontWeight: "700" },
  controls: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 },
  control: { fontSize: 22, fontWeight: "700" },
  remove: { color: "#b00020" },
  total: { fontSize: 20, fontWeight: "700", marginTop: 10 },
  button: {
    marginTop: 20,
    backgroundColor: "#0A2E5D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
});
