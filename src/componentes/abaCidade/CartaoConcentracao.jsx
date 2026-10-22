import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';
import TermometroRisco, { descricaoTermometro } from '../TermometroRisco';
import { formatarMoedaExtenso, formatarPercentual } from '../../utilitarios/formatadores';

// Espelha PARAMETROS_ANALISE.CONCENTRACAO_CR5_ALERTA da GovTrace API
const LIMITE_CR5 = 30;

/**
 * CartaoConcentracao — quanto do valor pago no período foi para os 5 maiores
 * fornecedores (CR5), numa régua de 0 a 100% com a marca de referência.
 *
 * Props:
 *   concentracao  insight CR5 da GovTrace API
 */
export default function CartaoConcentracao({ concentracao }) {
  const { alerta, percentual, somaTop5, insightEducativo } = concentracao;
  const temPercentual = percentual !== undefined && Number.isFinite(Number(percentual));

  const status = alerta
    ? { rotulo: 'Destaque estatístico', Icone: InsightsRoundedIcon, cor: '#B45309', fundo: '#FFFBEB', borda: '#FCD34D' }
    : { rotulo: 'Dentro do esperado', Icone: CheckCircleRoundedIcon, cor: '#15803D', fundo: '#F0FDF4', borda: '#86EFAC' };

  return (
    <Card
      component="article"
      aria-labelledby="indicador-cr5-rotulo"
      sx={{ minWidth: 0, bgcolor: status.fundo, borderColor: status.borda, borderLeft: `6px solid ${status.cor}` }}
    >
      <CardContent sx={{ containerType: 'inline-size', p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography id="indicador-cr5-rotulo" component="h2" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary' }}>
            Quanto ficou com os 5 maiores fornecedores?
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
              <Typography
                component="p"
                sx={{
                  fontSize: 'clamp(1.75rem, 9.5cqi, 2.5rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  fontVariantNumeric: 'tabular-nums',
                  color: status.cor,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {formatarPercentual(percentual)}
              </Typography>
              <Typography sx={{ fontSize: '1rem', color: 'text.secondary', lineHeight: 1.5 }}>
                do valor pago no período foi para os <strong>5 maiores fornecedores</strong>
                {somaTop5 ? ` (${formatarMoedaExtenso(somaTop5)})` : ''}.
              </Typography>
            </Stack>

            <TermometroRisco
              percentual={Number(percentual)}
              limite={LIMITE_CR5}
              cor={status.cor}
              rotuloUnidade={`Referência ${LIMITE_CR5}%`}
              descricao={descricaoTermometro(percentual, LIMITE_CR5, 'dos recursos concentrados nos 5 maiores fornecedores')}
            />

            <ExplicacaoCidada>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
                {insightEducativo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                <strong>Como a conta é feita (CR5):</strong> soma o que os 5 maiores fornecedores
                receberam em pagamentos e divide pelo total pago no período. Acima de {LIMITE_CR5}%, uma parte grande do
                dinheiro ficou com poucas empresas. Isso é um destaque estatístico, não um juízo de valor.
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
