import { useState } from 'react';
import { Box, Button, Chip, Drawer, IconButton, Stack, Typography } from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';

import { configArea } from '../abaCidade/areas';
import LinhaEtapas from './LinhaEtapas';
import {
  ETAPAS_DO_DINHEIRO,
  agruparEmpenhosDoCredor,
  formatarDocumentoCredor,
  iniciaisCredor,
  somarPorEtapa,
} from './credor';
import { formatarInteiro, formatarMoeda, formatarMoedaExtenso } from '../../utilitarios/formatadores';

/**
 * DrawerRegistros — painel lateral com os registros oficiais de um credor.
 *
 * Organizado como uma história, de cima para baixo:
 *   1. Quem é          — nome, CNPJ/CPF (mascarado pelo TCE-SP), área
 *   2. O caminho       — quanto foi empenhado, liquidado e pago no período
 *   3. Onde atuou      — órgãos atendidos
 *   4. Os documentos   — cada empenho com as etapas que ele percorreu
 *
 * Cada etapa aparece separada: somar empenho + liquidação + pagamento
 * contaria o mesmo dinheiro até três vezes.
 *
 * Props:
 *   aberto, aoFechar
 *   fornecedor          { id, nome, valorTotal, quantidade, atividade? }
 *   despesas            registros do período (filtrados aqui pelo credor)
 *   aoLocalizarEmpenho  (documento) => abre a Base de Lançamentos filtrada (opcional)
 */

const EMPENHOS_INICIAIS = 6;

