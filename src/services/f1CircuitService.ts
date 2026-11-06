const BASE_URL = 'https://f1api.dev/api/circuits';

const ALIASES: Record<string, string> = {
  villeneuve: 'gilles_villeneuve',
  catalunya: 'montmelo',
  americas: 'austin',
  rodriguez: 'hermanos_rodriguez',
  losail: 'lusail',
  sakhir: 'bahrain',
  las_vegas: 'vegas',
};

export interface CircuitFacts {
  circuitId: string;
  circuitName: string;
  city: string;
  country: string;
  lengthMeters: number | null;
  corners: number | null;
  lapRecord: string | null;
  recordYear: number | null;
}

const cache = new Map<string, CircuitFacts | null>();

function formatRecord(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parts = value.split(':');
  if (parts.length === 3) return `${parts[0]}:${parts[1]}.${parts[2].padStart(3, '0')}`;
  return value;
}

function asCircuit(payload: unknown): CircuitFacts | null {
  if (!payload || typeof payload !== 'object') return null;
  const list = (payload as { circuit?: unknown }).circuit;
  const raw = Array.isArray(list) ? list[0] : list;
  if (!raw || typeof raw !== 'object') return null;
  const circuit = raw as Record<string, unknown>;
  return {
    circuitId: String(circuit.circuitId || ''),
    circuitName: String(circuit.circuitName || ''),
    city: String(circuit.city || ''),
    country: String(circuit.country || ''),
    lengthMeters: typeof circuit.circuitLength === 'number' ? circuit.circuitLength : null,
    corners: typeof circuit.numberOfCorners === 'number' ? circuit.numberOfCorners : null,
    lapRecord: formatRecord(circuit.lapRecord),
    recordYear: typeof circuit.fastestLapYear === 'number' ? circuit.fastestLapYear : null,
  };
}

function hasFacts(facts: CircuitFacts | null) {
  return !!(facts && (facts.lengthMeters || facts.corners || facts.lapRecord));
}

async function fetchCircuit(id: string): Promise<CircuitFacts | null> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`);
  if (!response.ok) return null;
  return asCircuit(await response.json());
}

export function formatCircuitLength(meters: number | null) {
  if (!meters) return '—';
  return `${(meters / 1000).toFixed(3)} km`;
}

export async function getCircuitFacts(circuitId: string): Promise<CircuitFacts | null> {
  if (cache.has(circuitId)) return cache.get(circuitId) ?? null;

  const primary = await fetchCircuit(circuitId);
  const alias = ALIASES[circuitId];
  const facts = hasFacts(primary) || !alias ? primary : (await fetchCircuit(alias)) || primary;
  cache.set(circuitId, facts);
  return facts;
}
