import React from 'react';

// Mapeamento de nacionalidade para código ISO do país
const nationalityToCode: Record<string, string> = {
  'British': 'gb',
  'Dutch': 'nl',
  'Monegasque': 'mc',
  'Spanish': 'es',
  'Australian': 'au',
  'German': 'de',
  'French': 'fr',
  'Mexican': 'mx',
  'Canadian': 'ca',
  'Japanese': 'jp',
  'Thai': 'th',
  'Finnish': 'fi',
  'Danish': 'dk',
  'Chinese': 'cn',
  'American': 'us',
  'Italian': 'it',
  'Brazilian': 'br',
  'New Zealander': 'nz',
  'Argentine': 'ar',
  'Polish': 'pl',
  'Russian': 'ru',
  'Belgian': 'be',
  'Swiss': 'ch',
  'Austrian': 'at',
  'Swedish': 'se',
  'Norwegian': 'no',
  'South African': 'za',
  'Indian': 'in',
  'Indonesian': 'id',
  'Venezuelan': 've',
  'Colombian': 'co',
  'Portuguese': 'pt',
  'Korean': 'kr',
  Australia: 'au',
  China: 'cn',
  Japan: 'jp',
  USA: 'us',
  'United States': 'us',
  Canada: 'ca',
  Monaco: 'mc',
  Spain: 'es',
  Austria: 'at',
  UK: 'gb',
  'United Kingdom': 'gb',
  'Great Britain': 'gb',
  Belgium: 'be',
  Hungary: 'hu',
  Netherlands: 'nl',
  Italy: 'it',
  Azerbaijan: 'az',
  Malaysia: 'my',
  Singapore: 'sg',
  Mexico: 'mx',
  Brazil: 'br',
  Qatar: 'qa',
  UAE: 'ae',
  'United Arab Emirates': 'ae',
  'Saudi Arabia': 'sa',
  Bahrain: 'bh',
  Portugal: 'pt',
  France: 'fr',
  Germany: 'de',
  Turkey: 'tr',
  Russia: 'ru',
};

interface CountryFlagProps {
  nationality: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CountryFlag({ nationality, size = 'md', className = '' }: CountryFlagProps) {
  const code = nationalityToCode[nationality]?.toLowerCase() || '';
  if (!code) {
    return <span className={`text-xs font-semibold text-white ${className}`}>{nationality}</span>;
  }
  
  const sizeClasses = {
    sm: 'w-5 h-4',
    md: 'w-6 h-5',
    lg: 'w-8 h-6',
  };

  // Usando flagcdn.com para as imagens das bandeiras
  const flagUrl = `https://flagcdn.com/w40/${code}.png`;

  return (
    <img
      src={flagUrl}
      alt={nationality}
      title={nationality}
      className={`inline-block rounded-sm object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // Fallback para código do país se a imagem falhar
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.parentElement?.insertAdjacentHTML('beforeend', 
          `<span class="text-xs text-slate-400 font-medium">${code.toUpperCase()}</span>`
        );
      }}
    />
  );
}

export default CountryFlag;
