import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';
import {
  formatarInteiro,
  formatarMoeda,
  formatarMoedaExtenso,
  formatarPercentual,
  formatarPeriodo,
} from '../../utilitarios/formatadores';

/**
 * HeroCidade — Panorama financeiro do município (Aba "A Cidade")
 *
 * Hierarquia de leitura pensada para leigos e idosos:
 *   1. Contexto   — de qual cidade e período estou falando?
 *   2. Número     — por extenso ("R$ 292,2 milhões"), grande e legível
 *   3. Prova      — o valor exato logo abaixo, para quem audita
 *   4. Explicação — sob demanda, em <ExplicacaoCidada>
 *
 * Props:
 *   totais        { valorTotal, totalRegistros, maiorPagamento }
 *   concentracao  insight CR5 da GovTrace API
 *   filtros       { municipio, ano, mes }
 */

// Espelha PARAMETROS_ANALISE.CONCENTRACAO_CR5_ALERTA da GovTrace API
const LIMITE_CR5 = 30;

// Container query: os cards declaram "containerType: inline-size" e o
// número escala pela largura DO CARD (cqi), não da janela. Assim o mesmo
// componente fica proporcional em 1 coluna (celular) ou 3 (desktop) —
// com "vw", o card estreito do desktop quebrava "R$ 292,2 milhões" em 2 linhas.
const conteinerResponsivo = { containerType: 'inline-size' };

const estiloNumeroHeroi = {
  fontSize: 'clamp(1.75rem, 9.5cqi, 2.5rem)',
  '@supports not (font-size: 1cqi)': { fontSize: '2rem' },
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-0.025em',
  fontVariantNumeric: 'tabular-nums',
  color: 'text.primary',
  overflowWrap: 'anywhere',
};

// ─── Ícone em "pastilha" tonal ───────────────────────────────────────────────
function Pastilha({ icone, cor }) {
  const Icone = icone;
  return (
    <Box
      aria-hidden
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        bgcolor: `${cor}14`,
        color: cor,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Icone sx={{ fontSize: 24 }} />
    </Box>
  );
}

