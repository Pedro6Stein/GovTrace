import { Suspense, lazy, useState } from 'react';
import { Box, Card, CardContent, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

import ChipStatus from './ChipStatus';
import TrilhaEmpenho from './TrilhaEmpenho';
import { LIMITE_CR5, MOTOR_CONFIG, explicarCena, extrairMetrica } from './motores';
import CenaAgrupamento from './cenas/CenaAgrupamento';
import CenaBalanca from './cenas/CenaBalanca';
import CenaBenford from './cenas/CenaBenford';
import CenaCurvaNormal from './cenas/CenaCurvaNormal';
import CenaGradeCR5 from './cenas/CenaGradeCR5';
import ContornoErro from '../ContornoErro';
import ExplicacaoCidada from '../ExplicacaoCidada';
import BotaoProvaMatematica from '../ProvaMatematica';

// html-to-image só entra no bundle de quem clica em "Compartilhar"
const DialogoCompartilhar = lazy(() => import('./DialogoCompartilhar'));

/**
 * CartaoCena — uma pergunta, uma cena animada e a explicação ao lado.
 *
 * Ordem de leitura pensada para o "teste da avó": a pergunta em português
 * comum, a cena, "como ler esta cena" com os números reais e, por fim, o
 * rastro dos documentos públicos para quem quiser conferir.
 *
 * Props:
 *   tipo     chave do motor (ver ORDEM_MOTORES)
 *   dados    resultado do motor na GovTrace API
 *   trilha   modelo de exibição já pseudonimizado (rastro.js)
 *   extras   { zDestaques } — dados derivados para a cena
 *   filtros  { municipio, ano, mes }
 *   acoes    { localizar, copiarEAbrir }
 */
export default function CartaoCena({ tipo, dados, trilha, extras, filtros, acoes }) {
  const [repeticao, setRepeticao] = useState(0);
  const [compartilharAberto, setCompartilharAberto] = useState(false);

  const cfg = MOTOR_CONFIG[tipo];
  if (!dados || !cfg) return null;

  const { Icone } = cfg;
  const destaque = Boolean(dados.alerta);
  const metrica = extrairMetrica(tipo, dados);
  const paragrafos = explicarCena(tipo, dados);
  const idTitulo = `cena-${tipo}-titulo`;

  return (
    <Card
      component="article"
      aria-labelledby={idTitulo}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': { transform: 'none', boxShadow: 'none' },
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 3 }, '&:last-child': { pb: { xs: 2.25, sm: 3 } } }}>
        {/* ── Cabeçalho ───────────────────────────────────────────────────
            Linha 1: ícone (só a partir do tablet), rótulo + status, ações.
            Linha 2: título em largura total — no celular, ícone + ações dos
            dois lados espremiam o título numa coluna de 3 palavras. */}
        <Stack direction="row" spacing={1.75} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: cfg.fundo,
              border: '1px solid',
              borderColor: `${cfg.cor}22`,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icone aria-hidden sx={{ fontSize: 22, color: cfg.cor }} />
          </Box>

          <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap" gap={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
              {cfg.rotulo}
            </Typography>
            <ChipStatus destaque={destaque} />
          </Stack>

          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
            <Tooltip title="Repetir animação">
              <IconButton size="small" aria-label={`Repetir a animação: ${cfg.titulo}`} onClick={() => setRepeticao((n) => n + 1)} sx={{ color: 'text.secondary' }}>
                <ReplayRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compartilhar este resultado">
              <IconButton size="small" aria-label={`Compartilhar: ${cfg.titulo}`} onClick={() => setCompartilharAberto(true)} sx={{ color: 'text.secondary' }}>
                <ShareRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Typography
          id={idTitulo}
          component="h3"
          sx={{ mt: 1, fontSize: '1.1875rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}
        >
          {cfg.titulo}
        </Typography>

        <Typography sx={{ mt: 0.75, fontSize: '1rem', color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.5 }}>
          {cfg.pergunta}
        </Typography>

        {/* ── Cena + "como ler" lado a lado (empilha no celular) ──────── */}
        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
            gap: { xs: 2.5, md: 3 },
            alignItems: 'start',
          }}
        >
          <Box key={repeticao} sx={{ minWidth: 0 }}>
            <Cena tipo={tipo} dados={dados} trilha={trilha} extras={extras} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            {metrica && (
              <Box>
                <Typography
                  component="p"
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: destaque ? '#92400E' : 'text.primary',
                  }}
                >
                  {metrica.valor}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.45 }}>
                  {metrica.legenda}
                </Typography>
              </Box>
            )}

            <Typography component="h4" sx={{ mt: 2.5, mb: 0.75, fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
              Como ler esta cena
            </Typography>
            {paragrafos.map((texto) => (
              <Typography key={texto} sx={{ fontSize: '1rem', color: 'text.secondary', lineHeight: 1.65, mb: 1.25 }}>
                {texto}
              </Typography>
            ))}

            <BotaoProvaMatematica tipo={tipo} dados={dados} />
          </Box>
        </Box>

        {/* ── Rastro dos documentos públicos ──────────────────────────── */}
        <TrilhaEmpenho tipo={tipo} trilha={trilha} acoes={acoes} />

        <ExplicacaoCidada rotulo="Como a conta é feita">
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {cfg.descricaoMetodo}
          </Typography>
        </ExplicacaoCidada>
      </CardContent>

      {compartilharAberto && (
        <ContornoErro mensagem="Não foi possível gerar a imagem para compartilhar.">
          <Suspense fallback={null}>
            <DialogoCompartilhar
              aberto={compartilharAberto}
              aoFechar={() => setCompartilharAberto(false)}
              tipo={tipo}
              dados={dados}
              filtros={filtros}
            />
          </Suspense>
        </ContornoErro>
      )}
    </Card>
  );
}

function Cena({ tipo, dados, trilha, extras }) {
  switch (tipo) {
    case 'zScore':
      return <CenaCurvaNormal limite={dados.estatisticas?.limite ?? 4} zDestaques={extras?.zDestaques ?? []} />;
    case 'benford':
      return <CenaBenford frequencias={dados.frequencias} digitoDestaque={dados.digitoSuspeito ?? null} />;
    case 'fracionamento':
      return <CenaAgrupamento grupos={trilha ?? []} />;
    case 'monopolio':
      return <CenaBalanca areas={(trilha ?? []).map(({ area, percentual }) => ({ area, percentual }))} />;
    case 'concentracao':
      return <CenaGradeCR5 percentual={dados.percentual} destaque={Boolean(dados.alerta)} limite={LIMITE_CR5} />;
    default:
      return null;
  }
}
