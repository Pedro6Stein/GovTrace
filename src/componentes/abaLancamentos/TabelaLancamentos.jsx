import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { keyframes } from '@emotion/react';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';
import LinhaEtapas from '../abaExploracao/LinhaEtapas';
import { ETAPAS_DO_DINHEIRO, agruparEmpenhosDoCredor, normalizarBusca } from '../abaExploracao/credor';
import { formatarInteiro, formatarMoeda } from '../../utilitarios/formatadores';

/**
 * TabelaLancamentos — Base de Lançamentos: todos os registros oficiais do
 * TCE-SP do período, um a um.
 *
 * Mesma organização da Exploração: um cartão só, de cima para baixo —
 * busca, filtro por etapa, resumo da seleção, lista e "Mostrar mais".
 * No computador a lista é uma tabela; no celular, um cartão por registro
 * (seis colunas não cabem numa tela de 360px sem rolagem lateral).
 *
 * O mesmo documento aparece uma vez por etapa (empenho, liquidação,
 * pagamento). Por isso a soma dos valores só aparece com UMA etapa
 * escolhida: somar etapas diferentes contaria o mesmo dinheiro mais de
 * uma vez.
 *
 * Props:
 *   despesas            registros normalizados
 *   empenhoEmFoco       número de empenho vindo do Laboratório ou da
 *                       Exploração; filtra pelo número EXATO, com todas as
 *                       etapas daquele documento
 *   aoLocalizarEmpenho  (documento) => coloca um empenho em foco
 *   aoLimparEmpenho     () => remove o filtro de empenho
 */

const PASSO = 25;
const SEM_DOCUMENTO = 'Sem documento';

const ETAPAS = [
  ...ETAPAS_DO_DINHEIRO,
  { evento: 'Reforço', rotulo: 'Reforço', cor: '#B45309', fundo: '#FEF3C7', texto: '#B45309' },
  { evento: 'Anulação', rotulo: 'Anulação', cor: '#B91C1C', fundo: '#FEE2E2', texto: '#B91C1C' },
];
const ETAPA_POR_EVENTO = Object.fromEntries(ETAPAS.map((e) => [e.evento, e]));
const etapaDe = (evento) =>
  ETAPA_POR_EVENTO[evento] ?? { evento, rotulo: evento || 'Outro', cor: '#64748B', fundo: '#F1F5F9', texto: '#475569' };

// "Soma dos empenhos" / "Soma das liquidações"
const SOMA_DE = {
  Empenhado: 'dos empenhos',
  Liquidado: 'das liquidações',
  Pago: 'dos pagamentos',
  Reforço: 'dos reforços',
  Anulação: 'das anulações',
};

const EXPLICACAO_ETAPA = {
  Empenhado: 'o dinheiro é reservado no orçamento para uma despesa.',
  Liquidado: 'a prefeitura confirma que o serviço ou produto foi entregue.',
  Pago: 'o dinheiro sai do caixa para o fornecedor.',
  Reforço: 'um valor a mais é somado a um empenho que já existia.',
  Anulação: 'parte de um empenho é cancelada; aparece com valor negativo.',
};

/** "dd/mm/aaaa" → aaaammdd (0 quando a data não veio) */
const chaveData = (data) => {
  const [d, m, a] = String(data ?? '').split('/');
  const n = Number(`${a}${m}${d}`);
  return Number.isFinite(n) ? n : 0;
};

const ORDENACOES = [
  { id: 'recentes', rotulo: 'Mais recentes', comparar: (a, b) => chaveData(b.data) - chaveData(a.data) },
  { id: 'antigos', rotulo: 'Mais antigos', comparar: (a, b) => chaveData(a.data) - chaveData(b.data) },
  { id: 'maiorValor', rotulo: 'Maior valor', comparar: (a, b) => (Number(b.valor) || 0) - (Number(a.valor) || 0) },
];

const subir = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;
// Cada lote de PASSO linhas entra em cascata; as que já estavam na tela não repetem
const entrada = (i) => ({ animation: `${subir} 0.35s cubic-bezier(0.05, 0.7, 0.1, 1) ${(i % PASSO) * 0.02}s both` });