// ─── Cartão de indicador (KPI) ───────────────────────────────────────────────
function CartaoIndicador({ id, rotulo, Icone, cor, valor, valorAcessivel, complemento, explicacao }) {
  return (
    <Card component="article" aria-labelledby={`${id}-rotulo`} sx={{ minWidth: 0 }}>
      <CardContent sx={{ ...conteinerResponsivo, p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Pastilha icone={Icone} cor={cor} />
          <Typography
            id={`${id}-rotulo`}
            component="h3"
            sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.secondary', lineHeight: 1.3 }}
          >
            {rotulo}
          </Typography>
        </Stack>

        {/* Visual: forma abreviada. Leitor de tela: valor completo
            (aria-label em <p> é proibido pelo ARIA 1.2 e seria ignorado) */}
        <Typography component="p" sx={{ ...estiloNumeroHeroi, mt: 2 }}>
          <span aria-hidden="true">{valor}</span>
          <Box component="span" sx={visuallyHidden}>{valorAcessivel}</Box>
        </Typography>

        {complemento && (
          <Box sx={{ mt: 1, color: 'text.secondary', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            {complemento}
          </Box>
        )}

        {explicacao && (
          <ExplicacaoCidada>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {explicacao}
            </Typography>
          </ExplicacaoCidada>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Gráfico de bala: percentual vs. limite de atenção ──────────────────────
function BarraLimite({ percentual, cor }) {
  const preenchimento = Math.min(Math.max(percentual, 0), 100);
  const descricao =
    `${formatarPercentual(percentual)} dos recursos concentrados nos 5 maiores fornecedores. ` +
    `Limite de atenção: ${LIMITE_CR5}%.`;

  return (
    <Box role="img" aria-label={descricao} sx={{ mt: 2.5 }}>
      <Box sx={{ position: 'relative', height: 14, borderRadius: '7px', bgcolor: '#E2E8F0' }}>
        <Box
          sx={{
            height: '100%',
            width: `${preenchimento}%`,
            minWidth: preenchimento > 0 ? 6 : 0,
            borderRadius: '7px',
            bgcolor: cor,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {/* Marcador do limite */}
        <Box
          sx={{
            position: 'absolute',
            top: -5,
            bottom: -5,
            left: `${LIMITE_CR5}%`,
            width: 3,
            ml: '-1.5px',
            borderRadius: '2px',
            bgcolor: '#1E293B',
          }}
        />
      </Box>

      <Box sx={{ position: 'relative', height: 20, mt: 0.75, fontSize: '0.8125rem', color: 'text.secondary' }}>
        <Box component="span" sx={{ position: 'absolute', left: 0 }}>0%</Box>
        <Box
          component="span"
          sx={{ position: 'absolute', left: `${LIMITE_CR5}%`, transform: 'translateX(-50%)', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}
        >
          Limite {LIMITE_CR5}%
        </Box>
        <Box component="span" sx={{ position: 'absolute', right: 0 }}>100%</Box>
      </Box>
    </Box>
  );
}

// ─── Cartão de concentração de mercado (CR5) ─────────────────────────────────
function CartaoConcentracao({ concentracao }) {
  const { alerta, percentual, somaTop5, insightEducativo } = concentracao;
  const temPercentual = percentual !== undefined && Number.isFinite(Number(percentual));

  const status = alerta
    ? { rotulo: 'Ponto para análise', Icone: WarningAmberRoundedIcon, cor: '#B45309', fundo: '#FFFBEB', borda: '#FCD34D' }
    : { rotulo: 'Dentro do esperado', Icone: CheckCircleRoundedIcon, cor: '#15803D', fundo: '#F0FDF4', borda: '#86EFAC' };

  return (
    <Card
      component="article"
      aria-labelledby="indicador-cr5-rotulo"
      sx={{ minWidth: 0, bgcolor: status.fundo, borderColor: status.borda, borderLeft: `6px solid ${status.cor}` }}
    >
      <CardContent sx={{ ...conteinerResponsivo, p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography
            id="indicador-cr5-rotulo"
            component="h3"
            sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}
          >
            Concentração de mercado
          </Typography>
          {/* Status em texto + ícone (nunca só cor — WCAG 1.4.1) */}
          <Chip
            icon={<status.Icone />}
            label={status.rotulo}
            sx={{
              height: 32,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: status.cor,
              bgcolor: '#FFFFFF',
              border: `1px solid ${status.borda}`,
              '& .MuiChip-icon': { color: status.cor },
            }}
          />
        </Stack>

        {temPercentual ? (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 0.5, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'baseline' }}
              sx={{ mt: 2 }}
            >
              <Typography component="p" sx={{ ...estiloNumeroHeroi, color: status.cor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {formatarPercentual(percentual)}
              </Typography>
              <Typography sx={{ fontSize: '1rem', color: 'text.secondary', lineHeight: 1.5 }}>
                do dinheiro do período foi para os <strong>5 maiores fornecedores</strong>
                {somaTop5 ? ` (${formatarMoedaExtenso(somaTop5)})` : ''}.
              </Typography>
            </Stack>

            <BarraLimite percentual={Number(percentual)} cor={status.cor} />

            <ExplicacaoCidada>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
                {insightEducativo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                <strong>Método (CR5):</strong> soma o que os 5 maiores fornecedores receberam e divide
                pelo total do período. Acima de {LIMITE_CR5}%, o município depende muito de poucas
                empresas. Isso é um alerta estatístico, não uma acusação.
              </Typography>
            </ExplicacaoCidada>
          </>
        ) : (
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>{insightEducativo}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function HeroCidade({ totais, concentracao, filtros }) {
  if (!totais) return null;

  const { valorTotal, totalRegistros, maiorPagamento } = totais;
  const temMaiorPagamento = maiorPagamento?.valor > 0 && Boolean(maiorPagamento?.fornecedorNome);

  return (
    <Box component="section" aria-labelledby="titulo-panorama">
      {/* ── Contexto: o que o cidadão está vendo ─────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.25, sm: 2 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        sx={{ mb: { xs: 2, sm: 2.5 } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id="titulo-panorama"
            component="h2"
            sx={{ fontSize: 'clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)', fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}
          >
            Panorama de {filtros?.municipio}
          </Typography>
          {filtros?.mes && (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75, color: 'text.secondary' }}>
              <EventRoundedIcon aria-hidden sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: '1rem', '&::first-letter': { textTransform: 'uppercase' } }}>
                {formatarPeriodo(filtros.mes, filtros.ano)}
              </Typography>
            </Stack>
          )}
        </Box>
        <Chip
          icon={<VerifiedRoundedIcon />}
          label={<>Dados oficiais do <Box component="span" sx={{ whiteSpace: 'nowrap' }}>TCE-SP</Box></>}
          variant="outlined"
          sx={{ height: 32, fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', borderColor: '#CBD5E1', bgcolor: 'background.paper' }}
        />
      </Stack>

      {/* ── Indicadores: 1 coluna no celular, 2 no tablet, 3 no desktop ────
          minmax(0, 1fr): a trilha pode encolher abaixo do conteúdo. Com "1fr"
          puro, um texto longo alarga a coluna e estoura a tela. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: temMaiorPagamento ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
          },
          gap: { xs: 2, sm: 2.5 },
          alignItems: 'start', // Abrir uma explicação não estica os vizinhos
        }}
      >
        <CartaoIndicador
          id="indicador-total"
          rotulo="Total empenhado no mês"
          Icone={AccountBalanceWalletRoundedIcon}
          cor="#a20000"
          valor={formatarMoedaExtenso(valorTotal)}
          valorAcessivel={formatarMoeda(valorTotal)}
          complemento={
            <>
              Valor exato:{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                {formatarMoeda(valorTotal)}
              </Box>
            </>
          }
          explicacao="Empenho é a reserva de dinheiro no orçamento para uma despesa: a prefeitura se compromete a pagar. Não significa que o dinheiro já saiu do caixa. O total soma empenhos e reforços e desconta as anulações do período."
        />

        <CartaoIndicador
          id="indicador-registros"
          rotulo="Documentos analisados"
          Icone={ReceiptLongRoundedIcon}
          cor="#0369A1"
          valor={formatarInteiro(totalRegistros)}
          valorAcessivel={`${formatarInteiro(totalRegistros)} documentos`}
          complemento={
            <>
              Notas de empenho, reforços e anulações publicadas pelo{' '}
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>TCE-SP</Box>
            </>
          }
          explicacao="Cada documento é um registro oficial publicado pelo Tribunal de Contas do Estado de São Paulo. O GovTrace lê todos eles para montar as análises desta página."
        />

        {temMaiorPagamento && (
          <CartaoIndicador
            id="indicador-maior"
            rotulo="Maior valor único"
            Icone={PaymentsRoundedIcon}
            cor="#7C3AED"
            valor={formatarMoedaExtenso(maiorPagamento.valor)}
            valorAcessivel={formatarMoeda(maiorPagamento.valor)}
            complemento={
              <>
                <Box component="span" sx={{ display: 'block', fontWeight: 600, color: 'text.primary', overflowWrap: 'anywhere' }}>
                  {maiorPagamento.fornecedorNome}
                </Box>
                {maiorPagamento.data && `Em ${maiorPagamento.data}`}
                {maiorPagamento.documento && (
                  <>
                    {' · '}
                    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>Doc. {maiorPagamento.documento}</Box>
                  </>
                )}
              </>
            }
            explicacao="É o registro individual de maior valor no período. Valores altos não indicam irregularidade: obras e contratos anuais costumam gerar empenhos grandes. Serve como ponto de partida para quem quer investigar."
          />
        )}
      </Box>

      {/* ── Concentração de mercado ──────────────────────────────────────── */}
      {concentracao && (
        <Box sx={{ mt: { xs: 2, sm: 2.5 } }}>
          <CartaoConcentracao concentracao={concentracao} />
        </Box>
      )}
    </Box>
  );
}
