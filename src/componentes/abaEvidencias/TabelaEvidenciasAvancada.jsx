import { useMemo, useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import PlagiarismRoundedIcon from '@mui/icons-material/PlagiarismRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

/**
 * Mapeamento semântico dos estágios contábeis (Cores e Rótulos)
 */
const CONFIG_EVENTOS = {
  Empenhado: { cor: '#0284C7', fundo: '#E0F2FE', rotulo: 'Empenho' },
  Liquidado: { cor: '#7C3AED', fundo: '#EDE9FE', rotulo: 'Liquidação' },
  Pago: { cor: '#059669', fundo: '#D1FAE5', rotulo: 'Pagamento' },
  Reforço: { cor: '#B45309', fundo: '#FEF3C7', rotulo: 'Reforço' },
  Anulação: { cor: '#B91C1C', fundo: '#FEE2E2', rotulo: 'Anulação' },
};

function ChipEvento({ evento }) {
  const cfg = CONFIG_EVENTOS[evento] || {
    cor: '#64748B',
    fundo: '#F1F5F9',
    rotulo: evento || 'Geral',
  };

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
        letterSpacing: '0.02em',
      }}
    />
  );
}

const formatarMoeda = (valor) =>
  'R$ ' +
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function TabelaEvidenciasAvancada({ despesas }) {
  const [busca, setBusca] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('TODOS');
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(25);

  const listaSegura = Array.isArray(despesas) ? despesas : [];

  // Extrai lista única de eventos presentes nos dados
  const eventosDisponiveis = useMemo(() => {
    const conjunto = new Set();
    listaSegura.forEach((d) => {
      if (d.evento) conjunto.add(d.evento);
    });
    return Array.from(conjunto);
  }, [listaSegura]);

  // Filtragem combinada em tempo real (Busca de texto + Filtro de Evento)
  const despesasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return listaSegura.filter((item) => {
      // Filtro por evento
      if (filtroEvento !== 'TODOS' && item.evento !== filtroEvento) {
        return false;
      }

      // Filtro por texto livre (Fornecedor, Documento ou Órgão)
      if (termo) {
        const fornecedor = (item.fornecedorNome || '').toLowerCase();
        const documento = String(item.documento || '').toLowerCase();
        const orgao = (item.orgao || '').toLowerCase();

        return (
          fornecedor.includes(termo) ||
          documento.includes(termo) ||
          orgao.includes(termo)
        );
      }

      return true;
    });
  }, [listaSegura, busca, filtroEvento]);

  // Somatório financeiro exato dos registros exibidos/filtrados
  const somatorioFiltrado = useMemo(() => {
    return despesasFiltradas.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  }, [despesasFiltradas]);

  // Quantidade de anulações nos filtrados
  const totalAnulacoes = useMemo(() => {
    return despesasFiltradas.filter((d) => (d.valor || 0) < 0).length;
  }, [despesasFiltradas]);

  // Handlers de paginação
  const handleChangePage = (_, novaPagina) => {
    setPagina(novaPagina);
  };

  const handleChangeRowsPerPage = (e) => {
    setLinhasPorPagina(parseInt(e.target.value, 10));
    setPagina(0);
  };

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setPagina(0);
  };

  const limparBusca = () => {
    setBusca('');
    setPagina(0);
  };

  const handleFiltroEvento = (evento) => {
    setFiltroEvento(evento);
    setPagina(0);
  };

  // Slice paginado
  const despesasPaginadas = useMemo(() => {
    const inicio = pagina * linhasPorPagina;
    return despesasFiltradas.slice(inicio, inicio + linhasPorPagina);
  }, [despesasFiltradas, pagina, linhasPorPagina]);

  return (
    <Stack spacing={3}>
      {/* ── Cabeçalho da Aba 4 ────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '&:hover': { transform: 'none', boxShadow: 'none' },
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'rgba(162,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PlagiarismRoundedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Evidências e Registros Oficiais
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  Consulte os registros brutos do TCE-SP que alimentam todos os cálculos e análises forenses.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`${listaSegura.length.toLocaleString('pt-BR')} registros no período`}
              size="small"
              sx={{
                bgcolor: '#F1F3F4',
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ── Controles de Busca e Filtros Rápidos ───────────────────────── */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2}>
          {/* Linha 1: Input de Busca + Placar Dinâmico */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* Campo de Pesquisa Instantânea */}
            <TextField
              placeholder="Buscar por fornecedor, número de empenho ou órgão..."
              value={busca}
              onChange={handleBuscaChange}
              size="small"
              fullWidth
              sx={{
                maxWidth: { md: 460 },
                bgcolor: 'background.default',
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: busca ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={limparBusca} aria-label="Limpar busca">
                      <ClearRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            {/* Placar Dinâmico de Registros e Volume Financeiro */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent={{ xs: 'space-between', md: 'flex-end' }}
              flexWrap="wrap"
            >
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                  Volume Filtrado
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Roboto Mono", monospace',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: somatorioFiltrado < 0 ? 'error.main' : 'text.primary',
                  }}
                >
                  {formatarMoeda(somatorioFiltrado)}
                </Typography>
              </Box>

              <Chip
                label={`${despesasFiltradas.length.toLocaleString('pt-BR')} itens`}
                size="small"
                sx={{
                  bgcolor: 'rgba(162,0,0,0.08)',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />

              {totalAnulacoes > 0 && (
                <Tooltip title="Existem anulações ou estornos com valor negativo nesta seleção" arrow>
                  <Chip
                    icon={<TrendingDownRoundedIcon sx={{ fontSize: '14px !important' }} />}
                    label={`${totalAnulacoes} anulaç${totalAnulacoes > 1 ? 'ões' : 'ão'}`}
                    size="small"
                    sx={{
                      bgcolor: '#FEE2E2',
                      color: '#B91C1C',
                      fontWeight: 700,
                      fontSize: '0.6875rem',
                      '& .MuiChip-icon': { color: 'inherit' },
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {/* Linha 2: Filtros por Estágio Contábil (Chips de Evento) */}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 1 }}>
              <FilterListRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Estágio:
              </Typography>
            </Stack>

            <Chip
              label={`Todos (${listaSegura.length})`}
              size="small"
              onClick={() => handleFiltroEvento('TODOS')}
              clickable
              variant={filtroEvento === 'TODOS' ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: filtroEvento === 'TODOS' ? 'primary.main' : 'transparent',
                color: filtroEvento === 'TODOS' ? '#FFFFFF' : 'text.secondary',
                borderColor: filtroEvento === 'TODOS' ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: filtroEvento === 'TODOS' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                },
              }}
            />

            {eventosDisponiveis.map((evento) => {
              const contagem = listaSegura.filter((d) => d.evento === evento).length;
              const ativo = filtroEvento === evento;
              const corSemantica = CONFIG_EVENTOS[evento]?.cor || '#64748B';

              return (
                <Chip
                  key={evento}
                  label={`${evento} (${contagem})`}
                  size="small"
                  onClick={() => handleFiltroEvento(evento)}
                  clickable
                  variant={ativo ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: ativo ? corSemantica : 'transparent',
                    color: ativo ? '#FFFFFF' : 'text.secondary',
                    borderColor: ativo ? corSemantica : 'divider',
                    '&:hover': {
                      bgcolor: ativo ? corSemantica : 'rgba(0,0,0,0.04)',
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Tabela de Dados Brutos ─────────────────────────────────────── */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer sx={{ maxHeight: 680 }}>
          <Table stickyHeader size="small" aria-label="Tabela detalhada de evidências">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    width: 110,
                  }}
                >
                  Estágio
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    width: 100,
                  }}
                >
                  Data
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    width: 130,
                  }}
                >
                  Documento
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    minWidth: 180,
                  }}
                >
                  Órgão / Secretaria
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    minWidth: 220,
                  }}
                >
                  Fornecedor
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    width: 140,
                  }}
                >
                  Valor (R$)
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {despesasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                    <PlagiarismRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Nenhum registro encontrado
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Tente alterar o termo de busca ou o estágio contábil selecionado.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                despesasPaginadas.map((linha, index) => {
                  const ehAnulacao = (linha.valor || 0) < 0;

                  return (
                    <TableRow
                      key={`${linha.documento || 'doc'}-${linha.data || 'dt'}-${index}`}
                      hover
                      sx={{
                        bgcolor: ehAnulacao ? 'rgba(185, 28, 28, 0.02)' : 'inherit',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Estágio contábil */}
                      <TableCell sx={{ py: 1.25 }}>
                        <ChipEvento evento={linha.evento} />
                      </TableCell>

                      {/* Data */}
                      <TableCell sx={{ py: 1.25, whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                          {linha.data || '—'}
                        </Typography>
                      </TableCell>

                      {/* Número do Documento / Empenho */}
                      <TableCell sx={{ py: 1.25, whiteSpace: 'nowrap' }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            fontSize: '0.8125rem',
                            fontFamily: '"Roboto Mono", monospace',
                            color: 'text.primary',
                          }}
                        >
                          {linha.documento || 'S/N'}
                        </Typography>
                      </TableCell>

                      {/* Órgão */}
                      <TableCell sx={{ py: 1.25, maxWidth: 220 }}>
                        <Tooltip title={linha.orgao} arrow placement="top" enterTouchDelay={0}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.8125rem',
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 220,
                            }}
                          >
                            {linha.orgao}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Fornecedor */}
                      <TableCell sx={{ py: 1.25, maxWidth: 260 }}>
                        <Tooltip title={linha.fornecedorNome} arrow placement="top" enterTouchDelay={0}>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{
                              fontSize: '0.8125rem',
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 260,
                            }}
                          >
                            {linha.fornecedorNome}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Valor formatado */}
                      <TableCell align="right" sx={{ py: 1.25, whiteSpace: 'nowrap' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"Roboto Mono", monospace',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: ehAnulacao ? 'error.main' : 'text.primary',
                          }}
                        >
                          {formatarMoeda(linha.valor)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </TableContainer>
        </Box>

        {/* ── Paginação ──────────────────────────────────────────────── */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={despesasFiltradas.length}
          rowsPerPage={linhasPorPagina}
          page={pagina}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Registros por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count.toLocaleString('pt-BR') : `mais de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FAFBFC',
          }}
        />
      </Paper>
    </Stack>
  );
}
