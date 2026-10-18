import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useMunicipiosSP } from '../../servicos/ibge';
import { useAnaliseMunicipio } from './useAnaliseMunicipio';
import TermometroRisco, { descricaoTermometro } from '../TermometroRisco';
import {
  formatarInteiro,
  formatarMoeda,
  formatarMoedaExtenso,
  formatarPercentual,
  formatarPeriodo,
} from '../../utilitarios/formatadores';

/**
 * ComparacaoMunicipios — Aba 5 "Comparação"
 *
 * Duas cidades, lado a lado, no MESMO período (o seletor global no topo da
 * página) — comparar dois meses diferentes misturaria duas variáveis ao
 * mesmo tempo e confundiria a leitura.
 *
 * Cidade A começa preenchida com o município que o usuário já estava
 * explorando (reaproveita os dados já carregados, sem nova requisição);
 * Cidade B começa vazia, para uma escolha deliberada de comparação.
 *
 * Props:
 *   filtros      { municipio, ano, mes } — os filtros globais do Painel
 *   dadosAtuais  a análise já carregada para `filtros.municipio` (mesmo
 *                formato de buscarAnalise) ou null
 */

// Espelha PARAMETROS_ANALISE.CONCENTRACAO_CR5_ALERTA da GovTrace API
const LIMITE_CR5 = 30;

function CabecalhoMetrica({ children }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
    >
      {children}
    </Typography>
  );
}

// ─── Conteúdo de um lado da comparação ───────────────────────────────────────
function PainelResultado({ resultado }) {
  if (resultado.status === 'vazio') {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ py: 3, textAlign: 'center' }}>
        Escolha uma cidade para comparar.
      </Typography>
    );
  }

  if (resultado.status === 'carregando') {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
        <CircularProgress size={26} />
        <Typography variant="caption" color="text.secondary">Consultando o TCE-SP…</Typography>
      </Stack>
    );
  }

  if (resultado.status === 'erro') {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 4, px: 1, textAlign: 'center' }} role="alert">
        <CloudOffRoundedIcon color="error" />
        <Typography variant="body2" color="error.main">{resultado.erro}</Typography>
      </Stack>
    );
  }

  const { totais, distribuicao, insights } = resultado.dados;
  const concentracao = insights?.concentracao;
  const maiorArea = distribuicao?.[0];
  const temConcentracao = concentracao && Number.isFinite(Number(concentracao.percentual));

  if (!totais?.totalRegistros) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        O TCE-SP ainda não publicou registros para este período.
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ containerType: 'inline-size' }}>
        <CabecalhoMetrica>Total empenhado</CabecalhoMetrica>
        <Typography
          component="p"
          title={formatarMoeda(totais.valorTotal)}
          sx={{ fontSize: 'clamp(1.25rem, 7.5cqi, 1.75rem)', fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
        >
          {formatarMoedaExtenso(totais.valorTotal)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatarInteiro(totais.totalRegistros)} documentos analisados
        </Typography>
      </Box>

      {maiorArea && (
        <Box sx={{ minWidth: 0 }}>
          <CabecalhoMetrica>Maior área de destino</CabecalhoMetrica>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', overflowWrap: 'anywhere' }}>
            {maiorArea.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatarPercentual(maiorArea.percentual)} do total ({formatarMoedaExtenso(maiorArea.valor)})
          </Typography>
        </Box>
      )}

      {temConcentracao && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <CabecalhoMetrica>Concentração de mercado (CR5)</CabecalhoMetrica>
            <Chip
              size="small"
              icon={concentracao.alerta ? <WarningAmberRoundedIcon /> : <CheckCircleRoundedIcon />}
              label={concentracao.alerta ? 'Ponto para análise' : 'Dentro do esperado'}
              sx={{
                fontWeight: 700,
                color: concentracao.alerta ? '#B45309' : '#15803D',
                bgcolor: concentracao.alerta ? '#FEF3C7' : '#E8F5E9',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          </Stack>
          <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
            {formatarPercentual(concentracao.percentual)}
          </Typography>
          <TermometroRisco
            percentual={Number(concentracao.percentual)}
            limite={LIMITE_CR5}
            cor={concentracao.alerta ? '#B45309' : '#15803D'}
            rotuloUnidade={`Limite ${LIMITE_CR5}%`}
            descricao={descricaoTermometro(concentracao.percentual, LIMITE_CR5, 'concentrados nos 5 maiores fornecedores')}
          />
        </Box>
      )}
    </Stack>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ComparacaoMunicipios({ filtros, dadosAtuais }) {
  const { municipios, carregando: carregandoMunicipios } = useMunicipiosSP();
  const [municipioA, setMunicipioA] = useState(filtros.municipio || '');
  const [municipioB, setMunicipioB] = useState('');

  // Cidade A igual à que já está carregada no resto da página: reaproveita
  // em vez de repetir a mesma consulta ao TCE-SP.
  const reaproveitaA = Boolean(dadosAtuais) && municipioA === filtros.municipio;
  const buscaA = useAnaliseMunicipio(municipioA, filtros.ano, filtros.mes, { pular: reaproveitaA });
  const resultadoA = reaproveitaA ? { status: 'pronto', dados: dadosAtuais, erro: null } : buscaA;

  const resultadoB = useAnaliseMunicipio(municipioB, filtros.ano, filtros.mes);

  return (
    <Stack spacing={2.5}>
      <Card component="section" aria-labelledby="titulo-comparacao" elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(162,0,0,0.07)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CompareArrowsRoundedIcon sx={{ color: 'primary.main' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography id="titulo-comparacao" component="h2" sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
                Compare duas cidades lado a lado
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                Dados de {formatarPeriodo(filtros.mes, filtros.ano)}. Para outro período, use o seletor no topo da página.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 2.5 }}>
            <Autocomplete
              id="seletor-municipio-a"
              options={municipios.filter((m) => m !== municipioB)}
              value={municipioA || null}
              loading={carregandoMunicipios}
              noOptionsText="Nenhum município encontrado"
              onChange={(_, novoValor) => setMunicipioA(novoValor || '')}
              renderInput={(params) => <TextField {...params} label="Cidade A" variant="outlined" />}
            />
            <Autocomplete
              id="seletor-municipio-b"
              options={municipios.filter((m) => m !== municipioA)}
              value={municipioB || null}
              loading={carregandoMunicipios}
              noOptionsText="Nenhum município encontrado"
              onChange={(_, novoValor) => setMunicipioB(novoValor || '')}
              renderInput={(params) => <TextField {...params} label="Cidade B" variant="outlined" />}
            />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'start' }}>
        <Card component="article" aria-label={`Dados de ${municipioA || 'Cidade A'}`} sx={{ minWidth: 0, borderTop: '4px solid', borderTopColor: 'primary.main' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.1875rem', mb: 2, overflowWrap: 'anywhere' }}>
              {municipioA || 'Cidade A'}
            </Typography>
            <PainelResultado resultado={resultadoA} />
          </CardContent>
        </Card>

        <Card component="article" aria-label={`Dados de ${municipioB || 'Cidade B'}`} sx={{ minWidth: 0, borderTop: '4px solid', borderTopColor: '#7C3AED' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.1875rem', mb: 2, overflowWrap: 'anywhere' }}>
              {municipioB || 'Cidade B'}
            </Typography>
            <PainelResultado resultado={resultadoB} />
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
