/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: dados.js - Dados Mockados da Plataforma
   ============================================= */

// ========== BASE DE DADOS ==========
const DB = {
    // Versão da base de dados
    versao: '1.0.0',
    ultimaAtualizacao: '2026-05-09',

    // ========== ARTISTAS (3 REAIS) ==========
    artistas: [
        {
            id: 'artista-1',
            nome: 'Anselmo Ralph',
            nomeCompleto: 'Anselmo Ralph Andrade Cordeiro',
            pais: 'Angola',
            provincia: 'Luanda',
            dataNascimento: '1981-03-12',
            genero: ['Kizomba', 'R&B', 'Semba'],
            lingua: ['Português', 'Inglês'],
            biografia: `Anselmo Ralph é um dos maiores nomes da música angolana e africana. Com uma carreira que começou ainda adolescente, conquistou fãs em todo o mundo lusófono com a sua voz inconfundível e presença de palco magnética.

Nascido em Luanda, Anselmo descobriu a sua paixão pela música ainda muito jovem. O seu primeiro álbum, lançado em 2006, marcou o início de uma carreira repleta de sucessos que atravessam fronteiras.

Com vários discos de platina e ouro, Anselmo Ralph é reconhecido como um dos artistas mais influentes da música africana contemporânea, tendo colaborado com artistas internacionais e realizado concertos em arenas lotadas por todo o mundo.

A sua música combina ritmos tradicionais angolanos com R&B contemporâneo, criando uma sonoridade única que conquista todas as gerações.`,

            fotoPerfil: 'assets/imagens/artista1/perfil.jpg',
            fotoCapa: 'assets/imagens/artista1/capa.jpg',
            fotoGaleria: [
                'assets/imagens/artista1/foto1.jpg',
                'assets/imagens/artista1/foto2.jpg',
                'assets/imagens/artista1/foto3.jpg'
            ],

            redesSociais: {
                youtube: 'https://youtube.com/@AnselmoRalphOficial',
                instagram: 'https://instagram.com/anselmoralph',
                tiktok: 'https://tiktok.com/@anselmoralph',
                facebook: 'https://facebook.com/AnselmoRalphOficial',
                twitter: 'https://twitter.com/anselmoralph'
            },

            blog: 'https://anselmoralph.com/blog',
            contactoShow: '+244 9XX XXX XXX',
            emailContacto: 'booking@anselmoralph.com',

            status: 'contratado',
            dataContrato: '2025-01-15',
            totalMusicas: 8,
            totalSeguidores: 2500000
        },
        {
            id: 'artista-2',
            nome: 'C4 Pedro',
            nomeCompleto: 'C4 Pedro Henriques',
            pais: 'Angola',
            provincia: 'Luanda',
            dataNascimento: '1983-07-07',
            genero: ['Kizomba', 'Afrobeat', 'Pop'],
            lingua: ['Português', 'Inglês', 'Francês'],
            biografia: `C4 Pedro é um fenómeno da música angolana que conquistou o mundo com o seu estilo único e carismático. Conhecido como "King Ckwa", revolucionou a kizomba moderna com uma abordagem inovadora que mistura tradição e modernidade.

A sua jornada musical começou nas ruas de Luanda, onde desenvolveu um estilo próprio que mais tarde se tornaria a sua assinatura artística. Com álbuns de grande sucesso e colaborações internacionais, C4 Pedro tornou-se um embaixador da cultura angolana.

A sua presença digital é massiva, com milhões de seguidores em todas as plataformas, e os seus videoclipes acumulam centenas de milhões de visualizações. C4 Pedro é mais do que um músico: é um ícone cultural que inspira toda uma geração.`,

            fotoPerfil: 'assets/imagens/artista2/perfil.jpg',
            fotoCapa: 'assets/imagens/artista2/capa.jpg',
            fotoGaleria: [
                'assets/imagens/artista2/foto1.jpg',
                'assets/imagens/artista2/foto2.jpg',
                'assets/imagens/artista2/foto3.jpg'
            ],

            redesSociais: {
                youtube: 'https://youtube.com/@C4PedroOficial',
                instagram: 'https://instagram.com/c4pedro',
                tiktok: 'https://tiktok.com/@c4pedrooficial',
                facebook: 'https://facebook.com/C4PedroOficial',
                twitter: 'https://twitter.com/c4pedro'
            },

            blog: 'https://c4pedro.com/blog',
            contactoShow: '+244 9XX XXX XXX',
            emailContacto: 'booking@c4pedro.com',

            status: 'contratado',
            dataContrato: '2025-02-20',
            totalMusicas: 6,
            totalSeguidores: 4800000
        },
        {
            id: 'artista-3',
            nome: 'Matias Damásio',
            nomeCompleto: 'Matias Damásio',
            pais: 'Angola',
            provincia: 'Benguela',
            dataNascimento: '1982-05-09',
            genero: ['Semba', 'Kizomba', 'Música Romântica'],
            lingua: ['Português', 'Kimbundu', 'Umbundu'],
            biografia: `Matias Damásio é a voz de uma geração. As suas letras profundas e melodias envolventes tocam o coração de milhões de pessoas em todo o mundo. Reconhecido como um dos maiores compositores da música angolana, as suas canções são verdadeiros hinos de amor, esperança e identidade cultural.

Nascido em Benguela, Matias trouxe para a música as raízes da sua terra, misturando semba tradicional com arranjos contemporâneos que conquistam públicos de todas as idades. Cada lançamento seu é um acontecimento cultural.

Com uma carreira marcada por sucessos intemporais, Matias Damásio é respeitado não apenas como cantor, mas como poeta e contador de histórias. A sua música transcende barreiras linguísticas e culturais, levando a alma angolana a todos os cantos do planeta.`,

            fotoPerfil: 'assets/imagens/artista3/perfil.jpg',
            fotoCapa: 'assets/imagens/artista3/capa.jpg',
            fotoGaleria: [
                'assets/imagens/artista3/foto1.jpg',
                'assets/imagens/artista3/foto2.jpg',
                'assets/imagens/artista3/foto3.jpg'
            ],

            redesSociais: {
                youtube: 'https://youtube.com/@MatiasDamasioOficial',
                instagram: 'https://instagram.com/matias_damasio',
                tiktok: 'https://tiktok.com/@matiasdamasio',
                facebook: 'https://facebook.com/MatiasDamasioOficial',
                twitter: 'https://twitter.com/matiasdamasio'
            },

            blog: 'https://matiasdamasio.com/blog',
            contactoShow: '+244 9XX XXX XXX',
            emailContacto: 'booking@matiasdamasio.com',

            status: 'contratado',
            dataContrato: '2025-03-10',
            totalMusicas: 7,
            totalSeguidores: 3200000
        }
    ],

    // ========== MÚSICAS ==========
    musicas: [
        // Anselmo Ralph
        {
            id: 'musica-1',
            artistaId: 'artista-1',
            titulo: 'Não Me Toca',
            ano: 2016,
            genero: 'Kizomba',
            lingua: 'Português',
            duracao: '4:12',
            capa: 'assets/imagens/artista1/musica1.jpg',
            linkYoutube: 'https://www.youtube.com/watch?v=EXEMPLO1',
            letra: `[Estrofe 1]
Não me toca assim
Que eu perco a razão
O teu corpo no meu
 É pura tentação

[Refrão]
Não me toca, não me toca
Que eu não quero me entregar
Não me toca, não me toca
Ou não vou conseguir parar

[Estrofe 2]
Teus olhos dizem tudo
Que a boca quer falar
É um convite mudo
Difícil de negar

[Refrão]
Não me toca, não me toca...

[Ponte]
Sei que não devia
Mas o coração insiste
Nessa melodia
Que ninguém resiste`,
            visualizacoes: 25000000,
            likes: 580000,
            destranques: 45000,
            downloads: 32000
        },
        {
            id: 'musica-2',
            artistaId: 'artista-1',
            titulo: 'Única Mulher',
            ano: 2014,
            genero: 'R&B',
            lingua: 'Português',
            duracao: '4:32',
            capa: 'assets/imagens/artista1/musica2.svg',
            linkYoutube: 'https://www.youtube.com/watch?v=EXEMPLO2',
            letra: `[Estrofe 1]
Entre tantas mulheres no mundo
Só tu me fizeste parar
Num segundo tudo mudou
Quando te vi chegar

[Refrão]
És a única mulher
Que me faz sonhar
És a única mulher
Que me faz voar

[Estrofe 2]
Teu sorriso ilumina
O meu caminho escuro
És a luz que me guia
Num amor tão puro`,
            visualizacoes: 18000000,
            likes: 420000,
            destranques: 38000,
            downloads: 28000
        },
        // C4 Pedro
        {
            id: 'musica-3',
            artistaId: 'artista-2',
            titulo: 'Se Eu Soubesse',
            ano: 2015,
            genero: 'Kizomba',
            lingua: 'Português',
            duracao: '3:58',
            capa: 'assets/imagens/artista2/musica1.jpg',
            linkYoutube: 'https://www.youtube.com/watch?v=EXEMPLO3',
            letra: `[Estrofe 1]
Se eu soubesse que era assim
Não tinha brincado com o amor
Agora estou aqui tão só
A pagar pelo meu erro

[Refrão]
Se eu soubesse, ah se eu soubesse
Tinha-te dado o meu coração
Se eu soubesse, ah se eu soubesse
Não estaria nesta solidão`,
            visualizacoes: 32000000,
            likes: 750000,
            destranques: 52000,
            downloads: 41000
        },
        {
            id: 'musica-4',
            artistaId: 'artista-2',
            titulo: 'Tu És a Mulher',
            ano: 2018,
            genero: 'Afrobeat',
            lingua: 'Português',
            duracao: '3:45',
            capa: 'assets/imagens/artista2/musica2.svg',
            linkYoutube: 'https://www.youtube.com/watch?v=EXEMPLO4',
            letra: `[Estrofe 1]
Desde o primeiro olhar
Soube que eras especial
Tua maneira de dançar
Algo fora do normal

[Refrão]
Tu és a mulher que eu sempre sonhei
Contigo encontrei o que procurei
Tu és a mulher, razão do meu viver`,
            visualizacoes: 15000000,
            likes: 380000,
            destranques: 29000,
            downloads: 22000
        },
        // Matias Damásio
        {
            id: 'musica-5',
            artistaId: 'artista-3',
            titulo: 'Nada Vai Nos Separar',
            ano: 2015,
            genero: 'Música Romântica',
            lingua: 'Português',
            duracao: '4:05',
            capa: 'assets/imagens/artista3/musica1.jpg',
            linkYoutube: 'https://www.youtube.com/watch?v=EXEMPLO5',
            letra: `[Estrofe 1]
O mundo pode cair
As estrelas apagar
Mas o que sinto por ti
Nada vai apagar

[Refrão]
Nada vai nos separar
Nem a distância, nem a dor
Nada vai nos separar
Porque maior é o nosso amor`,
            visualizacoes: 28000000,
            likes: 650000,
            destranques: 48000,
            downloads: 36000
        },
        {
            id: 'musica-6',
            artistaId: 'artista-3',
            titulo: 'Eu e Tu',
            ano: 2020,
            genero: 'Kizomba',
            lingua: 'Português',
            duracao: '4:18',
            capa: 'assets/imagens/artista3/musica2.svg',
            linkYoutube: 'https://www.youtube.com/watch?v=EXEMPLO6',
            letra: `[Estrofe 1]
Nós dois, perdidos no momento
O mundo lá fora, indiferente
Tu e eu, apenas sentimento
Vivendo o agora, intensamente

[Refrão]
Eu e tu, uma história sem fim
Eu e tu, feitos um para o outro assim`,
            visualizacoes: 12000000,
            likes: 290000,
            destranques: 22000,
            downloads: 18000
        }
    ],

    // ========== PLATAFORMAS REGISTADAS ==========
    plataformasRegistadas: [
        {
            id: 'plat-1',
            nome: 'YouTube',
            url: 'https://youtube.com',
            icone: 'assets/icones/youtube.svg',
            status: 'ativo'
        },
        {
            id: 'plat-2',
            nome: 'Spotify',
            url: 'https://spotify.com',
            icone: 'assets/icones/spotify.svg',
            status: 'ativo'
        },
        {
            id: 'plat-3',
            nome: 'Apple Music',
            url: 'https://music.apple.com',
            icone: 'assets/icones/apple-music.svg',
            status: 'ativo'
        },
        {
            id: 'plat-4',
            nome: 'Deezer',
            url: 'https://deezer.com',
            icone: 'assets/icones/deezer.svg',
            status: 'ativo'
        },
        {
            id: 'plat-5',
            nome: 'Tidal',
            url: 'https://tidal.com',
            icone: 'assets/icones/tidal.svg',
            status: 'ativo'
        },
        {
            id: 'plat-6',
            nome: 'SoundCloud',
            url: 'https://soundcloud.com',
            icone: 'assets/icones/soundcloud.svg',
            status: 'ativo'
        },
        {
            id: 'plat-7',
            nome: 'Audiomack',
            url: 'https://audiomack.com',
            icone: 'assets/icones/audiomack.svg',
            status: 'ativo'
        },
        {
            id: 'plat-8',
            nome: 'Boomplay',
            url: 'https://boomplay.com',
            icone: 'assets/icones/boomplay.svg',
            status: 'ativo'
        }
    ],

    // ========== EVENTOS DE EXEMPLO ==========
    eventos: [
        {
            id: 'evento-1',
            usuarioId: 'user-teste',
            tipo: 'Show ao Vivo',
            titulo: 'Tour Musical 2026',
            descricao: 'Grande show de lançamento da nova temporada.',
            data: '2026-07-15',
            hora: '20:00',
            local: 'Arena de Luanda, Angola',
            foto: '',
            status: 'aprovado'
        },
        {
            id: 'evento-2',
            usuarioId: 'user-teste',
            tipo: 'Lançamento',
            titulo: 'Novo Álbum',
            descricao: 'Lançamento oficial do novo álbum nas plataformas digitais.',
            data: '2026-08-01',
            hora: '00:00',
            local: 'Online',
            foto: '',
            status: 'aprovado'
        }
    ],

    // ========== USUÁRIO TESTE ==========
    usuarioTeste: {
        id: 'user-teste',
        nome: 'Visitante Musical',
        email: 'visitante@musicaalendaria.com',
        telefone: '+244900000000',
        pais: 'Angola',
        provincia: 'Luanda',
        lingua: 'Português',
        fotoPerfil: '',
        contactoShow: '',
        blog: '',
        redesSociais: {
            youtube: '',
            instagram: '',
            tiktok: '',
            outras: ''
        },
        favoritos: ['musica-1', 'musica-3', 'musica-5'],
        offline: ['musica-1', 'musica-5'],
        historico: ['musica-1', 'musica-2', 'musica-3'],
        definicoes: {
            tema: 'lit',
            notificacoes: true
        }
    },

    // ========== MENSAGENS DE APROVAÇÃO (SIMULADAS) ==========
    mensagens: [
        {
            id: 'msg-1',
            usuarioId: 'user-teste',
            tipo: 'aprovado',
            conteudo: 'A sua postagem foi aprovada e já está visível na plataforma.',
            data: '2026-05-08',
            lida: false
        },
        {
            id: 'msg-2',
            usuarioId: 'user-teste',
            tipo: 'rejeitado',
            conteudo: 'A sua postagem foi rejeitada. Motivo: link não pertence a uma plataforma registada.',
            data: '2026-05-07',
            lida: true
        }
    ],

    // ========== FILTROS DISPONÍVEIS ==========
    filtros: {
        paises: ['Angola', 'Portugal', 'Brasil', 'Cabo Verde', 'Moçambique', 'São Tomé e Príncipe', 'Guiné-Bissau'],
        provincias: ['Luanda', 'Benguela', 'Huíla', 'Namibe', 'Cabinda', 'Lisboa', 'Porto', 'São Paulo', 'Rio de Janeiro'],
        generos: ['Kizomba', 'Semba', 'R&B', 'Afrobeat', 'Pop', 'Música Romântica', 'Hip Hop', 'Rap'],
        linguas: ['Português', 'Inglês', 'Francês', 'Espanhol', 'Kimbundu', 'Umbundu', 'Kikongo', 'Crioulo'],
        tiposEvento: ['Show ao Vivo', 'Lançamento', 'Live', 'Entrevista', 'Participação Especial', 'Workshop']
    },

    // ========== PÁGINAS INTERNAS DO USUÁRIO ==========
    paginasUsuario: [
        { id: 'pagina-1', titulo: 'Minhas Músicas', slug: 'minhas-musicas', ordem: 1 },
        { id: 'pagina-2', titulo: 'Meus Eventos', slug: 'meus-eventos', ordem: 2 },
        { id: 'pagina-3', titulo: 'Galeria', slug: 'galeria', ordem: 3 }
    ]
};

