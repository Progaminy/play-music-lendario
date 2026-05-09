# Música Lendária - Plano Completo do Projeto

## 📋 Visão Geral
**Música Lendária** é uma plataforma web de streaming de música com foco em artistas independentes. O projeto oferece autenticação de usuários, reprodução de música com limite de preview, sistema de favoritos, filtros avançados, modo offline e suporte ao usuário.

---

## 🎯 Funcionalidades Principais

### 1. **Autenticação & Registo** (auth.js)
- ✅ Registo de novos usuários
- ✅ Login com validação
- ✅ Armazenamento seguro em localStorage
- ✅ Proteção de rotas privadas

### 2. **Player de Música** (player.js)
- ✅ Reprodução com limite de 30 segundos
- ✅ Controles de play/pause
- ✅ Barra de progresso
- ✅ Volume ajustável
- ✅ Exibição de metadados (artista, título)

### 3. **Gestão de Favoritos** (favoritos.js)
- ✅ Adicionar/remover favoritos
- ✅ Persistência em localStorage
- ✅ Página dedicada de favoritos
- ✅ Ícone visual de favorito

### 4. **Sistema de Filtros** (filtros.js)
- ✅ Filtrar por gênero
- ✅ Filtrar por artista
- ✅ Filtrar por ano de lançamento
- ✅ Busca por texto

### 5. **Tema Claro/Escuro** (tema.js)
- ✅ Alternância de tema lit/dark
- ✅ Persistência de preferência
- ✅ Aplicação em tempo real

### 6. **Modo Offline** (offline.js)
- ✅ Download de músicas para offline
- ✅ Armazenamento em IndexedDB
- ✅ Sincronização quando retorna online

### 7. **Gestão de Eventos** (eventos.js)
- ✅ Criar novos eventos
- ✅ Listar eventos por data
- ✅ Filtrar por tipo de evento
- ✅ Paginação

### 8. **Postagens** (postagem.js)
- ✅ Enviar nova música para aprovação
- ✅ Upload de capa
- ✅ Descrição e metadados
- ✅ Sistema de aprovação

### 9. **Suporte** (suporte.js)
- ✅ Integração com WhatsApp
- ✅ Integração com Telegram
- ✅ Contato via telefone/SMS
- ✅ Links de contato diretos

---

## 📁 Estrutura de Pastas

```
musica-alendaria/
│
├── index.html                      # Página inicial (após login)
├── login.html                      # Página de login/registo
├── artista.html                    # Perfil do artista
├── musica.html                     # Página individual da música
├── perfil.html                     # Perfil do usuário
├── favoritos.html                  # Favoritos do usuário
├── eventos.html                    # Eventos
├── postar.html                     # Nova postagem
├── definicoes.html                 # Definições (tema, notificações)
├── suporte.html                    # Página de suporte
│
├── css/
│   ├── style.css                   # Estilos globais e variáveis CSS
│   ├── mobile.css                  # Estilos mobile first (responsivo)
│   ├── desktop.css                 # Estilos para desktop
│   ├── dark.css                    # Tema dark
│   ├── lit.css                     # Tema lit (claro)
│   ├── player.css                  # Estilo do player de música
│   ├── modal.css                   # Estilo de modais
│   ├── animacoes.css              # Animações CSS
│   └── componentes.css            # Cards, botões, filtros
│
├── js/
│   ├── app.js                      # Inicialização e configuração geral
│   ├── tema.js                     # Alternância lit/dark
│   ├── auth.js                     # Registo e login
│   ├── player.js                   # Player com limite 30s
│   ├── modal.js                    # Modal anti-navegação
│   ├── favoritos.js               # Gestão de favoritos
│   ├── filtros.js                  # Sistema de filtros
│   ├── eventos.js                  # Criação e exibição de eventos
│   ├── postagem.js                # Envio para aprovação
│   ├── suporte.js                  # Links de suporte
│   ├── offline.js                  # Download e modo offline
│   └── dados.js                    # Dados mockados (3 artistas)
│
├── assets/
│   ├── imagens/
│   │   ├── logo-lit.svg            # Logo modo claro
│   │   ├── logo-dark.svg           # Logo modo escuro
│   │   ├── marca-dagua.svg         # Marca d'água
│   │   ├── placeholder.svg         # Imagem placeholder
│   │   ├── avatar-padrao.svg       # Avatar padrão
│   │   ├── artista1/               # Fotos artista 1
│   │   │   ├── foto-perfil.svg
│   │   │   ├── album-1.svg
│   │   │   └── musica2.svg
│   │   ├── artista2/               # Fotos artista 2
│   │   │   ├── foto-perfil.svg
│   │   │   ├── album-1.svg
│   │   │   ├── musica1.svg
│   │   │   ├── musica2.svg
│   │   │   ├── musica3.svg
│   │   │   └── album-2.svg
│   │   └── artista3/               # Fotos artista 3
│   │       ├── foto-perfil.svg
│   │       ├── album-1.svg
│   │       ├── musica1.svg
│   │       ├── musica2.svg
│   │       ├── musica3.svg
│   │       └── album-2.svg
│   ├── icones/
│   │   ├── whatsapp.svg            # Ícone WhatsApp
│   │   ├── telegram.svg            # Ícone Telegram
│   │   ├── telefone.svg            # Ícone Telefone
│   │   └── sms.svg                 # Ícone SMS
│   └── musicas/
│       ├── previews/               # Previews 30s MP3
│       │   ├── musica-1.mp3
│       │   ├── musica-2.mp3
│       │   └── musica-3.mp3
│       └── offline/                # Conteúdo offline cache
│
├── docs/
│   └── plano-completo.md           # Este arquivo
│
└── sw.js                           # Service Worker para PWA
```

