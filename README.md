# 🚌🇬🇧 JhonX London - Phonics Challenge

> Uma aventura lúdica de alfabetização e fonética em **Inglês Britânico (UK English)** com reconhecimento de voz em tempo real e **Coach de Fonética com IA (Gemini)**.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 🌟 Visão Geral

O **JhonX London Phonics Challenge** transforma o aprendizado de leitura e pronúncia da língua inglesa em uma jornada emocionante a bordo do famoso **Double-Decker Bus vermelho de Londres**. 

Projetado especialmente para crianças de 4 a 9 anos, o aplicativo utiliza metodologia de fonética sintética (Jolly Phonics / British National Curriculum), combinando reconhecimento de fala ao vivo pelo microfone com diagnósticos pedagógicos carinhosos gerados por Inteligência Artificial.

---

## ✨ Principais Funcionalidades

### 1. 🔤 Arenas de Aprendizagem
- **Arena de Fonética (Palavras):** Blocos de letras gigantes (72px) com áudio de pronúncia britânica nativa de cada fonema e paradas temáticas por Londres (Big Ben, Camden Town, Tower Bridge).
- **Arena de Pequenas Frases:** Leitura guiada de orações cotidianas em inglês britânico com destaque visual estilo *karaokê*.
- **Arena de Pequenas Histórias:** Contos curtos ilustrados sobre a vida londrina, acompanhados de narração completa e quiz interativo de compreensão leitora.

### 2. 🤖 Coach de Fonética com IA (Google Gemini)
- **Feedback Carinhoso e Imediato:** Quando a criança acerta, recebe celebrações animadas e avança na rota do ônibus.
- **Dicas Anatômicas da Boca:** Se houver um deslize em um som (ex: falar som de `/ɒ/` em vez de `/æ/`), o coach explica amigavelmente como posicionar os lábios e a língua para acertar na próxima tentativa.
- **Normalização Inteligente de Fala:** O motor fonético reconhece sotaques, variações fonéticas e apelidos de letras sem penalizar pontuações ou pequenos ruídos.

### 3. 🎯 Progressão Adaptativa de Dificuldade
- O sistema monitora a precisão e o número de acertos consecutivos.
- Ao acertar **5 palavras consecutivas**, a dificuldade sobe automaticamente de nível e o Gemini gera novas sequências temáticas personalizadas sem repetições cansativas.

### 4. 🏆 Gamificação & Álbum de Figurinhas
- Cada acerto premia a criança com **Estrelas de Explorador**.
- As estrelas podem ser trocadas no **Sticker Album** para desbloquear figurinhas colecionáveis de mascotes londrinos (Pombo de boina, Guarda Real, Raposa do Canal).

### 5. 🔒 Painel dos Pais & Privacidade em Primeiro Lugar
- **Segurança infantil total:** Nenhuma gravação de áudio da criança é salva em disco ou enviada para servidores externos desnecessariamente. A análise de fala é processada efemeramente em memória.
- **Parent Dashboard:** Gráficos de domínio fonético por grupo de letras (SATPIN, CKEHRMD) e histórico recente de leitura.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Canvas Confetti](https://github.com/catdad/canvas-confetti).
- **Backend / API:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx).
- **Inteligência Artificial:** [@google/genai SDK](https://www.npmjs.com/package/@google/genai) com modelo `gemini-3.8-flash`.
- **Áudio & Fala:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) configurado para o dialeto `en-GB` com Web Audio API sintetizado para efeitos sonoros táteis.
- **Armazenamento:** Camada de persistência resiliente com proteção para sandboxes/iFrames.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior instalado.
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/).
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/) (opcional para o motor com Gemini; o app possui motor local com regras fonéticas completas de fallback).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/cleytonpml-creator/JhonX.git
   cd JhonX
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo de exemplo e insira sua chave da API do Gemini (caso queira o modo de IA generativa online):
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env`:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   PORT=3000
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no seu navegador:**
   Abra [http://localhost:3000](http://localhost:3000) e divirta-se!

---

## 📁 Estrutura do Projeto

```text
├── index.html                   # Ponto de entrada HTML com metadados SEO
├── metadata.json                # Configuração e permissões do applet
├── package.json                 # Dependências e scripts de build
├── server.ts                    # Servidor Express com endpoints do Coach IA Gemini
├── src/
│   ├── main.tsx                 # Inicialização do React com ErrorBoundary global
│   ├── App.tsx                  # Componente raiz, controle de abas e estado de estrelas
│   ├── index.css                # Estilos globais e importação do Tailwind
│   ├── components/
│   │   ├── kids/
│   │   │   ├── KidsHeader.tsx           # Cabeçalho alegre com rota e contador de estrelas
│   │   │   ├── KidsPhonicsArena.tsx     # Arena de pronúncia de palavras e rota do ônibus
│   │   │   ├── KidsSentencesArena.tsx   # Leitura de frases curtas
│   │   │   ├── KidsStoriesArena.tsx     # Histórias ilustradas e quiz
│   │   │   ├── KidsAiCoachModal.tsx     # Modal com dicas fonéticas e diagnóstico
│   │   │   ├── KidsLevelUpModal.tsx     # Celebração de 5 acertos seguidos
│   │   │   ├── KidsStickerBook.tsx      # Álbum de figurinhas londrinas colecionáveis
│   │   │   ├── KidsStationTicket.tsx    # Seleção de linhas e estações do metrô
│   │   │   └── KidsParentModal.tsx      # Painel de controle e progresso para os pais
│   │   └── studio/                      # Ferramentas de inspeção e código Flutter/Dart
│   └── utils/
│       ├── aiCoach.ts           # Cliente para comunicação com a API do Coach IA
│       ├── audio.ts             # Síntese de voz britânica e efeitos sonoros
│       ├── database.ts          # Persistência com fallback seguro para iFrames
│       ├── flutterCode.ts       # Exportação e empacotamento do projeto
│       └── phonicsLevels.ts     # Fases, palavras por nível e gerador adaptativo
└── tsconfig.json                # Configurações do compilador TypeScript
```

---

## 🇬🇧 Padrão Fonético (UK English)

O projeto segue estritamente a convenção do **Received Pronunciation (RP) / Standard Southern British English**:
- **Fonemas Curtos:** `/æ/` (c**a**t), `/e/` (b**e**d), `/ɪ/` (p**i**n), `/ɒ/` (h**o**t), `/ʌ/` (b**u**s).
- **Dígrafos e Encontros:** `ch`, `sh`, `th`, `ck`.
- **Vocabulário Britânico:** *bus*, *tea*, *guard*, *river*, *biscuit*, *flat*, *pavement*.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e aprendizado de inglês para crianças. Sinta-se livre para utilizar, adaptar e expandir!
