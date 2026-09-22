import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useState } from 'react';

/**
 * DrawerEvidencias — Painel lateral de drill-down por fornecedor
 *
 * Abre-se a partir do RankingFornecedores quando o usuário quer ver
 * os registros brutos de um fornecedor específico.
 *
 * Props:
 *   aberto        boolean
 *   aoFechar      () => void
 *   fornecedor    { id, nome, valorTotal, quantidade } | null
 *   despesas      Despesa[] — todas as despesas do período (filtradas aqui)
 */

// ─── Mapa visual de evento → chip color ──────────────────────────────────────
const EVENTO_CONFIG = {
  Empenhado: { cor: '#0284C7', fundo: '#E0F2FE', rotulo: 'Empenho' },
  Liquidado: { cor: '#7C3AED', fundo: '#EDE9FE', rotulo: 'Liquidação' },
  Pago: { cor: '#059669', fundo: '#D1FAE5', rotulo: 'Pagamento' },
  Reforço: { cor: '#B45309', fundo: '#FEF3C7', rotulo: 'Reforço' },
  Anulação: { cor: '#B91C1C', fundo: '#FEE2E2', rotulo: 'Anulação' },
};

function ChipEvento({ evento }) {
  const cfg = EVENTO_CONFIG[evento] || { cor: '#64748B', fundo: '#F1F5F9', rotulo: evento };
  return (
    <Chip
      label={cfg.rotulo}
      size="small"
      sx={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: cfg.cor,
        bgcolor: cfg.fundo,
        border: 'none',
        height: 22,
      }}
    />
  );
}

export default function DrawerEvidencias({ aberto, aoFechar, fornecedor, despesas }) {
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(10);

  // Reseta paginação ao trocar de fornecedor
  const despesasFornecedor = despesas && fornecedor
    ? despesas
        .filter((d) => d.fornecedorId === fornecedor.id)
        .sort((a, b) => b.valor - a.valor)
    : [];

  const handleChangePage = (_, novaPagina) => setPagina(novaPagina);
  const handleChangeRowsPerPage = (e) => {
    setLinhasPorPagina(parseInt(e.target.value, 10));
    setPagina(0);
  };

  const paginadas = despesasFornecedor.slice(
    pagina * linhasPorPagina,
    pagina * linhasPorPagina + linhasPorPagina,
  );

  const fmtMoeda = (v) =>
    'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalFornecedor = despesasFornecedor.reduce((s, d) => s + d.valor, 0);

  return (
    <Drawer
      anchor="right"
      open={aberto}
      onClose={aoFechar}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 520, md: 600 },
          bgcolor: 'background.default',
          borderRadius: '20px 0 0 20px',
        },
      }}
    >
      {/* ── Cabeçalho do drawer ────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, mr: 1 }}>
            {/* Ícone */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: 'rgba(162,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>

            {/* Nome + resumo */}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="text.primary"
                sx={{
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {fornecedor?.nome ?? '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                {despesasFornecedor.length} registro{despesasFornecedor.length !== 1 ? 's' : ''} ·{' '}
                Total líquido: <strong>{fmtMoeda(totalFornecedor)}</strong>
              </Typography>
            </Box>
          </Stack>

          {/* Fechar */}
          <IconButton
            onClick={aoFechar}
            size="small"
            aria-label="Fechar painel de evidências"
            sx={{ color: 'text.secondary', mt: -0.5 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* ── Aviso de transparência ─────────────────────────────────────── */}
      <Box sx={{ px: 3, pt: 2, pb: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.125, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Registros oficiais do TCE-SP. Valor registrado em despesas públicas.
            A presença nesta lista <strong>não significa irregularidade</strong>.
          </Typography>
        </Stack>
      </Box>

      {/* ── Tabela de registros ────────────────────────────────────────── */}
      {despesasFornecedor.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Nenhum registro encontrado.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: { xs: 1, sm: 2 }, pt: 2, pb: 1, overflow: 'auto' }}>
          <TableContainer>
            <Table size="small" aria-label={`Registros de ${fornecedor?.nome}`}>
              <TableHead>
                <TableRow>
                  {['Evento', 'Órgão', 'Data', 'Valor'].map((h, i) => (
                    <TableCell
                      key={h}
                      align={i === 3 ? 'right' : 'left'}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginadas.map((linha, idx) => (
                  <TableRow
                    key={`${linha.documento ?? ''}-${idx}`}
                    hover
                    sx={{
                      '&:last-child td': { border: 0 },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Evento */}
                    <TableCell sx={{ py: 1 }}>
                      <ChipEvento evento={linha.evento} />
                    </TableCell>

                    {/* Órgão */}
                    <TableCell sx={{ py: 1, maxWidth: 160 }}>
                      <Tooltip title={linha.orgao} arrow enterTouchDelay={0}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 160,
                          }}
                        >
                          {linha.orgao}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    {/* Data */}
                    <TableCell sx={{ py: 1, whiteSpace: 'nowrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {linha.data}
                      </Typography>
                    </TableCell>

                    {/* Valor */}
                    <TableCell align="right" sx={{ py: 1, whiteSpace: 'nowrap' }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{
                          fontFamily: '"Roboto Mono", monospace',
                          fontVariantNumeric: 'tabular-nums',
                          color: linha.valor < 0 ? 'error.main' : 'text.primary',
                        }}
                      >
                        {fmtMoeda(linha.valor)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ mt: 1 }} />

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={despesasFornecedor.length}
            rowsPerPage={linhasPorPagina}
            page={pagina}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            sx={{ '.MuiTablePagination-toolbar': { px: 0 } }}
          />
        </Box>
      )}
    </Drawer>
  );
}
