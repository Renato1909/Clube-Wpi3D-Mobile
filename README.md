# Clube WPI3D Mobile

Aplicativo móvel do Clube WPI3D para Android e iOS.

## Arquitetura

- Expo SDK 54 + React Native + TypeScript
- expo-router
- Supabase Auth/Database/Storage
- Sessão persistente em Secure Store
- Catálogo, carrinho e orçamento no canal móvel do cliente
- Push notifications via Expo + Supabase

O app é mantido neste repositório separado do site `Renato1909/clube-wpi3d`.

## Configuração

Copie `.env.example` para `.env` e configure:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

`EXPO_PUBLIC_EAS_PROJECT_ID` é opcional depois que o projeto EAS estiver vinculado. O app também consegue obter o `projectId` da configuração EAS embutida no build.

Nunca coloque uma chave `service_role` ou `sb_secret_...` no aplicativo.

## Executar

```bash
npm install
npx expo start
```

## Primeiro build Android para teste

Inicialize/vincule o projeto EAS uma única vez:

```bash
npx eas init
```

Depois gere o APK de teste interno:

```bash
npm run build:android:preview
```

O perfil `preview` usa distribuição interna e gera um APK instalável diretamente no Android. Esse é o build indicado para validar login, cadastro, orçamento e push antes da loja.

## Build Android de produção

```bash
npm run build:android:production
```

O perfil `production` gera o artefato de loja (AAB por padrão).

## Push notifications

O administrador deve instalar o build real em um aparelho físico, entrar com uma conta cujo `profiles.role` seja `admin` e aceitar notificações.

Depois disso, o token é registrado em `push_tokens`.

Eventos administrativos:

- novo cadastro → `Novo cliente cadastrado`
- novo pedido → `Novo pedido #ID`

Eventos de pedido para o cliente:

- recebido
- em análise
- aguardando cliente
- aprovado
- recusado
- concluído

A infraestrutura do backend está no repositório web, em `supabase/functions` e `supabase/*.sql`.

## CI

A verificação automática executa TypeScript e Jest no GitHub Actions.
