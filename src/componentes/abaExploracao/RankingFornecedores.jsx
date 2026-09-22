import { useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import DrawerEvidencias from './DrawerEvidencias';

/**
 * RankingFornecedores — Aba 2 "Exploração"
 *
 * Lista os maiores fornecedores do período com expansão progressiva (Collapse)
 * e acesso ao DrawerEvidencias para drill-down de registros brutos.
 *
 * Props:
 *   ranking     Array<{ id, nome, valorTotal, quantidade }>
 *   dadosBrutos Despesa[] — para filtrar as evidências no Drawer
 *   totais      { valorTotal } — para calcular a proporção visual de cada fornecedor
 */

// ─── Formata valor monetário compacto ────────────────────────────────────────
function fmtCompacto(v) {
  if (v >= 1_000_000) return 'R$ ' + (v / 1_000_000).toFixed(2).replace('.', ',') + ' mi';
  if (v >= 1_000) return 'R$ ' + (v / 1_000).toFixed(0) + ' mil';
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function fmtCompleto(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Extrai os órgãos distintos de um fornecedor a partir de dadosBrutos ─────
function extrairOrgaos(fornecedorId, dadosBrutos) {
  const orgaos = new Set();
  for (const d of dadosBrutos) {
    if (d.fornecedorId === fornecedorId) orgaos.add(d.orgao);
  }
  return Array.from(orgaos);
}

// ─── Medalha de posição ───────────────────────────────────────────────────────
function Posicao({ posicao }) {
  const estilos = {
    1: { bg: '#C98B22', color: '#FFFFFF', label: '1°' },
    2: { bg: '#94A3B8', color: '#FFFFFF', label: '2°' },
    3: { bg: '#B45309', color: '#FFFFFF', label: '3°' },
  };
  const s = estilos[posicao] || { bg: '#F1F3F4', color: '#64748B', label: `${posicao}°` };

  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '8px',
        bgcolor: s.bg,
        color: s.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 700,
        fontSize: '0.75rem',
        fontFamily: '"Roboto Mono", monospace',
      }}
    >
      {s.label}
    </Box>
  );
}

