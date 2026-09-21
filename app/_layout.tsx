import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { getNotificationRoute } from "../lib/notification-routing";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function NotificationObserver() {
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    const handledNotificationIds = new Set<string>();

    function redirect(response: Notifications.NotificationResponse) {
      if (
        response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
      ) {
        return;
      }

      const notificationId = response.notification.request.identifier;
      if (handledNotificationIds.has(notificationId)) return;
      handledNotificationIds.add(notificationId);

      const route = getNotificationRoute(
        response.notification.request.content.data,
      );
      if (route) router.push(route);
    }

    let mounted = true;

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!mounted || !response) return;
      redirect(response);
      void Notifications.clearLastNotificationResponseAsync();
    });

    const subscription =
      Notifications.addNotificationResponseReceivedListener(redirect);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [loading, user?.id]);

  return null;
}

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationObserver />
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