// ========== FUNÇÕES UTILITÁRIAS DE DADOS ==========

// Buscar artista por ID
function buscarArtista(id) {
    return DB.artistas.find(a => a.id === id) || null;
}

// Buscar músicas de um artista
function buscarMusicasPorArtista(artistaId) {
    return DB.musicas.filter(m => m.artistaId === artistaId);
}

// Buscar música por ID
function buscarMusica(id) {
    return DB.musicas.find(m => m.id === id) || null;
}

// Buscar músicas favoritas do usuário
function buscarFavoritos(usuario) {
    return DB.musicas.filter(m => usuario.favoritos.includes(m.id));
}

// Buscar músicas offline do usuário
function buscarOffline(usuario) {
    return DB.musicas.filter(m => usuario.offline.includes(m.id));
}

// Buscar músicas por gênero
function buscarPorGenero(genero) {
    return DB.musicas.filter(m => m.genero.toLowerCase() === genero.toLowerCase());
}

// Buscar músicas por país do artista
function buscarPorPais(pais) {
    const artistasDoPais = DB.artistas.filter(a => a.pais === pais).map(a => a.id);
    return DB.musicas.filter(m => artistasDoPais.includes(m.artistaId));
}

// Buscar músicas por província do artista
function buscarPorProvincia(provincia) {
    const artistasDaProvincia = DB.artistas.filter(a => a.provincia === provincia).map(a => a.id);
    return DB.musicas.filter(m => artistasDaProvincia.includes(m.artistaId));
}

