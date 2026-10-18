import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertCircle, ExternalLink, Code, Database, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function F1Integration() {
  const [showIntegrationGuide, setShowIntegrationGuide] = useState(false);

  const apiOptions = [
    {
      name: 'Ergast API',
      url: 'http://ergast.com/mrd/',
      description: 'API gratuita com dados históricos completos da F1 (1950-2023)',
      pros: ['Gratuita', 'Dados históricos completos', 'Bem documentada', 'JSON/XML'],
      cons: ['Dados apenas até 2023', 'Não tem dados ao vivo', 'Limitada para temporada atual'],
      endpoints: [
        '/f1/current/drivers.json - Pilotos da temporada atual',
        '/f1/current/constructors.json - Equipes atuais',
        '/f1/current/races.json - Calendário de corridas',
        '/f1/2024/results.json - Resultados da temporada'
      ]
    },
    {
      name: 'OpenF1 API',
      url: 'https://openf1.org/',
      description: 'API moderna com dados em tempo real da F1',
      pros: ['Dados em tempo real', 'Telemetria detalhada', 'Dados atuais', 'WebSocket support'],
      cons: ['Pode requerer registro', 'Documentação limitada', 'Menos dados históricos'],
      endpoints: [
        '/v1/sessions - Sessões de corrida',
        '/v1/drivers - Informações dos pilotos',
        '/v1/meetings - Informações dos GPs',
        '/v1/position - Posições em tempo real'
      ]
    },
    {
      name: 'Formula 1 Official API',
      url: 'https://www.formula1.com/',
      description: 'API oficial da F1 (não pública)',
      pros: ['Dados oficiais', 'Tempo real', 'Dados completos'],
      cons: ['Não pública', 'Requer parceria', 'Custo elevado'],
      endpoints: ['Acesso restrito - necessário contato com F1']
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: 'Escolher API',
      description: 'Selecione a API que melhor atende suas necessidades (Ergast para dados históricos, OpenF1 para tempo real)'
    },
    {
      step: 2,
      title: 'Configurar Fetch',
      description: 'Implemente funções para buscar dados das APIs escolhidas'
    },
    {
      step: 3,
      title: 'Cache Local',
      description: 'Implemente cache local para otimizar performance e reduzir chamadas à API'
    },
    {
      step: 4,
      title: 'Update em Tempo Real',
      description: 'Configure intervalos de atualização para dados ao vivo durante corridas'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integração com Dados Reais da Fórmula 1
          </CardTitle>
          <CardDescription>
            Atualmente usando dados mock. Veja como integrar com APIs reais da F1.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dados Mock Atuais</AlertTitle>
            <AlertDescription>
              Esta aplicação está usando dados simulados baseados na temporada 2024/2025 da F1.
              Para dados reais, siga as instruções de integração abaixo.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={() => setShowIntegrationGuide(!showIntegrationGuide)}
            variant="outline"
            className="mb-4"
          >
            {showIntegrationGuide ? 'Ocultar' : 'Ver'} Guia de Integração
          </Button>

          {showIntegrationGuide && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  APIs Disponíveis
                </h4>
                <div className="grid gap-4">
                  {apiOptions.map((api, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{api.name}</h5>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={api.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{api.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs font-medium text-green-700 mb-1">Vantagens:</p>
                            <ul className="text-xs space-y-1">
                              {api.pros.map((pro, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-red-700 mb-1">Limitações:</p>
                            <ul className="text-xs space-y-1">
                              {api.cons.map((con, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium mb-2">Endpoints principais:</p>
                          <div className="space-y-1">
                            {api.endpoints.map((endpoint, i) => (
                              <Badge key={i} variant="secondary" className="text-xs mr-1 mb-1">
                                {endpoint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Passos para Implementação
                </h4>
                <div className="space-y-3">
                  {implementationSteps.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {item.step}
                      </div>
                      <div>
                        <h5 className="font-medium text-sm">{item.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Exemplo de Implementação
                </h5>
                <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`// services/f1Service.ts
export const fetchF1Standings = async () => {
  try {
    const response = await fetch(
      'https://ergast.com/api/f1/current/driverStandings.json'
    );
    const data = await response.json();
    return data.MRData.StandingsTable.StandingsLists[0];
  } catch (error) {
    console.error('Erro ao buscar classificação:', error);
    return null;
  }
};

// Hook personalizado
export const useF1Data = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchF1Standings();
      if (data) setStandings(data.DriverStandings);
      setLoading(false);
    };
    loadData();
  }, []);

  return { standings, loading };
};`}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}