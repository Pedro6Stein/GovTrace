import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { keyframes } from '@emotion/react';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import DrawerRegistros from './DrawerRegistros';
import { iniciaisCredor, normalizarBusca } from './credor';
import { configArea } from '../abaCidade/areas';
import { formatarInteiro, formatarMoedaExtenso, formatarPercentual } from '../../utilitarios/formatadores';

/**
 * RankingFornecedores — aba "Exploração": quem mais recebeu no período.
 *
 * Organização pensada para o "teste da avó":
 *   - um toque na linha abre os registros (antes eram dois: expandir + botão)
 *   - busca pelo nome e filtro por área, para achar alguém sem rolar 500 linhas
 *   - lista curta (20) que cresce sob demanda
 *
 * Props:
 *   ranking             [{ id, nome, valorTotal, quantidade, atividade? }]
 *   dadosBrutos         registros do período (para o painel de registros)
 *   totais              { porEtapa.pago } — base da participação de cada um
 *   aoLocalizarEmpenho  (documento) => abre a Base de Lançamentos filtrada
 */

const PASSO = 20;

const subir = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// Ouro, prata e bronze para o pódio; os demais em cinza neutro
const PODIO = {
  1: { bg: '#C98B22', color: '#FFFFFF' },
  2: { bg: '#94A3B8', color: '#FFFFFF' },
  3: { bg: '#B45309', color: '#FFFFFF' },
};

function Posicao({ posicao }) {
  const s = PODIO[posicao] ?? { bg: '#EEF1F4', color: '#475569' };
  return (
    <Box
      aria-hidden
      sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: s.bg, color: s.color, display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums' }}
    >
      {posicao}º
    </Box>
  );
}

