<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/logo_rpgcraft.png">
    <img width="320" alt="logo-rpgcraft" src="docs/assets/logo-rpgcraft-escuro.png">
  </picture>
</p>

<br>

# ⚔️ RPG.Craft | Seu Ateliê de Mundos de RPG

Um site para mestres organizarem seus mundos de RPG em um só lugar: personagens e relações, raças e criaturas, lore em Markdown, linha do tempo com calendário próprio, missões e notas. Dois mundos de demonstração abrem sem cadastro, no modo convidado (somente leitura). Esse é um projeto que, particularmente, tive bastante vontade de tirar do papel após meses de ideias e planejamento, pois une meu trabalho como desenvolvedor, e também um hobby pessoal. O RPG.Craft ainda está em desenvolvimento e futuramente novos recursos e features serão lançadas.

<br>

Acesse o site em: [RPG.Craft](https://rpg-craft-three.vercel.app/) (talvez seja necessário aguardar até 1 minuto para o Render acordar o servidor). Na tela de login, use o **modo convidado** para explorar os mundos de exemplo.

<br>

<p align="center">

<img width="70" height="70" alt="vs-code-svgrepo-com" src="https://github.com/user-attachments/assets/d7906bee-7540-4bff-935d-ef3ea886e5be" />
<img width="70" height="70" alt="PyCharm zonalogo com" src="https://github.com/user-attachments/assets/694a8f6b-1f46-486b-ae38-067394b9a934" />
<img width="70" height="70" alt="python-svgrepo" src="https://github.com/user-attachments/assets/2439d9a9-a6b7-49ea-bec0-4aeb9eb0608b" />
<img width="70" height="70" alt="react-svgrepo-com" src="https://github.com/user-attachments/assets/0b68a090-6fb3-4c0d-83f9-24ae039e6b03" />
<img width="70" height="70" alt="vite-svgrepo" src="https://github.com/user-attachments/assets/d01e574b-03ef-4067-bd41-d7d64d73f587" />
<img width="70" height="70" alt="nodejs-icon-logo-svgrepo-com" src="https://github.com/user-attachments/assets/e07e2103-9281-40d0-a7b3-a54b9d61081f" />
<img width="70" height="70" alt="typescript-official-svgrepo-com" src="https://github.com/user-attachments/assets/db85ab32-6811-45af-87a6-3d19d3b27591" />
<img width="70" height="70" alt="html-5-svgrepo-com" src="https://github.com/user-attachments/assets/61350760-93f0-4240-9cb6-f9e79d04774c" />
<img width="70" height="70" alt="css-3-svgrepo-com" src="https://github.com/user-attachments/assets/eca10606-61ea-40db-965f-991563f41871" />
<img width="70" height="70" alt="tailwind" src="https://github.com/user-attachments/assets/03e06416-020d-420c-a969-33fc6c65ade4" />

</p>

<p align="center">

<img width="190" height="70" alt="Django - zonalogo" src="https://github.com/user-attachments/assets/dc713fd5-2bf4-40be-9fc6-7fa1bae43a54" />
<img width="200" height="70" alt="Vercel-white" src="https://github.com/user-attachments/assets/227e13aa-c305-4671-9e92-62ef8a2b333b" />
<img width="240" height="70" alt="render" src="https://github.com/user-attachments/assets/f6a1e874-971f-4428-857b-83fa7edf56a1" />


</p>

<p align="center">

<img width="220" height="70" alt="JSON Web Tokens (JWT)  - zonalogo" src="https://github.com/user-attachments/assets/c59325bc-876a-4b74-aa7c-300b82f02a7e" />
<img width="290" height="70" alt="PostgreSQL_zonalogo" src="https://github.com/user-attachments/assets/571efa63-8747-44e1-900a-cde7f7ead7a7" />
<img width="170" height="70" alt="postman2-svgrepo" src="https://github.com/user-attachments/assets/330b59bc-b20f-4100-a47c-c1d06c2b2b63" />

</p>
<br>

<img width="1000" height="500" alt="rpgcraft_1" src="https://github.com/user-attachments/assets/8b5d27fc-8923-430d-aba1-2de31992441d" />

---

Cada mundo reúne tudo o que uma campanha precisa: a introdução e as missões na visão geral, a história em documentos `.md`, uma linha do tempo com o calendário do próprio mundo, personagens com ficha e relações, e o bestiário com raças e criaturas.

<img width="1000" height="500" alt="rpgcraft_2" src="https://github.com/user-attachments/assets/ed34b095-b727-4802-8b2b-67f879687dea" />

---

Com tema escuro, design system próprio, edição direta nos campos (sem formulários longos) e navegação por teclado, a interface foi pensada para o mestre consultar e anotar durante a sessão sem perder o ritmo.

<img width="1000" height="500" alt="rpgcraft_4" src="https://github.com/user-attachments/assets/d597f355-e425-47c6-b46d-9d71efe328e3" />

---

<img width="1000" height="500" alt="rpgcraft_5" src="https://github.com/user-attachments/assets/ef51adac-ad53-4364-92b5-dd5732331098" />

<br>

# 🎯 Principais Funcionalidades

* **Mundos Organizados:** criação, renomeação e exclusão (que pede a digitação do nome do mundo), capa por URL, tags de gênero, favoritos e ordem personalizada por arrastar e soltar. Um mundo pode ser marcado como público (demo).
* **Visão Geral do Mundo:** introdução em Markdown, missões agrupadas por status (em andamento, ociosa e concluída) e índice lateral que acompanha a rolagem (*scroll-spy*).
* **História (Lore) em Markdown:** documentos `.md` que podem ser criados, importados e exportados, com leitura e edição em uma gaveta lateral e salvamento automático.
* **Linha do Tempo com Calendário Próprio:** o mundo define o nome da era e a data "Agora"; há eras, eventos com tags de personagens e locais e eventos "só do mestre".
* **Personagens:** grade com busca, ordenação e filtros (status, raça, papel, grupo e favoritos), ficha rápida editável direto no campo (atualização otimista, com volta atrás se a API falhar), ficha completa em Markdown, retrato com enquadramento e visualização da imagem inteira em tela cheia.
* **Segredos do Mestre:** textos borrados por padrão, revelados só por quem é o dono do mundo. A API não envia os segredos a visitantes.
* **Relações entre Personagens:** grafo com layout automático (família, romance, aliança, inimizade e mentoria), legenda que filtra por tipo, foco na vizinhança de um personagem e uma tabela acessível equivalente.
* **Raças e Criaturas:** cards próprios para cada tipo, selo de perigo em cinco níveis (sempre com texto, nunca só cor), faixa de nível e os lugares onde são comuns.
* **Notebook:** notas em Markdown com barra de formatação, salvamento automático e fixação; tarefas com prioridade, prazo, mundo associado e ranking sem repetição.
* **Atividade Recente:** registro de criação, edição e exclusão com links diretos; edições seguidas em até 10 minutos viram uma só entrada.
* **Modo Convidado:** somente leitura, sem login, restrito aos mundos públicos.
* **Acessibilidade:** contraste mínimo de 4,5:1, foco visível, uso completo pelo teclado (inclusive para arrastar e soltar) e alvos de toque de pelo menos 32 px.

<br>

# 🏗️ Arquitetura & Tecnologias

O projeto é um monorepo com backend e frontend desacoplados, que conversam por uma API REST autenticada com JWT.

### **Backend:**
* **Python & Django:** núcleo da aplicação, organizada em apps por domínio.
* **Django REST Framework:** API REST com serializers e permissões por objeto.
* **SimpleJWT:** autenticação com *access token* de 60 minutos, *refresh token* de 7 dias com rotação e lista de bloqueio.
* **PostgreSQL (Supabase):** banco de dados, acessado pelo *session pooler* com `dj-database-url`.
* **django-cors-headers:** CORS restrito às origens autorizadas.
* **Gunicorn & WhiteNoise:** servidor de aplicação e arquivos estáticos em produção.

### **Frontend:**
* **React 19 (com TypeScript):** interface reativa e tipada, com uma camada de API que espelha os contratos do backend.
* **Vite:** build tool e servidor de desenvolvimento.
* **Tailwind CSS v4:** estilização utilitária sobre *design tokens* próprios.
* **React Router 7:** rotas do mundo em `/world/:id/...`, com o estado das gavetas na URL (`?personagem=ID`), o que torna cada ficha um link compartilhável.
* **dnd-kit:** arrastar e soltar acessível, reutilizado em todas as grades.
* **React Flow (`@xyflow/react`) + dagre:** grafo de relações com layout automático.
* **react-easy-crop:** escolha do enquadramento das imagens.
* **react-markdown + rehype-sanitize:** renderização de Markdown com HTML sanitizado.
* **Axios, Sonner e Lucide React:** requisições, avisos e ícones.

### **Estrutura do repositório:**

```
rpg-craft/
├── backend/
│   ├── config/          # settings por ambiente, urls, wsgi
│   ├── accounts/        # usuário, login com limite de tentativas, /auth/me/ e /health/
│   ├── worlds/          # mundos, tags, calendário, base comum (scoped.py) e o comando seed_demo
│   ├── characters/      # personagens e relações
│   ├── peoples/         # raças e criaturas
│   ├── lore/            # documentos .md, eras, eventos da linha do tempo e missões
│   ├── notebook/        # notas e tarefas
│   ├── activity/        # registro de atividade recente
│   ├── gallery/, maps/  # reservados para a v1.1
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/         # camada de dados (Axios, tipos e serviços)
    │   ├── components/  # ui (kit próprio), layout, world, characters, peoples
    │   ├── hooks/       # useEntityList, useEntityRecord, useAutosave...
    │   ├── lib/         # regras puras (filtros, ordenação, atividade)
    │   └── pages/
    ├── public/demo/     # imagens dos mundos de exemplo
    ├── vercel.json
    └── package.json
```

<br>

# 🧠 Decisões Técnicas

* **Imagens por URL, com enquadramento em porcentagem:** enquanto o upload não existe, a imagem é referenciada por URL e o enquadramento escolhido é guardado como porcentagens da imagem original. A tela o desenha só com CSS (sem `canvas`), então funciona com qualquer endereço e vale para o card, a gaveta e a tela cheia. Trocar a URL apaga o enquadramento, regra aplicada no backend.
* **Base reutilizável no backend:** o acesso por mundo, o log de atividade, favoritar e reordenar vivem em `worlds/scoped.py`. Personagens, raças e criaturas só configuram essa base.
* **Hooks genéricos no frontend:** `useEntityList` e `useEntityRecord` concentram carregar, favoritar, reordenar, salvar de forma otimista e excluir com o toast "Desfazer". As telas de Raças e Criaturas foram montadas reaproveitando a de Personagens.
* **Segredos protegidos na API:** o blur da interface é só visual. Para quem não é dono do mundo, o servidor esvazia os campos secretos antes de responder.
* **Listas como texto simples:** classes, itens, grupos e lugares são tags de texto, o que mantém a edição rápida. A migração para relações entre entidades está planejada junto com Locais.

<br>

# 🔒 Segurança e Privacidade

* **Escrita só do dono:** todas as rotas de escrita exigem login e que o mundo pertença ao usuário. A leitura é do dono e dos mundos públicos, e o visitante lê só os públicos.
* **Sessão renovada com segurança:** o frontend renova o *access token* sozinho com o *refresh token*, que gira a cada uso e é bloqueado depois de usado.
* **Login com limite de tentativas:** a rota de login aceita 10 tentativas por minuto.
* **Segredos do mestre fora do JSON** para visitantes, inclusive o conteúdo dos eventos marcados como "só do mestre" e o título deles no feed de atividade.
* **Markdown sanitizado:** o conteúdo renderizado passa por `rehype-sanitize`.
* **Produção endurecida:** HTTPS forçado, cookies seguros, HSTS, `SECRET_KEY` obrigatória e `DEBUG` desligado por padrão.
* **Sem rastreamento:** não há analytics nem cadastro público. O que a hospedagem registra por conta própria (como endereços IP nos logs) é de responsabilidade dela. Os mundos de exemplo são fictícios, então não coloque informação sensível neles.

<br>

# ☁️ Deploy e Infraestrutura (Produção)

O RPG.Craft está em produção, com backend, frontend e banco hospedados separadamente:

* **Backend (Render):** a API em Django roda como *Web Service* Python no [Render](https://render.com), com Gunicorn, arquivos estáticos pelo WhiteNoise e endpoint `/api/health/` para verificação de saúde. As migrações rodam no build.
* **Banco de Dados (Supabase):** PostgreSQL no [Supabase](https://supabase.com), acessado pelo *session pooler*, que funciona em hospedagens apenas IPv4.
* **Frontend (Vercel):** a interface em React/Vite é publicada no [Vercel](https://vercel.com), com a URL da API injetada em tempo de build pela variável `VITE_API_URL` e um `vercel.json` que redireciona as rotas do React Router para o `index.html`.
* **CORS Controlado:** as origens autorizadas são liberadas explicitamente pela variável `CORS_ALLOWED_ORIGINS` no backend, sem wildcard aberto.
* **Continuous Deployment (CI/CD):** backend e frontend estão conectados ao repositório no GitHub, e cada `git push` na branch `main` dispara um novo deploy em cada plataforma.
* **Keep-alive agendado:** um workflow do GitHub Actions faz uma requisição diária ao `/api/health/`, que acorda o servidor e consulta o banco, para o projeto gratuito do Supabase não ser pausado por inatividade.
* **Segurança Cloud-Native:** chaves, senhas e endereços não são versionados; toda a configuração é injetada pelas *Environment Variables* de cada plataforma.

<br>

# 🚧 Limitações Conhecidas e Próximas Funcionalidades

### **Limitações atuais**

* **Hospedagem gratuita:** o Render desliga o serviço após cerca de 15 minutos sem acesso, e a primeira requisição depois disso pode levar aproximadamente 1 minuto. A interface mostra o aviso "Acordando o servidor…" quando isso acontece.
* **Banco gratuito:** o Supabase pausa projetos com pouca atividade (o keep-alive evita isso) e o plano gratuito pode não incluir backups automáticos. Por isso os dados são exportados periodicamente com `dumpdata`.
* **Imagens somente por URL:** ainda não há upload de arquivos. As imagens dos mundos de exemplo ficam em `frontend/public/demo/`.
* **Cadastro desabilitado:** por enquanto o cadastro de novas contas não é possível.
* **Sem testes automatizados:** a validação foi manual, e a cobertura de testes é um dos próximos passos.
* **Funcionalidades marcadas como "Em breve":** Grupos, Mapas, busca global, Galeria, Perfil e Mestre IA aparecem na interface, desativados, com o selo correspondente.

### **Em desenvolvimento / planejado (v1.1 em diante)**

- [ ] **Grupos:** tela com abas Organizações e Religiões, com membros calculados a partir dos personagens, segredos do mestre e diplomacia entre grupos.
- [ ] **Mapas e Locais:** mapas interativos (Leaflet em coordenadas simples) com marcadores, regiões, rotas e camadas, e árvore de locais ligada às demais telas.
- [ ] **Busca global** (Ctrl+K) com filtros por mundo, tipo e período, e busca de texto completo em português.
- [ ] **Upload de imagens** (capa, retratos, emblemas), com conversão para WebP e remoção de metadados.
- [ ] **Galeria e Perfil.**
- [ ] **Temas de fundo** por mundo.
- [ ] **Mestre IA:** assistente com busca semântica sobre o conteúdo do mundo.
- [ ] **Página "Sobre":** tutorial com as funcionalidades e o uso do site.
- [ ] **Testes automatizados** (API, permissões e interface) com integração contínua.

<br>

# ⚙️ Como Executar o Projeto Localmente

### **Pré-requisitos**
* Python 3.12+ e Node.js (versão compatível com o Vite 8)
* Um banco PostgreSQL com conexão SSL. O mais simples é um projeto gratuito no [Supabase](https://supabase.com); copie a string do *Session pooler* em *Connect*.

### **Backend**

```bash
git clone https://github.com/AlysonMLL/rpg-craft.git
cd rpg-craft/backend

python -m venv venv
# Windows (PowerShell): .\venv\Scripts\Activate.ps1
# Linux/macOS:          source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env    # edite o .env: SECRET_KEY, DATABASE_URL e DEBUG=True

python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo    # opcional: cria os dois mundos de exemplo
python manage.py runserver
```

A API fica em **http://localhost:8000/api/** e o painel administrativo em **http://localhost:8000/admin/**.

> Para gerar uma `SECRET_KEY`: `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"`

### **Frontend**

```bash
cd rpg-craft/frontend
npm install
npm run dev
```

Acesse **http://localhost:5173** para visualizar a interface.

> Por padrão o frontend usa `http://localhost:8000/api/` como URL da API. Para apontar para outro endereço, defina `VITE_API_URL` no arquivo `.env.local` do frontend. Essa variável é lida no build, então mudar o valor exige um novo build.

### **Variáveis de Ambiente (backend)**

| Variável | Descrição | Padrão |
|---|---|---|
| `SECRET_KEY` | Chave secreta do Django (obrigatória em produção) | — |
| `DEBUG` | `True` só em desenvolvimento | `False` |
| `DATABASE_URL` | String de conexão do PostgreSQL | — |
| `ALLOWED_HOSTS` | Hosts permitidos, separados por vírgula | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Origens liberadas no CORS (com `https://`, sem barra final) | `http://localhost:5173,http://127.0.0.1:5173` |
| `CSRF_TRUSTED_ORIGINS` | Origens confiáveis para o `/admin` em HTTPS | — |
| `DEMO_ASSETS_URL` | URL pública da pasta de imagens usada pelo `seed_demo` | — |

### **Mundos de Exemplo (`seed_demo`)**

O comando cria dois mundos públicos com conteúdo fictício: **As Terras de Valdren** (fantasia medieval) e **Neon Meridiano** (cyberpunk), cada um com personagens, relações, raças, criaturas, missões, documentos, eras e eventos.

```bash
python manage.py seed_demo                  # cria os mundos que ainda não existem
python manage.py seed_demo --reset          # apaga e recria os dois mundos de exemplo
python manage.py seed_demo --images-only --assets-url https://SEU-SITE.vercel.app/demo
```

O comando só mexe nesses dois mundos, e a última forma apenas preenche as URLs das imagens depois que elas estiverem publicadas.

### **Endpoints da API**

Todas as rotas ficam sob `/api/`. As listas aceitam `?world=ID`, e a escrita exige login como dono do mundo.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/token/` | Login (devolve `access` e `refresh`), com limite de tentativas |
| `POST` | `/auth/token/refresh/` | Renova a sessão (o `refresh` gira a cada uso) |
| `GET` | `/auth/me/` | Dados do usuário logado |
| `GET` | `/health/` | Verificação de saúde (consulta o banco) |
| `CRUD` | `/worlds/`, `/tags/` | Mundos (com `POST /worlds/reorder/`) e tags |
| `CRUD` | `/characters/`, `/relationships/` | Personagens (com `POST /characters/reorder/`) e relações |
| `CRUD` | `/races/`, `/creatures/` | Raças e criaturas (cada uma com `POST .../reorder/`) |
| `CRUD` | `/documents/`, `/eras/`, `/timeline-events/`, `/quests/` | Documentos `.md`, eras, eventos e missões |
| `CRUD` | `/notes/`, `/todos/` | Notas e tarefas (com `POST /todos/{id}/move/`) |
| `GET` | `/activity/` | Atividade recente |

<br>

---

<br>

<p align="center">
  <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" />
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/DRF-ff1709?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/node.js%20-%2343853D.svg?&style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" />
  <img src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white" />
  <img src="https://img.shields.io/badge/PyCharm-000000?style=for-the-badge&logo=PyCharm&logoColor=FFFFFF" />
  <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" />
</p>
