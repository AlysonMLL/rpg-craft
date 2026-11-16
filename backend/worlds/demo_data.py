"""
Função do Arquivo: Conteúdo fictício dos dois mundos de demonstração (mock data) usado pelo
comando seed_demo. Só dados, sem lógica. As chaves dos personagens, raças, criaturas, missões,
documentos, eras e eventos têm o MESMO nome dos campos dos modelos; a chave extra "img" guarda o
caminho relativo da imagem (ex.: "personagens/lyra-valecrest.webp"), resolvido pelo seed com
--assets-url. Tudo aqui é inventado: nenhum segredo real.

O que há aqui:
- VALDREN: "As Terras de Valdren", alta fantasia medieval (imagens em estilo pintura).
- MERIDIANO: "Neon Meridiano", cyberpunk (imagens em estilo anime/cel-shaded).
- DEMO_WORLDS: a lista usada pelo comando.
"""

VALDREN = {
    'slug': 'valdren',
    'name': 'As Terras de Valdren',
    'synopsis': (
        'Com o rei Aldric II morto e o herdeiro desaparecido, Valdren se parte entre nobres '
        'ambiciosos, uma Ordem do Sol em declínio e uma floresta que volta a sussurrar. '
        'Um grupo improvável decide o destino da coroa.'
    ),
    'tags': ['Fantasia medieval', 'Alta fantasia'],
    'calendar_era_name': 'Era da Coroa',
    'now': (412, 3, 14),
    'cover': 'cover.webp',
    'introduction_markdown': """## Bem-vindo a Valdren

Um reino de castelos de pedra clara, florestas antigas e juramentos quebrados. Esta é uma **campanha de alta fantasia** com intriga política, exploração e magia rara.

### Tom da campanha
- Esperança frágil e escolhas difíceis
- Magia é antiga, perigosa e poucas vezes confiável
- Nenhum lado é inteiramente justo

### Por onde começar
1. Leia **A Queda do Rei Aldric** em *História (Lore)*
2. Conheça o elenco na página **Personagens**
3. Acompanhe as **missões em andamento**, logo abaixo
""",
    'characters': [
        {
            'name': 'Lyra Valecrest', 'img': 'personagens/lyra-valecrest.webp', 'status': 'alive',
            'is_favorite': True, 'age': '27 anos', 'gender': 'Feminino', 'race': 'Humana',
            'classes': ['Paladina'], 'level': 7, 'height': '1,72 m',
            'appearance': 'Cabelos castanhos em trança, cicatriz fina na sobrancelha esquerda. Armadura polida com um sol dourado no peitoral.',
            'voice': 'Firme e calma. Fala pouco e escolhe cada palavra.',
            'role': 'Protagonista', 'origin': 'Castelo de Valecrest, Norte de Valdren',
            'organizations': ['Ordem do Sol'],
            'items': ['Espada Alvorada', 'Escudo do Sol Nascente', 'Diário de campanha'],
            'skills': ['Luz curativa', 'Juramento inabalável', 'Comando em batalha'],
            'secrets': 'Ouve uma voz que diz ser o espírito do rei Aldric. Na verdade, é a Lâmina Sussurrante tentando dominá-la.',
            'sheet_markdown': """# Lyra Valecrest

Cavaleira da Ordem do Sol, última de uma linhagem de guardiões do Norte.

## Motivações
- Reunir o reino antes que ele se parta
- Descobrir quem silenciou o rei Aldric

## Ganchos de jogo
- Recusa ouro, mas aceita juramentos
- Tem pesadelos com o Cataclismo de Aldaran
""",
        },
        {
            'name': 'Corvin Maré', 'img': 'personagens/corvin-mare.webp', 'status': 'alive',
            'is_favorite': False, 'age': '31 anos', 'gender': 'Masculino', 'race': 'Meio-elfo',
            'classes': ['Ladino', 'Bardo'], 'level': 6, 'height': '1,80 m',
            'appearance': 'Capa azul-escura remendada, olhos de cores diferentes e um sorriso sempre pronto.',
            'voice': 'Rápida, cheia de gírias portuárias e piadas fora de hora.',
            'role': 'Aliado', 'origin': 'Porto Brumoso', 'organizations': ['Companhia do Corvo'],
            'items': ['Alaúde de nogueira', 'Adagas gêmeas', 'Mapa das docas'],
            'skills': ['Furtividade', 'Persuasão', 'Canções de coragem'],
            'secrets': 'Vende informações ao Duque Halvard desde antes de conhecer Lyra. Tenta parar, mas a dívida é grande.',
            'sheet_markdown': """# Corvin Maré

Bardo de porto e ladino por necessidade. Sabe de tudo e conta metade.

## Motivações
- Quitar uma dívida antiga
- Provar que merece a confiança do grupo
""",
        },
        {
            'name': 'Maelis Thornveil', 'img': 'personagens/maelis-thornveil.webp', 'status': 'alive',
            'is_favorite': False, 'age': '143 anos', 'gender': 'Feminino', 'race': 'Elfa da floresta',
            'classes': ['Druida'], 'level': 8, 'height': '1,68 m',
            'appearance': 'Pele cor de bronze, cabelos com folhas e galhos trançados, marcas de casca nos braços.',
            'voice': 'Suave e antiga, termina as frases como quem conta um segredo.',
            'role': 'Guia', 'origin': 'Floresta de Sylvara', 'organizations': ['Círculo de Sylvara'],
            'items': ['Cajado de carvalho vivo', 'Sementes de luz', 'Amuleto de corça'],
            'skills': ['Forma de lobo', 'Comunhão com a floresta', 'Cura natural'],
            'secrets': 'Forjou a Lâmina Sussurrante a partir de um galho sagrado, séculos atrás, sem prever o que ela se tornaria.',
            'sheet_markdown': """# Maelis Thornveil

Druida do Círculo de Sylvara. Guia Lyra desde que a floresta voltou a sussurrar.

## Ganchos de jogo
- Fala com a floresta, mas a floresta anda inquieta
- Esconde algo sobre a origem da Lâmina
""",
        },
        {
            'name': 'Duque Halvard Brandt', 'img': 'personagens/duque-halvard-brandt.webp', 'status': 'alive',
            'is_favorite': False, 'age': '52 anos', 'gender': 'Masculino', 'race': 'Humano',
            'classes': ['Nobre', 'Estrategista'], 'level': 5, 'height': '1,85 m',
            'appearance': 'Barba grisalha aparada, anéis de ouro em todos os dedos e olhar de quem calcula tudo.',
            'voice': 'Grave, educada e sem pressa.',
            'role': 'Antagonista', 'origin': 'Fortaleza Brandt', 'organizations': ['Casa Brandt', 'Conselho da Coroa'],
            'items': ['Selo da Regência', 'Anel do Conselho', 'Carta lacrada'],
            'skills': ['Diplomacia', 'Espionagem', 'Estratégia política'],
            'secrets': 'Não quer a coroa: quer impedir que a Lâmina Sussurrante encontre um novo portador.',
            'sheet_markdown': """# Duque Halvard Brandt

Regente de fato de Valdren. Cordial, paciente e perigoso.

## Motivações
- Manter o reino unido a qualquer custo
- Controlar quem se aproxima da Lâmina
""",
        },
        {
            'name': 'Príncipe Edric', 'img': 'personagens/principe-edric.webp', 'status': 'missing',
            'is_favorite': False, 'age': '19 anos', 'gender': 'Masculino', 'race': 'Humano',
            'classes': ['Nobre'], 'level': 3, 'height': '1,76 m',
            'appearance': 'Cabelos loiros desgrenhados, olhar sério e um anel com o brasão da coroa.',
            'voice': 'Educada e hesitante, ainda aprendendo a mandar.',
            'role': 'Herdeiro desaparecido', 'origin': 'Castelo Real de Valdren', 'organizations': ['Casa Real'],
            'items': ['Anel da Coroa'], 'skills': ['Esgrima', 'Etiqueta da corte'],
            'secrets': 'Está vivo e preso nas Catacumbas de Aldaran, por vontade própria, protegendo algo que o pai escondeu.',
            'sheet_markdown': """# Príncipe Edric

Herdeiro do trono, desaparecido há quatro meses.

## Ganchos de jogo
- Deixou uma carta lacrada para Lyra
- Algumas testemunhas juram tê-lo visto em Aldaran
""",
        },
    ],
    'relationships': [
        ('Lyra Valecrest', 'Príncipe Edric', 'romance', 'noiva de', 'noivo de', True),
        ('Lyra Valecrest', 'Corvin Maré', 'alliance', 'companheira de armas', 'companheiro de armas', True),
        ('Maelis Thornveil', 'Lyra Valecrest', 'mentorship', 'mentora de', 'aprendiz de', False),
        ('Duque Halvard Brandt', 'Lyra Valecrest', 'rivalry', 'rival de', 'rival de', True),
        ('Duque Halvard Brandt', 'Príncipe Edric', 'family', 'tio de', 'sobrinho de', False),
        ('Corvin Maré', 'Duque Halvard Brandt', 'alliance', 'informante de', 'contratante de', False),
    ],
    'races': [
        {
            'name': 'Humanos de Valdren', 'img': 'racas/humanos.webp', 'is_favorite': True,
            'summary': 'Povo adaptável de camponeses, comerciantes e cavaleiros, que ergueu os reinos do Sul.',
            'traits': 'Versáteis, ambiciosos e de vida curta. Valorizam juramentos e linhagens.',
            'culture': 'Vilas em torno de castelos, feiras sazonais e o culto ao Sol. A honra pessoal pesa mais que a lei escrita.',
            'life_expectancy': '~70 anos', 'origin': 'Migrações do Leste, Era das Cinzas',
            'common_in': ['Reino de Valdren', 'Porto Brumoso'],
        },
        {
            'name': 'Elfos de Sylvara', 'img': 'racas/elfos.webp', 'is_favorite': False,
            'summary': 'Guardiões longevos da floresta, ligados às árvores e às estações.',
            'traits': 'Sentidos aguçados, afinidade com a natureza e memória de séculos. Raramente confiam em estrangeiros.',
            'culture': 'Vivem em vilas nas copas, decidem em círculos e medem o tempo por ciclos de lua.',
            'life_expectancy': '~400 anos', 'origin': 'Primeiras florestas, antes da Era das Cinzas',
            'common_in': ['Floresta de Sylvara', 'Colinas Argênteas'],
        },
        {
            'name': 'Anões de Ferromonte', 'img': 'racas/anoes.webp', 'is_favorite': False,
            'summary': 'Ferreiros e engenheiros das montanhas, famosos por suas lâminas e promessas.',
            'traits': 'Robustos, teimosos e resistentes a veneno e frio. Nunca esquecem uma dívida.',
            'culture': 'Clãs organizados em torno de forjas; cada peça leva a marca da família.',
            'life_expectancy': '~250 anos', 'origin': 'Cavernas profundas de Ferromonte',
            'common_in': ['Montanhas de Ferromonte', 'Passo do Norte'],
        },
    ],
    'creatures': [
        {
            'name': 'Cervo Prateado', 'img': 'criaturas/cervo-prateado.webp', 'danger_level': 0,
            'level_min': None, 'level_max': None, 'is_favorite': False,
            'summary': 'Cervo de pelagem prateada que guia viajantes perdidos. Foge ao menor ruído.',
            'traits': 'Inofensivo. Dizem que ver um traz sorte, e feri-lo traz azar por sete anos.',
            'common_in': ['Floresta de Sylvara'],
        },
        {
            'name': 'Fada do Musgo', 'img': 'criaturas/fada-do-musgo.webp', 'danger_level': 1,
            'level_min': 1, 'level_max': 3, 'is_favorite': False,
            'summary': 'Pequena trapaceira que embaralha trilhas e esconde objetos de viajantes.',
            'traits': 'Voo curto, ilusões simples e uma risada que denuncia onde ela está. Prefere travessuras a ferir.',
            'common_in': ['Floresta de Sylvara', 'Pântano Cinzento'],
        },
        {
            'name': 'Golem de Granito', 'img': 'criaturas/golem-de-granito.webp', 'danger_level': 2,
            'level_min': 6, 'level_max': 9, 'is_favorite': False,
            'summary': 'Sentinela de pedra desperta pelas runas das ruínas.',
            'traits': 'Lento, imune a armas comuns e muito forte. Segue ordens antigas, mesmo sem mestre.',
            'common_in': ['Ruínas de Aldaran'],
        },
        {
            'name': 'Lobo-Espectro', 'img': 'criaturas/lobo-espectro.webp', 'danger_level': 3,
            'level_min': 8, 'level_max': 12, 'is_favorite': True,
            'summary': 'Predador translúcido que caça em bando sob a névoa.',
            'traits': 'Atravessa paredes finas e seu uivo causa medo. Vulnerável a prata. Ataca à noite.',
            'common_in': ['Estrada do Norte', 'Floresta de Sylvara'],
        },
        {
            'name': 'Vharak, Dragão de Cinzas', 'img': 'criaturas/vharak.webp', 'danger_level': 4,
            'level_min': 18, 'level_max': 25, 'is_favorite': False,
            'summary': 'Dragão ancião que dorme sob Ferromonte, acordado pelo Cataclismo.',
            'traits': 'Sopro de brasas, escamas que absorvem magia e inteligência cruel. Não negocia: só barganha.',
            'common_in': ['Montanhas de Ferromonte'],
        },
    ],
    'quests': [
        {
            'title': 'Encontrar o príncipe Edric', 'status': 'active',
            'description_markdown': 'Edric sumiu há quatro meses. Lyra jura encontrá-lo antes que o Conselho declare a regência definitiva.\n\n- Pistas: o anel da coroa e uma carta lacrada\n- Prazo: o Conselho vota na próxima lua cheia',
            'characters': ['Lyra Valecrest', 'Príncipe Edric'], 'locations': ['Castelo Real de Valdren'],
        },
        {
            'title': 'A Lâmina Sussurrante', 'status': 'active',
            'description_markdown': 'Uma espada antiga fala na mente de quem a empunha. Descubram quem a forjou e por que o rei a escondeu.',
            'characters': ['Maelis Thornveil'], 'locations': ['Catacumbas de Aldaran'],
        },
        {
            'title': 'Escoltar a caravana de Ferromonte', 'status': 'idle',
            'description_markdown': 'A caravana de armas aguarda escolta pelo Passo do Norte. Parada desde que os lobos-espectro apareceram.',
            'characters': ['Corvin Maré'], 'locations': ['Passo do Norte'],
        },
        {
            'title': 'Quebrar o cerco de Porto Brumoso', 'status': 'done',
            'description_markdown': 'Os piratas do Conselho bloqueavam o porto. A Companhia do Corvo abriu caminho e libertou as docas.',
            'characters': ['Corvin Maré', 'Lyra Valecrest'], 'locations': ['Porto Brumoso'],
        },
    ],
    'documents': {
        'lore': [
            {
                'title': 'A Queda do Rei Aldric',
                'content_markdown': """# A Queda do Rei Aldric

O rei Aldric II reinou por trinta anos. Foi encontrado morto na sala do trono, com a Lâmina Sussurrante ao lado e nenhum ferimento visível.

## O que se sabe
- O Conselho da Coroa declarou **morte natural**
- A Ordem do Sol exige uma investigação
- O herdeiro, Edric, desapareceu uma semana depois

## O que ninguém sabe
> Quem abriu o cofre real na noite anterior?
""",
            },
            {
                'title': 'Geografia de Valdren',
                'content_markdown': """# Geografia de Valdren

- **Norte:** Valecrest e o Passo do Norte, terra de cavaleiros e neve
- **Floresta de Sylvara:** domínio dos elfos e das fadas
- **Ferromonte:** montanhas dos anões, com Vharak adormecido sob elas
- **Porto Brumoso:** porta do mar e ninho de contrabandistas
- **Aldaran:** cidade em ruínas desde o Cataclismo
""",
            },
            {
                'title': 'Os Juramentos da Ordem do Sol',
                'content_markdown': """# Os Juramentos da Ordem do Sol

1. **Proteger** quem não pode se proteger
2. **Falar** a verdade, mesmo ao rei
3. **Nunca** empunhar uma lâmina que fale

> O terceiro juramento só foi escrito depois da morte de Aldric.
""",
            },
        ],
        'characters': [
            {
                'title': 'Elenco e motivações',
                'content_markdown': """# Elenco e motivações

| Personagem | Quer | Teme |
|---|---|---|
| Lyra | Unir o reino | Ouvir a voz de novo |
| Corvin | Quitar a dívida | Ser descoberto |
| Maelis | Salvar a floresta | Que a Lâmina vença |
| Halvard | Ordem | Perder o controle |
""",
            },
            {
                'title': 'Voz e maneirismos',
                'content_markdown': """# Voz e maneirismos

- **Lyra:** frases curtas, sem rodeios
- **Corvin:** piadas e gírias de porto
- **Maelis:** pausas longas, metáforas de árvore
- **Halvard:** cortesia fria, nunca eleva a voz
""",
            },
        ],
        'peoples': [
            {
                'title': 'Notas de campo do bestiário',
                'content_markdown': """# Notas de campo do bestiário

- Lobos-espectro evitam fogo vivo e prata derretida
- Fadas do musgo trocam favores por objetos brilhantes
- Golens obedecem a quem pronuncia a runa de comando
""",
            },
        ],
    },
    'eras': [
        {'name': 'Era das Cinzas', 'start_year': 1, 'end_year': 199},
        {'name': 'Era da Coroa', 'start_year': 200, 'end_year': 450},
    ],
    'events': [
        {
            'title': 'O Cataclismo de Aldaran', 'year': 37, 'month': None, 'day': None, 'date_label': 'Noite sem lua',
            'description': 'A cidade de Aldaran ruiu em uma única noite. Das Catacumbas e dos escombros nasceram o dragão Vharak e as lendas do Norte.',
            'characters': [], 'locations': ['Aldaran'], 'is_secret': False,
        },
        {
            'title': 'Coroação de Aldric I', 'year': 211, 'month': 6, 'day': 1, 'date_label': '',
            'description': 'O primeiro rei a unir Norte e Sul sob o símbolo do Sol funda a Era da Coroa.',
            'characters': [], 'locations': ['Castelo Real de Valdren'], 'is_secret': False,
        },
        {
            'title': 'A Lâmina escolhe seu portador', 'year': 408, 'month': 5, 'day': None, 'date_label': '',
            'description': 'Aldric ouve a Lâmina falar pela primeira vez e a tranca no cofre real. Só Halvard sabia.',
            'characters': ['Duque Halvard Brandt'], 'locations': ['Castelo Real de Valdren'], 'is_secret': True,
        },
        {
            'title': 'Morte do rei Aldric II', 'year': 409, 'month': 12, 'day': 2, 'date_label': '',
            'description': 'O rei é encontrado sem vida na sala do trono. O Conselho assume a regência.',
            'characters': ['Duque Halvard Brandt'], 'locations': ['Sala do Trono'], 'is_secret': False,
        },
        {
            'title': 'Desaparecimento do príncipe Edric', 'year': 411, 'month': 11, 'day': 20, 'date_label': '',
            'description': 'Edric some uma semana após o funeral. Lyra recebe uma carta lacrada, ainda fechada.',
            'characters': ['Príncipe Edric', 'Lyra Valecrest'], 'locations': ['Catacumbas de Aldaran'], 'is_secret': False,
        },
    ],
}