function LinhaFornecedor({ fornecedor, posicao, proporcao, participacao, animado, ordemEntrada, aoAbrir }) {
  const area = fornecedor.atividade?.area;
  const { cor } = configArea(area);

  return (
    <Box component="li" sx={{ listStyle: 'none', animation: ordemEntrada != null ? `${subir} 0.45s cubic-bezier(0.05, 0.7, 0.1, 1) ${ordemEntrada * 0.03}s both` : 'none' }}>
      <ButtonBase
        onClick={() => aoAbrir(fornecedor)}
        aria-label={`${posicao}º lugar, ${fornecedor.nome}, ${formatarMoedaExtenso(fornecedor.valorTotal)}. Ver registros.`}
        sx={{
          width: '100%',
          textAlign: 'left',
          px: { xs: 2, sm: 3 },
          py: { xs: 1.75, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: 'rgba(15,23,42,0.03)' },
          '&:hover .seta': { transform: 'translateX(3px)', color: 'primary.main' },
        }}
      >
        <Posicao posicao={posicao} />

        <Box
          aria-hidden
          sx={{ display: { xs: 'none', sm: 'grid' }, width: 40, height: 40, borderRadius: '12px', bgcolor: `${cor}1A`, color: cor, fontWeight: 800, fontSize: '0.875rem', placeItems: 'center', flexShrink: 0 }}
        >
          {iniciaisCredor(fornecedor.nome)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* No celular o valor desce para baixo do nome: lado a lado, o nome
              ficava espremido em pedaços de palavra */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'baseline' }}
            spacing={{ xs: 0.25, sm: 1.5 }}
          >
            <Typography
              sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word' }}
            >
              {fornecedor.nome}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.0625rem' }, fontWeight: 800, color: 'text.primary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {formatarMoedaExtenso(fornecedor.valorTotal)}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
            {area && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cor, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600 }}>{area}</Typography>
              </Stack>
            )}
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {formatarInteiro(fornecedor.quantidade)} {fornecedor.quantidade === 1 ? 'pagamento' : 'pagamentos'}
              {participacao != null && ` · ${formatarPercentual(participacao)} do valor pago`}
            </Typography>
          </Stack>

          {/* Barra relativa ao 1º colocado: compara os fornecedores entre si */}
          <Box aria-hidden sx={{ mt: 1, height: 6, borderRadius: '3px', bgcolor: '#EEF1F4', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${animado ? proporcao : 0}%`,
                minWidth: animado && proporcao > 0 ? 4 : 0,
                borderRadius: '3px',
                bgcolor: area ? cor : '#94A3B8',
                transition: 'width 0.7s cubic-bezier(0.05, 0.7, 0.1, 1)',
              }}
            />
          </Box>
        </Box>

        <ChevronRightRoundedIcon className="seta" aria-hidden sx={{ color: 'text.disabled', flexShrink: 0, transition: 'transform 0.2s ease, color 0.2s ease' }} />
      </ButtonBase>
    </Box>
  );
}

export default function RankingFornecedores({ ranking, dadosBrutos, totais, aoLocalizarEmpenho }) {
  const [busca, setBusca] = useState('');
  const [area, setArea] = useState(null);
  const [limite, setLimite] = useState(PASSO);
  const [selecionado, setSelecionado] = useState(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [animado, setAnimado] = useState(false);

  // Barras crescem a partir de zero a cada nova consulta
  useEffect(() => {
    setAnimado(false);
    const t = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(t);
  }, [ranking]);

  // Áreas presentes no ranking (só credores classificados pelo CNAE), da mais comum para a menos
  const areas = useMemo(() => {
    const contagem = new Map();
    for (const f of ranking ?? []) {
      const a = f.atividade?.area;
      if (a) contagem.set(a, (contagem.get(a) ?? 0) + 1);
    }
    return [...contagem.entries()].sort((a, b) => b[1] - a[1]);
  }, [ranking]);

  // Posição sempre a do ranking completo — filtrar não "promove" ninguém
  const filtrados = useMemo(() => {
    const termo = normalizarBusca(busca);
    return (ranking ?? [])
      .map((f, i) => ({ fornecedor: f, posicao: i + 1 }))
      .filter(({ fornecedor }) => (!area || fornecedor.atividade?.area === area) && (!termo || normalizarBusca(fornecedor.nome).includes(termo)));
  }, [ranking, busca, area]);

  if (!ranking?.length) return null;

  const maxValor = ranking[0].valorTotal || 1;
  const totalPeriodo = totais?.porEtapa?.pago ?? totais?.valorTotal;
  const visiveis = filtrados.slice(0, limite);
  const restantes = filtrados.length - visiveis.length;

  const abrir = (fornecedor) => {
    setSelecionado(fornecedor);
    setDrawerAberto(true);
  };
  const mudarBusca = (valor) => {
    setBusca(valor);
    setLimite(PASSO);
  };
  const mudarArea = (valor) => {
    setArea(valor);
    setLimite(PASSO);
  };

  return (
    <>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* ── Cabeçalho ───────────────────────────────────────────── */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
              <Box>
                <Typography component="h2" sx={{ fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
                  Quem mais recebeu no período
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.55 }}>
                  Pelo valor pago no mês, do maior para o menor. Órgãos públicos, bancos e folha de pagamento ficam de fora.
                  Toque em um nome para ver os registros oficiais.
                </Typography>
              </Box>
              <Chip
                label={`${formatarInteiro(ranking.length)} fornecedores`}
                sx={{ fontWeight: 700, bgcolor: 'rgba(162,0,0,0.08)', color: 'primary.main', flexShrink: 0 }}
              />
            </Stack>

            {/* ── Busca + filtro por área ───────────────────────────── */}
            <TextField
              value={busca}
              onChange={(e) => mudarBusca(e.target.value)}
              placeholder="Buscar fornecedor pelo nome"
              fullWidth
              size="small"
              inputProps={{ 'aria-label': 'Buscar fornecedor pelo nome' }}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.default' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: busca ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => mudarBusca('')} aria-label="Limpar busca">
                      <ClearRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            {areas.length > 0 && (
              <Stack
                direction="row"
                spacing={0.75}
                role="group"
                aria-label="Filtrar por área"
                sx={{
                  mt: 1.5,
                  flexWrap: { xs: 'nowrap', md: 'wrap' },
                  rowGap: 0.75,
                  overflowX: { xs: 'auto', md: 'visible' },
                  pb: { xs: 0.5, md: 0 },
                  mx: { xs: -2, sm: 0 },
                  px: { xs: 2, sm: 0 },
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                <Chip
                  label="Todas as áreas"
                  onClick={() => mudarArea(null)}
                  aria-pressed={!area}
                  color={!area ? 'primary' : 'default'}
                  variant={!area ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600, flexShrink: 0 }}
                />
                {areas.map(([nome, qtd]) => {
                  const ativo = area === nome;
                  const { cor } = configArea(nome);
                  return (
                    <Chip
                      key={nome}
                      label={`${nome} (${qtd})`}
                      onClick={() => mudarArea(ativo ? null : nome)}
                      aria-pressed={ativo}
                      variant={ativo ? 'filled' : 'outlined'}
                      icon={<Box component="span" aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ativo ? '#FFFFFF' : cor, ml: '10px !important' }} />}
                      sx={{ fontWeight: 600, flexShrink: 0, ...(ativo && { bgcolor: cor, color: '#FFFFFF', '&:hover': { bgcolor: cor } }) }}
                    />
                  );
                })}
              </Stack>
            )}

            <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 1.75 }}>
              <InfoOutlinedIcon aria-hidden sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.5 }}>
                Estar nesta lista mostra só quem recebeu recursos, <strong>não significa irregularidade</strong>.
              </Typography>
            </Stack>
          </Box>

          {/* ── Lista ───────────────────────────────────────────────── */}
          {visiveis.length === 0 ? (
            <Box sx={{ px: 3, py: 6, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>Nenhum fornecedor encontrado</Typography>
              <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary' }}>
                Tente outro nome ou escolha "Todas as áreas".
              </Typography>
            </Box>
          ) : (
            <Box
              component="ol"
              aria-label="Fornecedores, do que mais recebeu para o que menos recebeu"
              sx={{ m: 0, p: 0, borderTop: '1px solid', borderColor: 'divider', '& > li + li': { borderTop: '1px solid', borderColor: 'divider' } }}
            >
              {visiveis.map(({ fornecedor, posicao }, i) => (
                <LinhaFornecedor
                  key={fornecedor.id}
                  fornecedor={fornecedor}
                  posicao={posicao}
                  proporcao={Math.max((fornecedor.valorTotal / maxValor) * 100, 0)}
                  participacao={totalPeriodo > 0 ? (fornecedor.valorTotal / totalPeriodo) * 100 : null}
                  animado={animado}
                  ordemEntrada={i < PASSO ? i : null}
                  aoAbrir={abrir}
                />
              ))}
            </Box>
          )}

          {/* ── Rodapé ──────────────────────────────────────────────── */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFC' }}
          >
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Mostrando {formatarInteiro(visiveis.length)} de {formatarInteiro(filtrados.length)}
              {filtrados.length !== ranking.length && ` (filtrado de ${formatarInteiro(ranking.length)})`}
            </Typography>
            {restantes > 0 && (
              <Button onClick={() => setLimite((l) => l + PASSO)} endIcon={<ExpandMoreRoundedIcon />} sx={{ fontWeight: 600, minHeight: 40 }}>
                Mostrar mais {Math.min(PASSO, restantes)}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <DrawerRegistros
        aberto={drawerAberto}
        aoFechar={() => setDrawerAberto(false)}
        fornecedor={selecionado}
        despesas={dadosBrutos}
        aoLocalizarEmpenho={aoLocalizarEmpenho}
      />
    </>
  );
}
