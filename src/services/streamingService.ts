// Links of transmissoras no Brasil.
// Não existe API pública de direitos de transmissão da F1 no Brasil.
// Mapeamento 2026–2028: Globo (TV aberta, 15 GPs ao vivo),
// sportv (todas as sessões) e Globoplay (digital).

export interface StreamingChannel {
  name: string;
  url: string;
  logo?: string;
  isPaid: boolean;
  description: string;
}

export interface StreamingOption {
  name: string;
  url: string;
  isPaid: boolean;
  description: string;
}

const GLOBO_LIVE = 'https://globoplay.globo.com/tv-globo/ao-vivo/7832875/';
const F1_LIVE = 'https://globoplay.globo.com/ao-vivo/7690141/';
const SPORTV_LIVE = 'https://globoplay.globo.com/sportv/ao-vivo/9045469/';

export const f1Channels: Record<string, StreamingChannel> = {
  'Globo': {
    name: 'Globo',
    url: GLOBO_LIVE,
    isPaid: false,
    description: 'TV Globo ao vivo no Globoplay'
  },
  'sportv': {
    name: 'sportv',
    url: SPORTV_LIVE,
    isPaid: true,
    description: 'sportv ao vivo no Globoplay'
  },
  'Globoplay': {
    name: 'Globoplay',
    url: F1_LIVE,
    isPaid: true,
    description: 'Transmissão ao vivo da F1 no Globoplay'
  },
};

export const nbaChannels: Record<string, StreamingChannel> = {
  'ESPN': {
    name: 'ESPN',
    url: 'https://www.espn.com.br/watch/',
    isPaid: true,
    description: 'ESPN via operadora de TV'
  },
  'NBA League Pass': {
    name: 'NBA League Pass',
    url: 'https://www.nba.com/watch/league-pass',
    isPaid: true,
    description: 'Streaming oficial da NBA'
  },
  'Star+': {
    name: 'Star+',
    url: 'https://www.starplus.com/',
    isPaid: true,
    description: 'Streaming Disney'
  },
};

export const nflChannels: Record<string, StreamingChannel> = {
  'ESPN': {
    name: 'ESPN',
    url: 'https://www.espn.com.br/watch/',
    isPaid: true,
    description: 'ESPN via operadora de TV'
  },
  'NFL Game Pass': {
    name: 'NFL Game Pass',
    url: 'https://www.nfl.com/gamepass/',
    isPaid: true,
    description: 'Streaming oficial da NFL'
  },
  'RedeTV!': {
    name: 'RedeTV!',
    url: 'https://www.redetv.uol.com.br/ao-vivo',
    isPaid: false,
    description: 'Transmissão gratuita - TV aberta'
  },
};

function f1ChannelLookup(channelName: string): StreamingChannel | null {
  const aliases: Record<string, string> = {
    band: 'Globo',
    bandplay: 'Globoplay',
    'f1 tv pro': 'sportv',
    f1tv: 'sportv',
    'f1 tv': 'sportv',
    globo: 'Globo',
    globoplay: 'Globoplay',
    sportv: 'sportv',
  };

  const normalized = channelName.toLowerCase().trim();
  const mapped = aliases[normalized];
  if (mapped && f1Channels[mapped]) return f1Channels[mapped];
  if (f1Channels[channelName]) return f1Channels[channelName];

  const key = Object.keys(f1Channels).find((k) =>
    k.toLowerCase().includes(normalized) || normalized.includes(k.toLowerCase())
  );
  return key ? f1Channels[key] : null;
}

export function getStreamingChannel(sport: string, channelName: string): StreamingChannel | null {
  if (sport === 'f1') {
    return f1ChannelLookup(channelName);
  }

  const channels = sport === 'nba' ? nbaChannels : sport === 'nfl' ? nflChannels : {};

  if (channels[channelName]) {
    return channels[channelName];
  }

  const key = Object.keys(channels).find((k) =>
    k.toLowerCase().includes(channelName.toLowerCase()) ||
    channelName.toLowerCase().includes(k.toLowerCase())
  );

  return key ? channels[key] : null;
}

export function getF1StreamingUrl(sessionType?: string): string {
  if (sessionType === 'FP1' || sessionType === 'FP2' || sessionType === 'FP3') {
    return f1Channels['sportv'].url;
  }
  return f1Channels['Globo'].url;
}

const PRACTICE_SESSIONS = new Set(['FP1', 'FP2', 'FP3']);

export function getStreamingOptions(sport: string, session?: string): StreamingOption[] {
  if (sport === 'f1') {
    if (session && PRACTICE_SESSIONS.has(session)) {
      return [
        { ...f1Channels['sportv'] },
        { ...f1Channels['Globoplay'] },
      ];
    }
    return [
      { ...f1Channels['Globo'] },
      { ...f1Channels['sportv'] },
      { ...f1Channels['Globoplay'] },
    ];
  }

  if (sport === 'nba') {
    return [
      { ...nbaChannels['ESPN'] },
      { ...nbaChannels['Star+'] },
      { ...nbaChannels['NBA League Pass'] },
    ];
  }

  if (sport === 'nfl') {
    return [
      { ...nflChannels['RedeTV!'] },
      { ...nflChannels['ESPN'] },
      { ...nflChannels['NFL Game Pass'] },
    ];
  }

  return [];
}

export function getAvailableChannels(sport: string): StreamingChannel[] {
  const channels = sport === 'f1' ? f1Channels :
                   sport === 'nba' ? nbaChannels :
                   sport === 'nfl' ? nflChannels : {};

  return Object.values(channels);
}

export const scheduleLinks = {
  f1: 'https://ge.globo.com/motor/formula-1/guia-da-f1-2026/',
  nba: 'https://www.nba.com/schedule',
  nfl: 'https://www.nfl.com/schedules/',
};