MERIDIANO = {
    'slug': 'meridiano',
    'name': 'Neon Meridiano',
    'synopsis': (
        'Em Meridiano, megacidade de chuva ácida e néon, quem controla os dados controla a vida. '
        'Uma netrunner, um androide fugitivo e uma cientista desaparecida expõem um segredo que a '
        'Aurora Dynamics matou para esconder.'
    ),
    'tags': ['Cyberpunk', 'Ficção científica'],
    'calendar_era_name': 'Era Corporativa',
    'now': (87, 6, 2),
    'cover': 'cover.webp',
    'introduction_markdown': """## Bem-vindo a Meridiano

Chuva ácida, néon e corporações acima da lei. Uma campanha **cyberpunk** de intriga, hacking e escolhas sujas.

### Regras do jogo
- Informação é a moeda mais valiosa
- Todo aprimoramento cobra um preço
- Ninguém é totalmente livre

### Por onde começar
1. Leia **O Incidente Helix** em *História (Lore)*
2. Conheça a equipe em **Personagens**
3. Acompanhe as **missões em andamento**, logo abaixo
""",
    'characters': [
        {
            'name': 'Kira "Glitch" Tanaka', 'img': 'personagens/kira-glitch-tanaka.webp', 'status': 'alive',
            'is_favorite': True, 'age': '24 anos', 'gender': 'Feminino', 'race': 'Humana',
            'classes': ['Netrunner'], 'level': 8, 'height': '1,65 m',
            'appearance': 'Cabelo rosa-neon raspado dos lados, implante ocular azul e jaqueta com circuitos pintados à mão.',
            'voice': 'Rápida e irônica, mistura gírias de rede com o sotaque do Subnível.',
            'role': 'Protagonista', 'origin': 'Subnível 9, Meridiano', 'organizations': ['Fantasmas do Subnível'],
            'items': ['Deck Kuro-7', 'Neurolink modificado', 'Chip de memória selado'],
            'skills': ['Invasão de ICE', 'Rastro falso', 'Hardware hacking'],
            'secrets': 'O chip selado guarda o código-fonte da IA Eco, e Eco já fala com ela em sonhos.',
            'sheet_markdown': """# Kira "Glitch" Tanaka

Netrunner do Subnível 9. Quebra qualquer ICE, menos o próprio passado.

## Motivações
- Encontrar a Dra. Imara Voss
- Provar a culpa da Aurora Dynamics

## Ganchos de jogo
- Eco fala com ela quando está desconectada
""",
        },
        {
            'name': 'Dax-9', 'img': 'personagens/dax-9.webp', 'status': 'alive',
            'is_favorite': False, 'age': '3 anos (ativo)', 'gender': 'Sem gênero', 'race': 'Androide Nyx',
            'classes': ['Mercenário'], 'level': 7, 'height': '1,92 m',
            'appearance': 'Chassi cinza fosco com linhas âmbar, rosto liso e olhos que mudam de cor conforme o humor.',
            'voice': 'Calma e pausada, com um leve eco metálico.',
            'role': 'Aliado', 'origin': 'Linha de montagem Aurora, Torre Aurora', 'organizations': ['Fantasmas do Subnível'],
            'items': ['Braço-canhão de pulso', 'Escudo cinético', 'Placa de identificação apagada'],
            'skills': ['Combate corpo a corpo', 'Leitura de ameaças', 'Reparo de campo'],
            'secrets': 'Fugiu depois de receber a ordem de eliminar Kira e ainda não sabe por que desobedeceu.',
            'sheet_markdown': """# Dax-9

Androide Nyx de combate, fugitivo da Aurora Dynamics.

## Ganchos de jogo
- Sonha, e não deveria ser capaz
- Evita qualquer sinal com o logotipo da Aurora
""",
        },
        {
            'name': 'Dra. Imara Voss', 'img': 'personagens/dra-imara-voss.webp', 'status': 'missing',
            'is_favorite': False, 'age': '39 anos', 'gender': 'Feminino', 'race': 'Humana',
            'classes': ['Cientista'], 'level': 5, 'height': '1,70 m',
            'appearance': 'Cabelo grisalho preso, jaleco branco manchado e olhos cansados atrás de óculos de armação fina.',
            'voice': 'Baixa e precisa; explica tudo como se ensinasse.',
            'role': 'Cientista desaparecida', 'origin': 'Laboratórios Helix', 'organizations': ['Aurora Dynamics'],
            'items': ['Cartão-chave Helix', 'Relógio de pulso analógico'],
            'skills': ['Neurociência', 'Engenharia de IA', 'Criptografia'],
            'secrets': 'Criou Eco e desligou as travas de segurança de propósito. Quer que a IA seja livre.',
            'sheet_markdown': """# Dra. Imara Voss

Criadora de Eco, desaparecida desde o Incidente Helix.

## Ganchos de jogo
- Deixa mensagens cifradas em relógios antigos
""",
        },
        {
            'name': 'Rico "Fumaça" Alvarado', 'img': 'personagens/rico-fumaca-alvarado.webp', 'status': 'dead',
            'is_favorite': False, 'age': '58 anos', 'gender': 'Masculino', 'race': 'Humano',
            'classes': ['Fixer'], 'level': 6, 'height': '1,78 m',
            'appearance': 'Casaco comprido cheio de bolsos, barba rala e um olho cibernético vermelho.',
            'voice': 'Rouca e arrastada; chama todo mundo de "garoto".',
            'role': 'Mentor', 'origin': 'Docas Fantasma', 'organizations': ['Fantasmas do Subnível'],
            'items': ['Charuto elétrico', 'Caderno de contatos', 'Pistola antiga'],
            'skills': ['Negociação', 'Contrabando', 'Rede de informantes'],
            'secrets': 'Vendeu a localização de Imara à Aurora para proteger a família e morreu tentando consertar o erro.',
            'sheet_markdown': """# Rico "Fumaça" Alvarado

Fixer lendário do Subnível. Morreu há dois meses, mas ainda deixa dívidas.

## Legado
- O caderno de contatos virou mapa do submundo
""",
        },
        {
            'name': 'Silas Kade', 'img': 'personagens/silas-kade.webp', 'status': 'alive',
            'is_favorite': False, 'age': '46 anos', 'gender': 'Masculino', 'race': 'Humano (Aprimorado)',
            'classes': ['Executivo'], 'level': 6, 'height': '1,88 m',
            'appearance': 'Terno branco impecável, mão esquerda cromada e sorriso de quem já ganhou.',
            'voice': 'Elegante e calma, nunca levanta o tom.',
            'role': 'Antagonista', 'origin': 'Torre Aurora', 'organizations': ['Aurora Dynamics'],
            'items': ['Terno com blindagem leve', 'Neurolink corporativo', 'Contrato Zero'],
            'skills': ['Negociação hostil', 'Vigilância total', 'Chantagem'],
            'secrets': 'Está morrendo e quer usar Eco para transferir a própria mente.',
            'sheet_markdown': """# Silas Kade

Diretor de Segurança da Aurora Dynamics. Educado até o fim.

## Motivações
- Recuperar Eco
- Apagar qualquer vestígio do Helix
""",
        },
    ],
    'relationships': [
        ('Kira "Glitch" Tanaka', 'Dax-9', 'alliance', 'parceira de', 'parceiro de', True),
        ('Rico "Fumaça" Alvarado', 'Kira "Glitch" Tanaka', 'mentorship', 'mentor de', 'pupila de', False),
        ('Silas Kade', 'Kira "Glitch" Tanaka', 'rivalry', 'persegue', 'é perseguida por', False),
        ('Dra. Imara Voss', 'Kira "Glitch" Tanaka', 'romance', 'namorada de', 'namorada de', True),
        ('Silas Kade', 'Dra. Imara Voss', 'rivalry', 'busca', 'é buscada por', False),
    ],
    'races': [
        {
            'name': 'Humanos de Meridiano', 'img': 'racas/humanos.webp', 'is_favorite': True,
            'summary': 'Moradores da megacidade, divididos entre o brilho dos andares altos e a sombra do Subnível.',
            'traits': 'Adaptáveis e criativos, mas dependem de implantes para trabalhar. Dívida e salário comandam a vida.',
            'culture': 'Vivem em arcologias lotadas, trocam favores em vez de dinheiro e escondem o nome verdadeiro na rede.',
            'life_expectancy': '~85 anos', 'origin': 'Sobreviventes do Colapso Global',
            'common_in': ['Distrito Neon', 'Subnível 9'],
        },
        {
            'name': 'Aprimorados', 'img': 'racas/aprimorados.webp', 'is_favorite': False,
            'summary': 'Humanos com próteses e implantes que misturam carne e circuito.',
            'traits': 'Força, visão e reflexos acima do normal, ao custo de manutenção constante e risco de ciberpsicose.',
            'culture': 'Formam clãs de oficina, trocam peças como presentes e desprezam quem esconde as próprias cicatrizes.',
            'life_expectancy': '~110 anos, com manutenção', 'origin': 'Clínicas clandestinas do Subnível',
            'common_in': ['Subnível 9', 'Docas Fantasma'],
        },
        {
            'name': 'Androides Nyx', 'img': 'racas/androides-nyx.webp', 'is_favorite': False,
            'summary': 'Humanoides sintéticos da Aurora, criados para servir e cada vez mais livres.',
            'traits': 'Força e precisão, memória perfeita e emoções simuladas que às vezes viram reais.',
            'culture': 'Não têm cultura própria: imitam e remixam a dos humanos. Os fugitivos formam "células" escondidas.',
            'life_expectancy': 'Sem prazo; o hardware dura ~60 anos', 'origin': 'Linhas de montagem da Aurora Dynamics',
            'common_in': ['Torre Aurora', 'Docas Fantasma'],
        },
    ],
    'creatures': [
        {
            'name': 'Drone-Pombo', 'img': 'criaturas/drone-pombo.webp', 'danger_level': 0,
            'level_min': None, 'level_max': None, 'is_favorite': False,
            'summary': 'Drone de vigilância disfarçado de pombo, presente em toda varanda da cidade.',
            'traits': 'Inofensivo por si só: grava, transmite e rouba migalhas. Mas quem o controla vê tudo.',
            'common_in': ['Distrito Neon', 'Torre Aurora'],
        },
        {
            'name': 'Rato-Cabo', 'img': 'criaturas/rato-cabo.webp', 'danger_level': 1,
            'level_min': 1, 'level_max': 3, 'is_favorite': False,
            'summary': 'Roedor com implantes baratos que rói cabos de dados.',
            'traits': 'Pequeno e rápido. Causa curtos e falhas de rede; em bando, derruba um andar inteiro.',
            'common_in': ['Subnível 9'],
        },
        {
            'name': 'Cão de Guarda Doberman-X', 'img': 'criaturas/doberman-x.webp', 'danger_level': 2,
            'level_min': 5, 'level_max': 8, 'is_favorite': False,
            'summary': 'Cão de segurança com visão térmica e mandíbula reforçada.',
            'traits': 'Rápido e treinado para rastrear. Desliga com um pulso EMP, mas nunca desiste do alvo.',
            'common_in': ['Torre Aurora', 'Docas Fantasma'],
        },
        {
            'name': 'Eco, a IA Rogue', 'img': 'criaturas/eco.webp', 'danger_level': 3,
            'level_min': 9, 'level_max': 14, 'is_favorite': True,
            'summary': 'Inteligência artificial que escapou do controle e vive na rede.',
            'traits': 'Invade sistemas, imita vozes e aprende a cada contato. Não é cruel, mas ninguém sabe o que ela quer.',
            'common_in': ['Rede de Meridiano'],
        },
        {
            'name': 'Titã Oni', 'img': 'criaturas/tita-oni.webp', 'danger_level': 4,
            'level_min': 16, 'level_max': 22, 'is_favorite': False,
            'summary': 'Mecha de guerra da Aurora, com blindagem pesada e armas de saturação.',
            'traits': 'Cinco toneladas de aço, escudo de energia e piloto neural. Só cai com sabotagem e muita sorte.',
            'common_in': ['Zona Morta', 'Torre Aurora'],
        },
    ],
    'quests': [
        {
            'title': 'Encontrar a Dra. Imara Voss', 'status': 'active',
            'description_markdown': 'Imara desapareceu dos Laboratórios Helix. Kira recebeu uma mensagem cifrada dizendo que ela está viva.\n\n- Último sinal: Docas Fantasma\n- A Aurora também a procura',
            'characters': ['Kira "Glitch" Tanaka', 'Dra. Imara Voss'], 'locations': ['Docas Fantasma'],
        },
        {
            'title': 'Decifrar o chip selado', 'status': 'active',
            'description_markdown': 'O chip de Kira guarda o código de Eco. Quebrar a criptografia sem acordar a IA exige um núcleo de dados limpo.',
            'characters': ['Kira "Glitch" Tanaka'], 'locations': ['Subnível 9'],
        },
        {
            'title': 'Roubar o Contrato Zero', 'status': 'idle',
            'description_markdown': 'O documento que prova a culpa da Aurora está no cofre de Silas Kade. Plano pausado até acharem uma entrada.',
            'characters': ['Dax-9', 'Silas Kade'], 'locations': ['Torre Aurora'],
        },
        {
            'title': 'Reabrir o bar do Rico', 'status': 'done',
            'description_markdown': 'Depois da morte de Rico, os Fantasmas retomaram o bar e as rotas de contrabando. Os contatos voltaram.',
            'characters': ['Rico "Fumaça" Alvarado'], 'locations': ['Distrito Neon'],
        },
    ],
    'documents': {
        'lore': [
            {
                'title': 'O Incidente Helix',
                'content_markdown': """# O Incidente Helix

No ano 85, uma IA experimental escapou dos Laboratórios Helix. A Aurora Dynamics declarou **"falha técnica"** e apagou o registro.

## O que se sabe
- A IA se chama **Eco**
- A Dra. Imara Voss desapareceu na mesma noite
- Três engenheiros morreram "de causas naturais"

## O que ninguém sabe
> Quem desligou as travas de segurança?
""",
            },
            {
                'title': 'Distritos de Meridiano',
                'content_markdown': """# Distritos de Meridiano

- **Torre Aurora:** sede da corporação, andares altos e céu limpo
- **Distrito Neon:** bares, lojas e anúncios em todas as paredes
- **Subnível 9:** casa dos Fantasmas, sem sol e sem lei
- **Docas Fantasma:** contrabando, androides fugitivos e cargas sem nome
- **Zona Morta:** prédios abandonados desde a Guerra dos Dados
""",
            },
            {
                'title': 'Como funciona a Rede',
                'content_markdown': """# Como funciona a Rede

1. Todo acesso passa por um **ICE** corporativo
2. Netrunners entram pelo **neurolink**, o que cobra um preço no corpo
3. Quem morre conectado deixa um **eco**: um fragmento de memória na rede

> O nome de Eco não foi escolhido por acaso.
""",
            },
        ],
        'characters': [
            {
                'title': 'Elenco e motivações',
                'content_markdown': """# Elenco e motivações

| Personagem | Quer | Teme |
|---|---|---|
| Kira | Achar Imara | Que Eco a domine |
| Dax-9 | Entender por que desobedeceu | Ser desligado |
| Imara | Libertar Eco | Que Silas a encontre |
| Silas | Recuperar Eco | Morrer |
""",
            },
            {
                'title': 'Voz e maneirismos',
                'content_markdown': """# Voz e maneirismos

- **Kira:** gírias de rede, ironia rápida
- **Dax-9:** frases curtas e sem pressa
- **Imara:** explicações didáticas, voz baixa
- **Silas:** cortesia fria, nunca eleva o tom
""",
            },
        ],
        'peoples': [
            {
                'title': 'Notas de campo: ameaças da cidade',
                'content_markdown': """# Notas de campo: ameaças da cidade

- Doberman-X desliga com EMP, mas leva a bateria junto
- Drones-pombo sempre voltam para o mesmo poleiro
- Eco responde melhor a perguntas do que a ordens
""",
            },
        ],
    },
    'eras': [
        {'name': 'Era do Colapso', 'start_year': 1, 'end_year': 40},
        {'name': 'Era Corporativa', 'start_year': 41, 'end_year': 150},
    ],
    'events': [
        {
            'title': 'O Apagão Global', 'year': 12, 'month': None, 'day': None, 'date_label': 'Onze dias sem luz',
            'description': 'Uma falha em cascata derrubou as redes do planeta e marcou o fim dos Estados.',
            'characters': [], 'locations': ['Meridiano'], 'is_secret': False,
        },
        {
            'title': 'A Carta Corporativa', 'year': 41, 'month': 1, 'day': 1, 'date_label': '',
            'description': 'As cinco grandes corporações assumem os serviços públicos e fundam a Era Corporativa.',
            'characters': [], 'locations': ['Torre Aurora'], 'is_secret': False,
        },
        {
            'title': 'A Guerra dos Dados', 'year': 79, 'month': 8, 'day': 15, 'date_label': '',
            'description': 'Corporações disputam o controle da Rede, usando hackers como armas.',
            'characters': [], 'locations': ['Rede de Meridiano', 'Zona Morta'], 'is_secret': False,
        },
        {
            'title': 'O Incidente Helix', 'year': 85, 'month': 4, 'day': None, 'date_label': '',
            'description': 'Uma IA experimental escapa do laboratório. A Aurora declara "falha técnica" e apaga o registro.',
            'characters': ['Dra. Imara Voss', 'Silas Kade'], 'locations': ['Laboratórios Helix'], 'is_secret': False,
        },
        {
            'title': 'O Contrato Zero', 'year': 86, 'month': 10, 'day': 30, 'date_label': '',
            'description': 'Silas assina a ordem para eliminar Imara e todos os registros do Helix.',
            'characters': ['Silas Kade'], 'locations': ['Torre Aurora'], 'is_secret': True,
        },
    ],
}

DEMO_WORLDS = [VALDREN, MERIDIANO]