function Resumo({ rotulo, valor, detalhe }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>{rotulo}</Typography>
      <Typography sx={{ mt: 0.25, fontSize: '1.375rem', fontWeight: 800, color: 'text.primary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
        {valor}
      </Typography>
      {detalhe && <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{detalhe}</Typography>}
    </Box>
  );
}

// ─── O caminho do dinheiro: empenho → liquidação → pagamento ────────────────
function CaminhoDoDinheiro({ somas }) {
  return (
    <Box
      component="ol"
      aria-label="Valores do período por etapa"
      sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}
    >
      {ETAPAS_DO_DINHEIRO.map((etapa, i) => (
        <Box component="li" key={etapa.evento} sx={{ position: 'relative', p: 1.75, borderRadius: '14px', bgcolor: etapa.fundo, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: etapa.cor, color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {i + 1}
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: etapa.texto }}>{etapa.rotulo}</Typography>
          </Stack>
          <Typography sx={{ mt: 0.75, fontSize: '1.1875rem', fontWeight: 800, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            {formatarMoedaExtenso(somas[etapa.evento] ?? 0)}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.35 }}>{etapa.explicacao}</Typography>
          {i < ETAPAS_DO_DINHEIRO.length - 1 && (
            <ArrowForwardRoundedIcon
              aria-hidden
              sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 1, fontSize: 20, color: 'text.disabled', bgcolor: 'background.default', borderRadius: '50%' }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}

// ─── Um empenho e as etapas que ele percorreu ───────────────────────────────
function CartaoEmpenho({ empenho, aoLocalizar }) {
  const { documento, data, orgao, valor, etapas } = empenho;
  const extras = ['Reforço', 'Anulação'].filter((e) => etapas[e]);

  return (
    <Box component="li" sx={{ listStyle: 'none', p: { xs: 1.75, sm: 2 }, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'text.secondary' }}>
            Empenho nº
          </Typography>
          <Typography sx={{ fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace', fontWeight: 700, fontSize: '1.0625rem', color: 'text.primary' }}>
            {documento ?? 'Registro sem número'}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums', color: 'text.primary', flexShrink: 0 }}>
          {formatarMoeda(valor)}
        </Typography>
      </Stack>
      <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.45 }}>
        {data} · {orgao}
      </Typography>

      {/* Linha do tempo das etapas: preenchida = a etapa aconteceu no período */}
      <Box sx={{ mt: 1.5 }}>
        <LinhaEtapas etapas={etapas} />
      </Box>

      {extras.length > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
          {extras.map((e) => (
            <Chip
              key={e}
              size="small"
              label={`${e === 'Anulação' ? 'Anulação' : 'Reforço'}: ${formatarMoeda(etapas[e].valor)}`}
              sx={{ fontWeight: 700, fontSize: '0.75rem', color: e === 'Anulação' ? '#B91C1C' : '#B45309', bgcolor: e === 'Anulação' ? '#FEE2E2' : '#FEF3C7' }}
            />
          ))}
        </Stack>
      )}

      {aoLocalizar && documento && (
        <Button
          size="small"
          startIcon={<TravelExploreRoundedIcon />}
          onClick={() => aoLocalizar(documento)}
          sx={{ mt: 1.25, ml: -0.75, minHeight: 36, fontWeight: 600 }}
        >
          Ver na Base de Lançamentos
        </Button>
      )}
    </Box>
  );
}

export default function DrawerRegistros({ aberto, aoFechar, fornecedor, despesas, aoLocalizarEmpenho }) {
  const [visiveis, setVisiveis] = useState(EMPENHOS_INICIAIS);

  const registros = fornecedor ? (despesas ?? []).filter((d) => d.fornecedorId === fornecedor.id) : [];
  const empenhos = agruparEmpenhosDoCredor(registros);
  const somas = somarPorEtapa(registros);
  const orgaos = [...new Set(registros.map((r) => r.orgao).filter(Boolean))];
  const area = fornecedor?.atividade?.area;
  const { cor } = configArea(area);

  const localizar = aoLocalizarEmpenho
    ? (documento) => {
        aoFechar();
        aoLocalizarEmpenho(documento);
      }
    : null;

  return (
    <Drawer
      anchor="right"
      open={aberto}
      onClose={aoFechar}
      // Volta à lista inicial de empenhos sempre que outro credor é aberto
      SlideProps={{ onExited: () => setVisiveis(EMPENHOS_INICIAIS) }}
      PaperProps={{
        sx: { width: { xs: '100vw', sm: 560, md: 640 }, bgcolor: 'background.default', borderRadius: { xs: 0, sm: '20px 0 0 20px' } },
      }}
    >
      {/* ── 1. Quem é ────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2.25, sm: 3 }, py: 2.25, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 2 }}>
        <Stack direction="row" spacing={1.75} alignItems="flex-start">
          <Box
            aria-hidden
            sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${cor}1A`, color: cor, fontWeight: 800, fontSize: '1.0625rem', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            {iniciaisCredor(fornecedor?.nome)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h2" sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3, overflowWrap: 'anywhere' }}>
              {fornecedor?.nome ?? '—'}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: '0.875rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
              {formatarDocumentoCredor(fornecedor?.id)}
            </Typography>
            {area && (
              <Chip size="small" label={area} sx={{ mt: 0.75, fontWeight: 600, fontSize: '0.75rem', color: cor, bgcolor: `${cor}14` }} />
            )}
          </Box>
          <IconButton onClick={aoFechar} aria-label="Fechar painel de registros" sx={{ color: 'text.secondary', mt: -0.5 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      <Stack spacing={3} sx={{ px: { xs: 2.25, sm: 3 }, py: 2.5 }}>
        {/* ── 2. O caminho do dinheiro ─────────────────────────────────── */}
        <Box component="section" aria-labelledby="titulo-caminho">
          <Stack direction="row" spacing={1} sx={{ mb: 1.25 }} useFlexGap flexWrap="wrap">
            <Resumo rotulo="Empenhos" valor={formatarInteiro(empenhos.length)} detalhe="documentos diferentes" />
            <Resumo rotulo="Registros" valor={formatarInteiro(registros.length)} detalhe="uma linha por etapa" />
          </Stack>
          <Typography id="titulo-caminho" component="h3" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', mb: 1 }}>
            O caminho do dinheiro no período
          </Typography>
          <CaminhoDoDinheiro somas={somas} />
          {somas['Anulação'] < 0 && (
            <Typography sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
              Anulações no período: <strong>{formatarMoeda(somas['Anulação'])}</strong>
            </Typography>
          )}
          <Typography sx={{ mt: 1, fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.5 }}>
            As etapas aparecem separadas porque o mesmo valor passa por todas elas: somá-las contaria o
            mesmo dinheiro mais de uma vez. Pagamentos podem se referir a empenhos de meses anteriores.
          </Typography>
        </Box>

        {/* ── 3. Onde atuou ────────────────────────────────────────────── */}
        {orgaos.length > 0 && (
          <Box component="section" aria-labelledby="titulo-orgaos">
            <Typography id="titulo-orgaos" component="h3" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Órgãos atendidos
            </Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75}>
              {orgaos.map((orgao) => (
                <Chip key={orgao} label={orgao} size="small" sx={{ maxWidth: '100%', height: 'auto', py: 0.5, bgcolor: '#EEF1F4', color: 'text.secondary', fontWeight: 600, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
              ))}
            </Stack>
          </Box>
        )}

        {/* ── 4. Os documentos ─────────────────────────────────────────── */}
        <Box component="section" aria-labelledby="titulo-empenhos">
          <Typography id="titulo-empenhos" component="h3" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Empenhos do período, do maior para o menor
          </Typography>
          {empenhos.length === 0 ? (
            <Typography color="text.secondary">Nenhum registro encontrado.</Typography>
          ) : (
            <>
              <Stack component="ul" spacing={1.25} sx={{ m: 0, p: 0 }}>
                {empenhos.slice(0, visiveis).map((e, i) => (
                  <CartaoEmpenho key={e.documento ?? i} empenho={e} aoLocalizar={localizar} />
                ))}
              </Stack>
              {empenhos.length > visiveis && (
                <Button
                  onClick={() => setVisiveis((v) => v + 10)}
                  endIcon={<ExpandMoreRoundedIcon />}
                  sx={{ mt: 1, minHeight: 40, fontWeight: 600 }}
                >
                  {empenhos.length - visiveis <= 10
                    ? `Mostrar ${empenhos.length - visiveis === 1 ? 'o último empenho' : `os últimos ${empenhos.length - visiveis} empenhos`}`
                    : `Mostrar mais 10 empenhos (restam ${empenhos.length - visiveis})`}
                </Button>
              )}
            </>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}>
          <InfoOutlinedIcon sx={{ fontSize: 17, color: 'text.secondary', mt: 0.15, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.5 }}>
            Registros oficiais publicados pelo TCE-SP. Estar nesta lista mostra só quem recebeu
            recursos no período, <strong>não significa irregularidade</strong>.
          </Typography>
        </Stack>
      </Stack>
    </Drawer>
  );
}
