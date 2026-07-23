# FinControle — app de controle financeiro pessoal

App instalável no Android (PWA), 100% offline, com dados guardados apenas no
seu celular. Controla entradas, saídas, contas, lembretes e fluxo de caixa.
Disponível em Português (Brasil), Espanhol e Inglês, com 4 temas de cores.

## Como publicar (usando sua conta do GitHub) — leva uns 5 minutos

1. Acesse **github.com** e clique em **New repository** (Novo repositório).
   - Nome sugerido: `fincontrole`
   - Marque como **Public** (precisa ser público para o GitHub Pages gratuito funcionar)
   - Clique em **Create repository**

2. Na página do repositório recém-criado, clique em **uploading an existing file**
   (ou "Add file" → "Upload files").

3. Arraste **todos os arquivos desta pasta** (`index.html`, `styles.css`, `app.js`,
   `manifest.json`, `service-worker.js` e a pasta `icons` inteira) para a área de
   upload. Confirme o envio ("Commit changes").

4. Vá em **Settings** (Configurações) do repositório → **Pages** (no menu à esquerda).
   - Em "Source", escolha a branch **main** e a pasta **/ (root)**.
   - Clique em **Save**.

5. Espere cerca de 1 minuto. O GitHub vai mostrar um link parecido com:
   `https://SEU-USUARIO.github.io/fincontrole/`

6. **Esse é o link que você vai mandar para as outras pessoas — mas use a versão com
   `/instalar.html` no final**, assim:
   `https://SEU-USUARIO.github.io/fincontrole/instalar.html`

   Essa página explica pra quem recebe o link como abrir e instalar o app no
   celular, com passo a passo. O botão dela leva direto para o app.

7. Para testar você mesmo: abra esse link **no celular Android, pelo Google
   Chrome**. Depois de alguns segundos, o Chrome vai mostrar um aviso/banner
   "Adicionar à tela inicial" ou "Instalar app" — toque nele. Se não aparecer
   sozinho, toque nos **3 pontinhos** do Chrome (canto superior direito) →
   **"Adicionar à tela inicial"** ou **"Instalar app"**.

8. Pronto! Vai aparecer um ícone do FinControle na tela inicial, igual a um
   aplicativo normal — abre em tela cheia, sem barra de endereço.

> Se preferir, qualquer outro serviço gratuito de hospedagem de site estático
> (Netlify, Vercel, Cloudflare Pages) também funciona: é só enviar esses mesmos
> arquivos.

## Sobre atualizações futuras

Sempre que eu (ou você) mudar algo no app, é só enviar os arquivos atualizados
para o mesmo repositório do GitHub (substituindo os antigos) — o link continua
o mesmo para todo mundo que já instalou.

**O app busca a versão mais nova sozinho, toda vez que é aberto com internet** —
não precisa esperar nenhum prazo fixo nem pedir para as pessoas reinstalarem
nada. Se estiver sem internet no momento, ele continua funcionando normalmente
com a última versão que já tinha baixado.

**Os dados nunca são apagados ou alterados por uma atualização.** As
informações que cada pessoa cadastra (contas, entradas, saídas) ficam guardadas
num compartimento separado do celular dela, que as atualizações do app nunca
tocam — só os arquivos de visual/funcionamento são trocados.

## Importante sobre os dados

- Os dados ficam salvos **somente neste celular**, no navegador. Não há nuvem
  nem sincronização entre aparelhos.
- Use **Ajustes → Exportar backup** de vez em quando (por exemplo, uma vez por
  mês) para salvar um arquivo de segurança. Esse arquivo é a única forma de
  recuperar os dados se o celular for trocado, formatado, ou se o navegador
  limpar os dados.
- Para restaurar, use **Ajustes → Importar backup** e escolha o arquivo salvo.

## Sobre os lembretes

O app avisa sempre que é aberto, mostrando os lançamentos pendentes do dia.
Também é possível ativar notificações do navegador em **Ajustes → Ativar
lembretes por notificação**. Vale lembrar: navegadores Android limitam
notificações agendadas quando o app fica fechado por muitos dias — funciona
melhor se o app for aberto ao menos uma vez por dia (por exemplo, sempre pela
manhã).

## Estrutura dos arquivos

```
index.html          → estrutura do app
instalar.html        → página para compartilhar com outras pessoas (explica como instalar)
styles.css           → visual, temas de cores, tamanhos de fonte
app.js               → toda a lógica (contas, lançamentos, recorrência, etc.)
manifest.json        → configuração do PWA (nome, ícone, cores)
service-worker.js     → permite o app funcionar offline
icons/                → ícones do app
```
