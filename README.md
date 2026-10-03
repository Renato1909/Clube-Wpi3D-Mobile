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
- `EXPO_PUBLIC_SITE_URL`: URL HTTPS pública do site para imagens legadas em `/produtos/...`; opcional para as três fotos originais incluídas no app.

`EXPO_PUBLIC_EAS_PROJECT_ID` é opcional depois que o projeto EAS estiver vinculado. O app também consegue obter o `projectId` da configuração EAS embutida no build.

Nunca coloque uma chave `service_role` ou `sb_secret_...` no aplicativo.

## Executar

```bash
npm ci
npx expo start
```

## Primeiro build Android para teste

Inicialize/vincule o projeto EAS uma única vez:

```bash
npx eas-cli@latest init
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

## Catálogo e imagens

O catálogo agora mostra erro de conexão ou estado vazio, sem substituir produtos reais por itens de demonstração.

Use URLs HTTPS públicas em `products.image_path` ou caminhos de objetos no bucket público `product-images`, por exemplo `pecas/produto-01.jpeg`. As três fotos originais do site estão incluídas no app para os caminhos `/produtos/produto-01.jpeg`, `produto-02.jpeg` e `produto-03.jpeg`, sem depender do GitHub privado. Isso não cria produtos fictícios: o catálogo continua vindo do banco.

Para outras entradas legadas em `/produtos/...`, configure a URL pública do site em `EXPO_PUBLIC_SITE_URL`. Quando configurada, essa URL também substitui as fotos incluídas. Imagens de um repositório GitHub privado não servem como CDN pública.

## Verificação antes do APK

```sh
npm run typecheck
npm test
npx expo-doctor
```

Os scripts de build exigem o EAS CLI disponível como `eas`. Como alternativa sem instalação global, execute `npx eas-cli@latest build --platform android --profile preview`.

O backend correspondente está no repositório web: aplicar a proteção de UPDATE de orçamento e publicar a função de webhook corrigida antes de validar status e notificações em produção.

