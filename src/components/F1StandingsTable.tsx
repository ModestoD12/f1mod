import { useState } from 'react';
import { Crown, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useF1Standings } from '../hooks/useF1Standings';
import { f1StandingsApi } from '../services/f1StandingsService';
import { CountryFlag } from './CountryFlag';
import './standings-table.css';

export function F1StandingsTable() {
  const [championship, setChampionship] = useState<'drivers' | 'constructors'>('drivers');
  const {
    driverStandings,
    constructorStandings,
    seasonYear,
    round,
    loading,
    refreshing,
    error,
    championDriverId,
    championConstructorId,
    refetch,
  } = useF1Standings();

  const champion = driverStandings.find((standing) => standing.driver.driverId === championDriverId);
  const championTeam = constructorStandings.find((standing) => standing.constructor.constructorId === championConstructorId);

  if (loading) {
    return (
      <section className="standings">
        <div className="standings__status">
          <Loader2 className="standings__spin" />
          <span>Carregando classificação</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="standings">
        <div className="standings__status">
          <AlertCircle />
          <p>{error}</p>
          <button type="button" className="standings__refresh" onClick={refetch}>
            <RefreshCw />
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="standings">
      <header className="standings__head">
        <div>
          <p className="prndl-kicker">Fórmula 1</p>
          <h2>Classificação</h2>
          <p className="standings__meta">
            {championship === 'drivers' ? 'Pilotos' : 'Equipes'}
            {seasonYear ? ` · ${seasonYear}` : ''}
            {round ? ` · após a etapa ${round}` : ''}
            {refreshing ? ' · atualizando' : ''}
          </p>
        </div>
        <button type="button" className="standings__icon-button" onClick={refetch} aria-label="Atualizar classificação">
          <RefreshCw />
        </button>
      </header>

      <div className="standings__switch" role="tablist" aria-label="Campeonato">
        <button
          type="button"
          role="tab"
          aria-selected={championship === 'drivers'}
          className={championship === 'drivers' ? 'is-active' : ''}
          onClick={() => setChampionship('drivers')}
        >
          Pilotos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={championship === 'constructors'}
          className={championship === 'constructors' ? 'is-active' : ''}
          onClick={() => setChampionship('constructors')}
        >
          Equipes
        </button>
      </div>

      {championship === 'drivers' && champion ? (
        <p className="standings__champion-note">
          <Crown />
          {champion.driver.givenName} {champion.driver.familyName} é campeão mundial. Os pontos que ainda restam não alcançam o líder.
        </p>
      ) : null}
      {championship === 'constructors' && championTeam ? (
        <p className="standings__champion-note">
          <Crown />
          {championTeam.constructor.name} é campeã mundial. Os pontos que ainda restam não alcançam a líder.
        </p>
      ) : null}

      {championship === 'drivers' ? (
        <div className="standings__table-wrap">
          <table className="standings__table">
            <thead>
              <tr>
                <th>Pos</th>
                <th className="standings-col-extra">Nº</th>
                <th className="standings__logo-col" aria-label="Equipe" />
                <th>Piloto</th>
                <th className="standings-col-extra">Equipe</th>
                <th className="standings-col-extra">Vitórias</th>
                <th className="standings__points-head">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {driverStandings.map((standing) => {
                const constructorId = standing.constructors[0]?.constructorId;
                const teamColor = constructorId ? f1StandingsApi.getTeamColor(constructorId) : '#666';
                const teamLogo = constructorId ? f1StandingsApi.getTeamLogo(constructorId) : null;
                const isChampion = standing.driver.driverId === championDriverId;

                return (
                  <tr key={standing.driver.driverId} className={isChampion ? 'is-champion' : ''}>
                    <td>
                      <span className={`standings__pos${standing.position === 1 ? ' is-leader' : ''}`}>
                        {standing.position}
                      </span>
                    </td>
                    <td className="standings-col-extra">
                      <span className="standings__number">{standing.driver.permanentNumber || '–'}</span>
                    </td>
                    <td className="standings__logo-col">
                      {teamLogo ? (
                        <img className="standings__logo" src={teamLogo} alt="" />
                      ) : (
                        <i className="standings__logo-fallback" style={{ backgroundColor: teamColor }} />
                      )}
                    </td>
                    <td>
                      <div className="standings__driver">
                        <CountryFlag nationality={standing.driver.nationality} size="md" />
                        <div>
                          <span className="standings-name-full">
                            {standing.driver.givenName} {standing.driver.familyName}
                          </span>
                          <span className="standings-name-code">
                            {standing.driver.code || standing.driver.familyName}
                          </span>
                          {standing.driver.code ? (
                            <span className="standings-code-desktop">{standing.driver.code}</span>
                          ) : null}
                          {isChampion ? (
                            <span className="standings__crown" title="Campeão mundial">
                              <Crown />
                              Campeão
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="standings-col-extra">
                      <span className="standings__team">
                        <i style={{ backgroundColor: teamColor }} />
                        {standing.constructors[0]?.name || '–'}
                      </span>
                    </td>
                    <td className="standings-col-extra">{standing.wins}</td>
                    <td className="standings__points">{standing.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="standings__table-wrap">
          <table className="standings__table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Equipe</th>
                <th>Vitórias</th>
                <th className="standings__points-head">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {constructorStandings.map((standing) => {
                const teamColor = f1StandingsApi.getTeamColor(standing.constructor.constructorId);
                const teamLogo = f1StandingsApi.getTeamLogo(standing.constructor.constructorId);
                const isChampion = standing.constructor.constructorId === championConstructorId;
                return (
                  <tr key={standing.constructor.constructorId} className={isChampion ? 'is-champion' : ''}>
                    <td>
                      <span className={`standings__pos${standing.position === 1 ? ' is-leader' : ''}`}>
                        {standing.position}
                      </span>
                    </td>
                    <td>
                      <span className="standings__team">
                        {teamLogo ? (
                          <img className="standings__logo" src={teamLogo} alt="" />
                        ) : (
                          <i style={{ backgroundColor: teamColor }} />
                        )}
                        <CountryFlag nationality={standing.constructor.nationality} size="md" />
                        {standing.constructor.name}
                        {isChampion ? (
                          <span className="standings__crown" title="Campeã mundial">
                            <Crown />
                            Campeã
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td>{standing.wins}</td>
                    <td className="standings__points">{standing.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default F1StandingsTable;
