# Clube WPI3D Mobile

Aplicativo móvel do Clube WPI3D para Android e iOS.

## Arquitetura
- Expo + React Native + TypeScript
- expo-router
- Supabase Auth/Database/Storage
- Sessão persistente em Secure Store
- Catálogo, carrinho e orçamento no canal móvel do cliente

O app é mantido neste repositório separado do site `Renato1909/clube-wpi3d`.

## Configuração
Copie `.env.example` para `.env` e configure `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Nunca coloque uma chave `service_role` no aplicativo.

## Executar
```bash
npm install
npx expo start
```