// ─── Item individual do ranking ───────────────────────────────────────────────
function ItemFornecedor({ fornecedor, posicao, proporcao, dadosBrutos, onVerEvidencias }) {
  const [expandido, setExpandido] = useState(false);

  const orgaos = expandido ? extrairOrgaos(fornecedor.id, dadosBrutos) : [];

  return (
    <Box>
      {/* ── Linha principal (sempre visível) ──────────────────────────── */}
      <Box
        onClick={() => setExpandido((v) => !v)}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
          WebkitTapHighlightColor: 'transparent',
        }}
        role="button"
        aria-expanded={expandido}
        aria-label={`${expandido ? 'Recolher' : 'Expandir'} detalhes de ${fornecedor.nome}`}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Posição */}
          <Posicao posicao={posicao} />

          {/* Ícone corporativo */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              bgcolor: 'rgba(162,0,0,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BusinessRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>

          {/* Nome + quantidade */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fornecedor.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fornecedor.quantidade} registro{fornecedor.quantidade !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Valor + barra de proporção */}
          <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Typography
              sx={{
                fontFamily: '"Roboto Mono", monospace',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                color: 'text.primary',
              }}
            >
              {fmtCompacto(fornecedor.valorTotal)}
            </Typography>

            {/* Mini-barra de proporção relativa ao maior fornecedor */}
            <Box
              sx={{
                width: { xs: 60, sm: 80 },
                height: 5,
                bgcolor: '#F1F3F4',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${proporcao}%`,
                  bgcolor: posicao <= 3 ? 'primary.main' : '#94A3B8',
                  borderRadius: '3px',
                  opacity: 0.7,
                }}
              />
            </Box>
          </Stack>

          {/* Chevron animado */}
          <KeyboardArrowDownRoundedIcon
            sx={{
              color: 'text.disabled',
              fontSize: 20,
              flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Stack>
      </Box>

      {/* ── Painel de detalhes expandido (Collapse) ────────────────────── */}
      <Collapse in={expandido} timeout={280} unmountOnExit>
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2.5,
            pt: 0.5,
            bgcolor: '#FAFBFC',
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
          {/* Aviso de transparência obrigatório */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ mb: 2, mt: 1 }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', mt: 0.1, flexShrink: 0 }} />
            <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.5 }}>
              Valor registrado em despesas públicas oficiais.
              A presença nesta lista <strong>não significa irregularidade</strong>.
            </Typography>
          </Stack>

          {/* Valor total detalhado */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Total Acumulado no Período
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: 'text.primary',
                  mt: 0.25,
                }}
              >
                {fmtCompleto(fornecedor.valorTotal)}
              </Typography>
            </Box>

            {/* Botão de drill-down */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              onClick={(e) => {
                e.stopPropagation();
                onVerEvidencias(fornecedor);
              }}
              sx={{
                flexShrink: 0,
                boxShadow: 'none !important',
                transform: 'none !important',
                fontSize: '0.8125rem',
                minHeight: '36px',
              }}
            >
              Ver registros
            </Button>
          </Stack>

          {/* Órgãos em que atuou */}
          {orgaos.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, display: 'block', mb: 1 }}
              >
                Departamentos atendidos
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                {orgaos.map((orgao) => (
                  <Tooltip key={orgao} title={orgao} arrow enterTouchDelay={0}>
                    <Chip
                      label={orgao}
                      size="small"
                      sx={{
                        maxWidth: 220,
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                        bgcolor: '#F1F3F4',
                        color: 'text.secondary',
                        fontSize: '0.6875rem',
                        height: 24,
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RankingFornecedores({ ranking, dadosBrutos, totais }) {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  if (!ranking || ranking.length === 0) return null;

  const abrirDrawer = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setDrawerAberto(true);
  };

  const fecharDrawer = () => {
    setDrawerAberto(false);
    // Mantém o fornecedor por 300ms para não piscar durante a animação de fechar
    setTimeout(() => setFornecedorSelecionado(null), 300);
  };

  // Valor máximo do ranking (para proporção das mini-barras)
  const maxValor = ranking[0]?.valorTotal || 1;

  // Limita ao top 20 para não sobrecarregar visualmente
  const top = ranking.slice(0, 20);

  return (
    <>
      <Card elevation={1}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Cabeçalho */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Maiores Fornecedores do Período
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                  Empresas privadas que mais receberam recursos. Entidades governamentais e bancárias são excluídas automaticamente.
                </Typography>
              </Box>
              <Chip
                label={`${top.length} empresas`}
                size="small"
                sx={{ bgcolor: 'rgba(162,0,0,0.08)', color: 'primary.main', fontWeight: 700, flexShrink: 0 }}
              />
            </Stack>
          </Box>

          {/* Cabeçalho de colunas — desktop */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'grid' },
              gridTemplateColumns: '32px 36px 1fr auto 80px 20px',
              gap: 2,
              px: 3,
              py: 1,
              bgcolor: '#FAFBFC',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {['', '', 'Razão social', 'Total recebido', '', ''].map((h, i) => (
              <Typography
                key={i}
                variant="caption"
                color="text.disabled"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing="0.05em"
                noWrap
              >
                {h}
              </Typography>
            ))}
          </Box>

          {/* Lista de fornecedores */}
          <Stack
            divider={<Divider sx={{ mx: { xs: 2, sm: 3 } }} />}
          >
            {top.map((forn, idx) => (
              <ItemFornecedor
                key={forn.id}
                fornecedor={forn}
                posicao={idx + 1}
                proporcao={(forn.valorTotal / maxValor) * 100}
                dadosBrutos={dadosBrutos}
                onVerEvidencias={abrirDrawer}
              />
            ))}
          </Stack>

          {/* Rodapé */}
          {ranking.length > 20 && (
            <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFC' }}>
              <Typography variant="caption" color="text.disabled">
                Exibindo os 20 maiores de {ranking.length} fornecedores identificados no período.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Drawer de drill-down */}
      <DrawerEvidencias
        aberto={drawerAberto}
        aoFechar={fecharDrawer}
        fornecedor={fornecedorSelecionado}
        despesas={dadosBrutos}
      />
    </>
  );
}