---

## 🎨 Tema de Cores

### Modo Claro (lit.css)
- Fundo: #FFFFFF (branco)
- Texto primário: #212121 (preto)
- Acento: #6C3CE0 (roxo)
- Secundário: #E8F0FE (azul claro)

### Modo Escuro (dark.css)
- Fundo: #121212 (preto)
- Texto primário: #FFFFFF (branco)
- Acento: #BB86FC (roxo claro)
- Secundário: #1F1F1F (cinza escuro)

---

## 📊 Dados Mockados (dados.js)

### Artistas (3)
1. **Artista 1** - Gênero: Pop | Seguidores: 150K
2. **Artista 2** - Gênero: Rock | Seguidores: 200K
3. **Artista 3** - Gênero: Hip-Hop | Seguidores: 180K

### Música por Artista (3)
- Cada artista tem 3 músicas
- Total: 9 músicas

### Eventos
- Lista de eventos mockados para teste

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Armazenamento**: localStorage, IndexedDB
- **APIs**: Web Audio API, Service Worker API
- **Responsividade**: Mobile First

---

## 📱 Responsividade

- **Mobile**: < 768px (mobile.css)
- **Tablet**: 768px - 1024px (adaptativos)
- **Desktop**: > 1024px (desktop.css)

---

## 🔐 Segurança

- Validação de entrada em formulários
- Armazenamento seguro de tokens
- Proteção contra XSS em conteúdo dinâmico
- Service Worker com cache estratégico

---

## 🚀 Próximas Melhorias

- [ ] Backend real (Node.js/Python)
- [ ] Autenticação JWT
- [ ] Upload de fotos reais
- [ ] Streaming de áudio em tempo real
- [ ] Recomendações personalizadas
- [ ] Feed social
- [ ] Sistema de comentários
- [ ] Integração com redes sociais

---

## 📝 Notas Importantes

1. **Imagens**: Atualmente em SVG para testes. Substituir por fotos reais quando disponível.
2. **Áudio**: Adicionar arquivos MP3 em `/assets/musicas/previews/`
3. **Service Worker**: Implementar caching estratégico para PWA
4. **Offline**: Implementar IndexedDB para sincronização

---

## 👨‍💻 Desenvolvedor

**Criado por**: Pensador Sem Fronteira  
**Projeto**: Música Lendária - Do Zero ao Infinito  
**Data**: Maio 2026

---

## 📄 Licença

Propriedade exclusiva do desenvolvedor. Todos os direitos reservados.
