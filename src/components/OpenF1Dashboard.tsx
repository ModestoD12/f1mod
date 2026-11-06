import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useF1Telemetry } from '../hooks/useF1Telemetry';
import { F1TimingBoard } from './F1TimingBoard';
import { LiveDataGate } from './LiveDataGate';
import './live-timing.css';

export function OpenF1Dashboard() {
  return (
    <LiveDataGate>
      <LiveBoard />
    </LiveDataGate>
  );
}

function LiveBoard() {
  const telemetry = useF1Telemetry();
  const { session, loading, error, refetch } = telemetry;

  if (loading && !session) {
    return (
      <section className="live-timing">
        <p className="live-timing__loading">
          <Loader2 className="live-timing__icon-button" />
          Carregando telemetria
        </p>
      </section>
    );
  }

  if (error && !session) {
    return (
      <section className="live-timing">
        <div className="live-timing__empty">
          <AlertCircle />
          <p>{error}</p>
          <button type="button" className="live-timing__status" onClick={refetch}>
            <RefreshCw />
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  return (
    <F1TimingBoard
      session={session}
      drivers={telemetry.drivers}
      laps={telemetry.laps}
      stints={telemetry.stints}
      positions={telemetry.positions}
      loading={loading}
      error={error}
      onRefresh={refetch}
    />
  );
}

export default OpenF1Dashboard;