const fonteDocumento = 'ui-monospace, "Cascadia Mono", Consolas, monospace';

// ─── Peças pequenas ──────────────────────────────────────────────────────────
function SeloEtapa({ evento }) {
  const e = etapaDe(evento);
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.25, borderRadius: '999px', bgcolor: e.fundo, color: e.texto, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}
    >
      <Box component="span" aria-hidden sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: e.cor }} />
      {e.rotulo}
    </Box>
  );
}

/** Número do documento; clicável quando dá para ver todas as etapas dele. */
function Documento({ documento, aoFocar, prefixo = '' }) {
  const valido = documento && documento !== SEM_DOCUMENTO;
  const estilo = { fontFamily: fonteDocumento, fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap' };

  if (!valido || !aoFocar) {
    return (
      <Typography component="span" sx={{ ...estilo, color: valido ? 'text.primary' : 'text.disabled' }}>
        {valido ? `${prefixo}${documento}` : 'Sem número'}
      </Typography>
    );
  }
  return (
    <ButtonBase
      onClick={() => aoFocar(documento)}
      title="Ver todas as etapas deste empenho"
      aria-label={`Empenho ${documento}: ver todas as etapas`}
      sx={{
        ...estilo,
        color: 'primary.main',
        borderRadius: '6px',
        px: 0.5,
        mx: -0.5,
        textUnderlineOffset: '3px',
        '&:hover': { textDecoration: 'underline' },
        '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      {prefixo}
      {documento}
    </ButtonBase>
  );
}

function FiltroEtapa({ rotulo, quantidade, cor, fundo, texto, ativo, aoClicar }) {
  return (
    <ButtonBase
      onClick={aoClicar}
      aria-pressed={ativo}
      sx={{
        flexShrink: 0,
        minWidth: { xs: 118, md: 132 },
        px: 1.5,
        py: 1,
        borderRadius: '12px',
        border: '1.5px solid',
        borderColor: ativo ? cor : 'divider',
        bgcolor: ativo ? fundo : 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
        '&:hover': { borderColor: cor, boxShadow: '0 6px 14px -10px rgba(15,23,42,0.45)' },
        '&:active': { transform: 'scale(0.97)' },
        '&.Mui-focusVisible': { outline: '2px solid', outlineColor: cor, outlineOffset: 2 },
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cor }} />
        <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 700, color: ativo ? texto : 'text.primary' }}>
          {rotulo}
        </Typography>
      </Stack>
      <Typography component="span" sx={{ mt: 0.25, fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
        {formatarInteiro(quantidade)} {quantidade === 1 ? 'registro' : 'registros'}
      </Typography>
    </ButtonBase>
  );
}

// ─── Empenho em foco: o documento e o caminho que ele percorreu ─────────────
function EmpenhoEmFoco({ documento, grupo, aoLimpar }) {
  return (
    <Box
      component="section"
      aria-label={`Empenho em foco: ${documento}`}
      sx={{
        mt: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: '16px',
        bgcolor: 'rgba(162,0,0,0.035)',
        border: '1px solid rgba(162,0,0,0.16)',
        animation: `${subir} 0.45s cubic-bezier(0.05, 0.7, 0.1, 1) both`,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box aria-hidden sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'primary.main', color: '#FFFFFF', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <ReceiptLongRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Empenho em foco
            </Typography>
            <Typography sx={{ fontFamily: fonteDocumento, fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', overflowWrap: 'anywhere' }}>
              {documento}
            </Typography>
            {grupo?.orgao && (
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.4 }}>{grupo.orgao}</Typography>
            )}
          </Box>
        </Stack>
        <Button variant="outlined" size="small" startIcon={<CloseRoundedIcon />} onClick={aoLimpar} sx={{ fontWeight: 600, minHeight: 38, flexShrink: 0 }}>
          Ver todos os lançamentos
        </Button>
      </Stack>

      {grupo && (
        <Box sx={{ mt: 2, maxWidth: 440 }}>
          <LinhaEtapas etapas={grupo.etapas} animar />
        </Box>
      )}
      <Typography sx={{ mt: 1, fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.5 }}>
        Abaixo estão todas as linhas deste documento no período, uma por etapa.
      </Typography>
    </Box>
  );
}

// ─── Linhas: tabela (computador) e cartões (celular) ────────────────────────
const estiloCabecalho = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  bgcolor: '#FAFBFC',
  borderColor: 'divider',
  py: 1.25,
  whiteSpace: 'nowrap',
};

function TabelaRegistros({ linhas, aoFocar }) {
  return (
    <Table
      size="small"
      aria-label="Lançamentos oficiais do período"
      sx={{
        tableLayout: 'fixed',
        '& th:first-of-type, & td:first-of-type': { pl: 3 },
        '& th:last-of-type, & td:last-of-type': { pr: 3 },
        '& td': { py: 1.25, borderColor: 'divider' },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...estiloCabecalho, width: 148 }}>Etapa</TableCell>
          <TableCell sx={{ ...estiloCabecalho, width: 104 }}>Data</TableCell>
          <TableCell sx={{ ...estiloCabecalho, width: 150 }}>Documento</TableCell>
          <TableCell sx={estiloCabecalho}>Fornecedor</TableCell>
          <TableCell sx={{ ...estiloCabecalho, width: '24%' }}>Órgão</TableCell>
          <TableCell align="right" sx={{ ...estiloCabecalho, width: 150 }}>Valor</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {linhas.map((linha, i) => {
          const negativo = (Number(linha.valor) || 0) < 0;
          return (
            <TableRow key={linha._id} hover sx={{ ...entrada(i), '&:last-child td': { borderBottom: 0 } }}>
              <TableCell>
                <SeloEtapa evento={linha.evento} />
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                {linha.data || '—'}
              </TableCell>
              <TableCell>
                <Documento documento={linha.documento} aoFocar={aoFocar} />
              </TableCell>
              <TableCell title={linha.fornecedorNome} sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {linha.fornecedorNome}
              </TableCell>
              <TableCell title={linha.orgao} sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {linha.orgao}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '0.875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: negativo ? 'error.main' : 'text.primary' }}>
                {formatarMoeda(linha.valor)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function ListaRegistros({ linhas, aoFocar }) {
  return (
    <Box component="ul" aria-label="Lançamentos oficiais do período" sx={{ m: 0, p: 0, '& > li + li': { borderTop: '1px solid', borderColor: 'divider' } }}>
      {linhas.map((linha, i) => {
        const negativo = (Number(linha.valor) || 0) < 0;
        return (
          <Box component="li" key={linha._id} sx={{ listStyle: 'none', px: 2, py: 1.75, ...entrada(i) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <SeloEtapa evento={linha.evento} />
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{linha.data}</Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: negativo ? 'error.main' : 'text.primary' }}>
                {formatarMoeda(linha.valor)}
              </Typography>
            </Stack>
            <Typography
              sx={{ mt: 0.75, fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word' }}
            >
              {linha.fornecedorNome}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {linha.orgao}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Documento documento={linha.documento} aoFocar={aoFocar} prefixo="Empenho nº " />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function TabelaLancamentos({ despesas, empenhoEmFoco, aoLocalizarEmpenho, aoLimparEmpenho }) {
  const [busca, setBusca] = useState('');
  const [etapa, setEtapa] = useState(null);
  const [ordem, setOrdem] = useState('recentes');
  const [limite, setLimite] = useState(PASSO);
  const telaLarga = useMediaQuery((tema) => tema.breakpoints.up('md'), { noSsr: true });

  // Id estável por linha + texto já normalizado para a busca (sem acento)
  const linhas = useMemo(
    () =>
      (Array.isArray(despesas) ? despesas : []).map((d, i) => ({
        ...d,
        _id: i,
        _busca: normalizarBusca(`${d.fornecedorNome ?? ''} ${d.documento ?? ''} ${d.orgao ?? ''}`),
      })),
    [despesas],
  );

  // Etapas presentes no período, sempre na ordem do caminho do dinheiro
  const etapasPresentes = useMemo(() => {
    const eventos = new Set(linhas.map((l) => l.evento).filter(Boolean));
    return [...ETAPAS.filter((e) => eventos.has(e.evento)), ...[...eventos].filter((e) => !ETAPA_POR_EVENTO[e]).map(etapaDe)];
  }, [linhas]);

  // Busca + empenho em foco (sem a etapa): base dos contadores de cada etapa
  const base = useMemo(() => {
    const termo = normalizarBusca(busca);
    return linhas.filter(
      (l) => (!empenhoEmFoco || String(l.documento) === String(empenhoEmFoco)) && (!termo || l._busca.includes(termo)),
    );
  }, [linhas, busca, empenhoEmFoco]);

  const contagem = useMemo(() => {
    const c = {};
    for (const l of base) c[l.evento] = (c[l.evento] ?? 0) + 1;
    return c;
  }, [base]);

  const filtradas = useMemo(() => {
    const lista = etapa ? base.filter((l) => l.evento === etapa) : base;
    const { comparar } = ORDENACOES.find((o) => o.id === ordem) ?? ORDENACOES[0];
    return [...lista].sort(comparar);
  }, [base, etapa, ordem]);

  const grupoEmFoco = useMemo(() => {
    if (!empenhoEmFoco) return null;
    return agruparEmpenhosDoCredor(linhas.filter((l) => String(l.documento) === String(empenhoEmFoco)))[0] ?? null;
  }, [linhas, empenhoEmFoco]);

  const soma = etapa ? filtradas.reduce((s, l) => s + (Number(l.valor) || 0), 0) : null;
  const visiveis = filtradas.slice(0, limite);
  const restantes = filtradas.length - visiveis.length;
  const filtrado = filtradas.length !== linhas.length;

  const mudarBusca = (valor) => {
    setBusca(valor);
    setLimite(PASSO);
  };
  const mudarEtapa = (valor) => {
    setEtapa(valor);
    setLimite(PASSO);
  };
  const limparFiltros = () => {
    setBusca('');
    setEtapa(null);
    setLimite(PASSO);
    if (empenhoEmFoco) aoLimparEmpenho?.();
  };
  // Focar um empenho a partir da própria tabela: mostra TODAS as etapas dele
  const focar = aoLocalizarEmpenho
    ? (documento) => {
        setBusca('');
        setEtapa(null);
        setLimite(PASSO);
        aoLocalizarEmpenho(documento);
      }
    : null;

  // Trocar etapa, ordem ou empenho refaz a cascata de entrada da lista
  const chaveLista = `${etapa}|${ordem}|${empenhoEmFoco ?? ''}`;

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* ── Cabeçalho ─────────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
            <Box>
              <Typography component="h2" sx={{ fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
                Base de Lançamentos
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.55 }}>
                Todos os registros oficiais do TCE-SP usados nos cálculos, um a um. O mesmo documento aparece uma vez em
                cada etapa.
              </Typography>
            </Box>
            <Chip
              label={`${formatarInteiro(linhas.length)} registros`}
              sx={{ fontWeight: 700, bgcolor: 'rgba(162,0,0,0.08)', color: 'primary.main', flexShrink: 0 }}
            />
          </Stack>

          {/* ── Busca + ordem ───────────────────────────────────────── */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 2 }}>
            <TextField
              value={busca}
              onChange={(e) => mudarBusca(e.target.value)}
              placeholder="Fornecedor, empenho ou órgão"
              fullWidth
              size="small"
              inputProps={{ 'aria-label': 'Buscar por fornecedor, número do empenho ou órgão' }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.default' } }}
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
            <TextField
              select
              size="small"
              label="Ordenar por"
              value={ordem}
              onChange={(e) => {
                setOrdem(e.target.value);
                setLimite(PASSO);
              }}
              sx={{ minWidth: { sm: 190 }, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            >
              {ORDENACOES.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.rotulo}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {empenhoEmFoco && (
            <EmpenhoEmFoco key={empenhoEmFoco} documento={empenhoEmFoco} grupo={grupoEmFoco} aoLimpar={aoLimparEmpenho} />
          )}

          {/* ── Filtro por etapa ────────────────────────────────────── */}
          <Stack
            direction="row"
            spacing={1}
            role="group"
            aria-label="Filtrar por etapa"
            sx={{
              mt: 2,
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              rowGap: 1,
              overflowX: { xs: 'auto', md: 'visible' },
              pb: { xs: 0.5, md: 0 },
              mx: { xs: -2, sm: 0 },
              px: { xs: 2, sm: 0 },
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <FiltroEtapa
              rotulo="Todas as etapas"
              quantidade={base.length}
              cor="#A20000"
              fundo="rgba(162,0,0,0.06)"
              texto="#A20000"
              ativo={!etapa}
              aoClicar={() => mudarEtapa(null)}
            />
            {etapasPresentes.map((e) => (
              <FiltroEtapa
                key={e.evento}
                rotulo={e.rotulo}
                quantidade={contagem[e.evento] ?? 0}
                cor={e.cor}
                fundo={e.fundo}
                texto={e.texto}
                ativo={etapa === e.evento}
                aoClicar={() => mudarEtapa(etapa === e.evento ? null : e.evento)}
              />
            ))}
          </Stack>

          <ExplicacaoCidada rotulo="O que é cada etapa?">
            <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1 }}>
              {ETAPAS.map((e) => (
                <Box key={e.evento}>
                  <Typography component="dt" variant="body2" sx={{ fontWeight: 700, color: e.texto }}>
                    {e.rotulo}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0, color: 'text.secondary' }}>
                    {EXPLICACAO_ETAPA[e.evento]}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
              Por isso o mesmo documento aparece em várias linhas, uma por etapa. Somar etapas diferentes contaria o
              mesmo dinheiro mais de uma vez: a soma só aparece quando uma etapa está escolhida.
            </Typography>
          </ExplicacaoCidada>
        </Box>

        {/* ── Resumo da seleção ─────────────────────────────────────── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={0.5}
          sx={{ px: { xs: 2, sm: 3 }, py: 1.5, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFC' }}
        >
          <Typography role="status" sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>
            <Box component="strong" sx={{ color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
              {formatarInteiro(filtradas.length)}
            </Box>
            {filtrado ? ` de ${formatarInteiro(linhas.length)} lançamentos` : filtradas.length === 1 ? ' lançamento' : ' lançamentos'}
          </Typography>
          {etapa ? (
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>
              Soma {SOMA_DE[etapa] ?? 'da seleção'}:{' '}
              <Box component="strong" sx={{ color: soma < 0 ? 'error.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                {formatarMoeda(soma)}
              </Box>
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Escolha uma etapa para ver a soma dos valores.</Typography>
          )}
        </Stack>

        {/* ── Registros ─────────────────────────────────────────────── */}
        {visiveis.length === 0 ? (
          <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
            <SearchOffRoundedIcon aria-hidden sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography sx={{ mt: 1, fontWeight: 700, color: 'text.primary' }}>Nenhum lançamento encontrado</Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary' }}>
              Tente outro termo de busca ou escolha &quot;Todas as etapas&quot;.
            </Typography>
            <Button onClick={limparFiltros} sx={{ mt: 1.5, fontWeight: 600 }}>
              Limpar filtros
            </Button>
          </Box>
        ) : telaLarga ? (
          <TabelaRegistros key={chaveLista} linhas={visiveis} aoFocar={empenhoEmFoco ? null : focar} />
        ) : (
          <ListaRegistros key={chaveLista} linhas={visiveis} aoFocar={empenhoEmFoco ? null : focar} />
        )}

        {/* ── Rodapé ────────────────────────────────────────────────── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFC' }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Mostrando {formatarInteiro(visiveis.length)} de {formatarInteiro(filtradas.length)}
          </Typography>
          {restantes > 0 && (
            <Button onClick={() => setLimite((l) => l + PASSO)} endIcon={<ExpandMoreRoundedIcon />} sx={{ fontWeight: 600, minHeight: 40 }}>
              Mostrar mais {Math.min(PASSO, restantes)}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