// Buscar músicas por língua
function buscarPorLingua(lingua) {
    return DB.musicas.filter(m => m.lingua.toLowerCase() === lingua.toLowerCase());
}

// Adicionar aos favoritos
function adicionarFavorito(usuario, musicaId) {
    if (!usuario.favoritos.includes(musicaId)) {
        usuario.favoritos.push(musicaId);
        return true;
    }
    return false;
}

// Remover dos favoritos
function removerFavorito(usuario, musicaId) {
    const index = usuario.favoritos.indexOf(musicaId);
    if (index > -1) {
        usuario.favoritos.splice(index, 1);
        return true;
    }
    return false;
}

// Verificar se está nos favoritos
function isFavorito(usuario, musicaId) {
    return usuario.favoritos.includes(musicaId);
}

// Adicionar ao offline
function adicionarOffline(usuario, musicaId) {
    if (!usuario.offline.includes(musicaId)) {
        usuario.offline.push(musicaId);
        return true;
    }
    return false;
}

// Registrar destranque
function registrarDestranque(musicaId) {
    const musica = buscarMusica(musicaId);
    if (musica) {
        musica.destranques++;
        musica.likes++;
        return true;
    }
    return false;
}

// Registrar visualização completa
function registrarVisualizacaoCompleta(musicaId) {
    const musica = buscarMusica(musicaId);
    if (musica) {
        musica.likes++;
        if (!DB.usuarioTeste.historico.includes(musicaId)) {
            DB.usuarioTeste.historico.push(musicaId);
        }
        return true;
    }
    return false;
}

// Buscar plataformas registadas
function buscarPlataformasRegistadas() {
    return DB.plataformasRegistadas.filter(p => p.status === 'ativo');
}

// Buscar eventos
function buscarEventos() {
    return DB.eventos.filter(e => e.status === 'aprovado');
}

console.log('📦 Dados carregados com sucesso!');
console.log(`🎤 ${DB.artistas.length} artistas`);
console.log(`🎵 ${DB.musicas.length} músicas`);
console.log(`🔗 ${DB.plataformasRegistadas.length} plataformas registadas`);