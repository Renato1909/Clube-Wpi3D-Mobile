import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Clube WPI3D" }} />
          <Stack.Screen name="login" options={{ title: "Entrar" }} />
          <Stack.Screen name="cadastro" options={{ title: "Criar conta" }} />
          <Stack.Screen name="recuperar-senha" options={{ title: "Recuperar senha" }} />
          <Stack.Screen name="loja/index" options={{ title: "Loja" }} />
          <Stack.Screen name="loja/[slug]" options={{ title: "Produto" }} />
          <Stack.Screen name="carrinho" options={{ title: "Carrinho" }} />
          <Stack.Screen name="minha-conta" options={{ title: "Minha conta" }} />
          <Stack.Screen name="orcamento" options={{ title: "Orçamento" }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
