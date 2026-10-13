# Plano de lançamento do aplicativo Android

> Documento de referência para a publicação do **Clube WPI 3D Mobile**. Lista o que falta até a loja, em ordem executável, marcando o que depende do proprietário do projeto.
>
> **Estado atual:** PRs #9 (backend) e #26 (app) já mergeados. Backend com proteção de UPDATE em orçamentos e webhook autenticado já está em produção no Supabase. CI verde na `main` (build, lint, testes JVM e instrumentados API 24/36).
>
> **Pendente:** build de preview, teste em aparelho físico com push real, AAB de produção e publicação no Google Play.

---

## Trilha de publicação

### 1. Vínculo do projeto EAS (una vez, no computador)

```text
npx eas-cli@latest login
npx eas-cli@latest init
```

- `eas init` cria o projeto no expo.dev e gera o `projectId`, usado também pelas notificações push.
- `EXPO_PUBLIC_EAS_PROJECT_ID` é opcional depois do vínculo; o build remoto resolve o ID da configuração embutida.

### 2. Variáveis de ambiente nos ambientes `preview` e `production`

No painel do projeto em [expo.dev](https://expo.dev), cadastre:

- `EXPO_PUBLIC_SUPABASE_URL` — URL pública do Supabase.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — chave pública (anon) do Supabase.

Se for usar imagens do site wpi3d.com.br, cadastre também `EXPO_PUBLIC_SITE_URL` com a URL HTTPS pública.

> ⚠️ **Nunca** cadastre `service_role`, `sb_secret_...` ou qualquer credencial administrativa no app. Essas variáveis ficam expostas no cliente.

### 3. Build de preview (APK interno)

```text
npx eas-cli@latest build --platform android --profile preview
```

- Perfil `preview`: distribuição interna, APK instalável diretamente no Android.
- Este é o build de validação do beta: login, cadastro, orçamento e push.

### 4. Teste em aparelho físico (obrigatório antes da loja)

Entrar como administrador e como cliente em aparelhos distintos e validar:

- Login, cadastro, recuperação de senha e abertura do link com o app fechado.
- Catálogo com dados reais do Supabase e estados de erro/vazio corretos.
- Carrinho persistido entre fechamento e reabertura do app.
- Orçamento enviado e notificação push recebida com abertura do pedido correto.

### 5. Build de produção (AAB)

```text
npx eas-cli@latest build --platform android --profile production
```

- Perfil `production` gera o artefato de loja (AAB por padrão), com autoIncrement de versão remota.

### 6. Google Play

- Conta Google Play Console: taxa única de US$ 25.
- **Regra atual do Google para contas pessoais:** antes da primeira publicação em produção, é obrigatório executar um teste fechado com 12 testadores por 14 dias. Comece isso assim que o APK de preview for validado.
- Ficha da loja: título, descrição, screenshots, política de privacidade pública, questionário de segurança de dados e classificação etária.
- O envio pode ser feito manualmente no console; depois do primeiro envio, é possível automatizar com `eas submit`.

---

## Pendências já resolvidas (para registro)

- Proteção de UPDATE em orçamentos e webhook autenticado (Renato1909/clube-wpi3d#9) — em produção.
- Sessão, catálogo, carrinho e autenticação (Clube-Wpi3D-Mobile#26) — mergeados.
- Segredos: nenhum credencial administrativo exposto no app.

## Fora do escopo desta fase

- iOS/App Store: exige conta Apple Developer de US$ 99/ano; o `bundleIdentifier br.com.clubewpi3d.mobile` já está pronto quando isso virar prioridade.

---

**Última revisão:** 13 de outubro de 2026, após a fusão dos PRs #9 e #26.
