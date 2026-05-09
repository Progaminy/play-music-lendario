/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: dados.js - Dados Mockados (Mínimo)
   ============================================= */

const DB = {
    versao: '1.0.0',
    ultimaAtualizacao: '2026-05-09',

    // ========== ARTISTAS (VAZIO - A PREENCHER) ==========
    artistas: [],

    // ========== MÚSICAS (VAZIO - A PREENCHER) ==========
    musicas: [],

    // ========== PLATAFORMAS REGISTADAS ==========
    plataformasRegistadas: [
        { id: 'plat-1', nome: 'YouTube', url: 'https://youtube.com', icone: '', status: 'ativo' },
        { id: 'plat-2', nome: 'Spotify', url: 'https://spotify.com', icone: '', status: 'ativo' },
        { id: 'plat-3', nome: 'Apple Music', url: 'https://music.apple.com', icone: '', status: 'ativo' },
        { id: 'plat-4', nome: 'Deezer', url: 'https://deezer.com', icone: '', status: 'ativo' },
        { id: 'plat-5', nome: 'Tidal', url: 'https://tidal.com', icone: '', status: 'ativo' },
        { id: 'plat-6', nome: 'SoundCloud', url: 'https://soundcloud.com', icone: '', status: 'ativo' },
        { id: 'plat-7', nome: 'Audiomack', url: 'https://audiomack.com', icone: '', status: 'ativo' },
        { id: 'plat-8', nome: 'Boomplay', url: 'https://boomplay.com', icone: '', status: 'ativo' }
    ],

    // ========== EVENTOS (VAZIO) ==========
    eventos: [],

    // ========== USUÁRIO TESTE ==========
    usuarioTeste: {
        id: 'user-teste',
        nome: 'Visitante Musical',
        email: 'teste@teste.com',
        telefone: '123456789',
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
        favoritos: [],
        offline: [],
        historico: [],
        definicoes: {
            tema: 'lit',
            notificacoes: true
        }
    },

    // ========== MENSAGENS ==========
    mensagens: [],

    // ========== FILTROS DISPONÍVEIS ==========
    filtros: {
        paises: ['Moçambique', 'Portugal', 'Brasil', 'Cabo Verde', 'Angola', 'São Tomé e Príncipe', 'Guiné-Bissau'],
        provincias: ['Luanda', 'Benguela', 'Huíla', 'Namibe', 'Cabinda', 'Lisboa', 'Porto', 'São Paulo', 'Rio de Janeiro'],
        generos: ['Kizomba', 'Semba', 'R&B', 'Afrobeat', 'Pop', 'Música Romântica', 'Hip Hop', 'Rap'],
        linguas: ['Português', 'Inglês', 'Francês', 'Espanhol', 'Kimbundu', 'Umbundu', 'Kikongo', 'Crioulo'],
        tiposEvento: ['Show ao Vivo', 'Lançamento', 'Live', 'Entrevista', 'Participação Especial', 'Workshop']
    },

    paginasUsuario: []
};

// ========== FUNÇÕES UTILITÁRIAS ==========
function buscarArtista(id) {
    return DB.artistas.find(a => a.id === id) || null;
}

function buscarMusicasPorArtista(artistaId) {
    if (!DB.musicas) return [];
    return DB.musicas.filter(m => m.artistaId === artistaId);
}

function buscarMusica(id) {
    if (!DB.musicas) return null;
    return DB.musicas.find(m => m.id === id) || null;
}

function buscarPorGenero(genero) {
    if (!DB.musicas) return [];
    return DB.musicas.filter(m => m.genero.toLowerCase() === genero.toLowerCase());
}

function buscarPorPais(pais) {
    if (!DB.musicas || !DB.artistas) return [];
    const artistasDoPais = DB.artistas.filter(a => a.pais === pais).map(a => a.id);
    return DB.musicas.filter(m => artistasDoPais.includes(m.artistaId));
}

function buscarPorProvincia(provincia) {
    if (!DB.musicas || !DB.artistas) return [];
    const artistasDaProvincia = DB.artistas.filter(a => a.provincia === provincia).map(a => a.id);
    return DB.musicas.filter(m => artistasDaProvincia.includes(m.artistaId));
}

function buscarPorLingua(lingua) {
    if (!DB.musicas) return [];
    return DB.musicas.filter(m => m.lingua.toLowerCase() === lingua.toLowerCase());
}

function adicionarFavorito(usuario, musicaId) {
    if (!usuario.favoritos) usuario.favoritos = [];
    if (!usuario.favoritos.includes(musicaId)) {
        usuario.favoritos.push(musicaId);
        return true;
    }
    return false;
}

function removerFavorito(usuario, musicaId) {
    if (!usuario.favoritos) return false;
    const index = usuario.favoritos.indexOf(musicaId);
    if (index > -1) {
        usuario.favoritos.splice(index, 1);
        return true;
    }
    return false;
}

function isFavorito(usuario, musicaId) {
    if (!usuario || !usuario.favoritos) return false;
    return usuario.favoritos.includes(musicaId);
}

function adicionarOffline(usuario, musicaId) {
    if (!usuario.offline) usuario.offline = [];
    if (!usuario.offline.includes(musicaId)) {
        usuario.offline.push(musicaId);
        return true;
    }
    return false;
}

function registrarDestranque(musicaId) {
    const musica = buscarMusica(musicaId);
    if (musica) {
        musica.destranques = (musica.destranques || 0) + 1;
        musica.likes = (musica.likes || 0) + 1;
        return true;
    }
    return false;
}

function registrarVisualizacaoCompleta(musicaId) {
    const musica = buscarMusica(musicaId);
    if (musica) {
        musica.likes = (musica.likes || 0) + 1;
        return true;
    }
    return false;
}

function buscarPlataformasRegistadas() {
    if (!DB.plataformasRegistadas) return [];
    return DB.plataformasRegistadas.filter(p => p.status === 'ativo');
}

function buscarEventos() {
    if (!DB.eventos) return [];
    return DB.eventos.filter(e => e.status === 'aprovado');
}

console.log('📦 Dados carregados!');
console.log(`🎤 ${DB.artistas.length} artistas`);
console.log(`🎵 ${DB.musicas.length} músicas`);
console.log(`🔗 ${DB.plataformasRegistadas.length} plataformas`);