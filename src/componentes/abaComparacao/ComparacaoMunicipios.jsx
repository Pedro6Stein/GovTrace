import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { visuallyHidden } from '@mui/utils';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';
import { configArea } from '../abaCidade/areas';
import { useMunicipiosSP } from '../../servicos/ibge';
import { useAnaliseMunicipio } from './useAnaliseMunicipio';
import useContagem from '../../utilitarios/useContagem';
import {
  formatarInteiro,
  formatarMoeda,
  formatarMoedaExtenso,
  formatarPercentual,
  formatarPeriodo,
} from '../../utilitarios/formatadores';

/**
 * ComparacaoMunicipios — Aba "Comparação"
 *
 * Duas cidades, lado a lado, no MESMO período (o seletor global no topo da
 * página) — comparar dois meses diferentes misturaria duas variáveis ao
 * mesmo tempo e confundiria a leitura.
 *
 * Em vez de dois cartões soltos (o olho ia e voltava entre eles), um placar:
 * cada linha é uma pergunta, com a Cidade A à esquerda, a Cidade B à
 * direita e barras que crescem do centro para fora. A frase do topo já
 * entrega a conclusão principal.
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

// Vermelho × azul: o par que melhor se distingue também em daltonismo.
// A cor nunca está sozinha: o nome da cidade acompanha cada lado.
const LADOS = {
  a: { rotulo: 'Cidade A', cor: '#A20000' },
  b: { rotulo: 'Cidade B', cor: '#1D4ED8' },
};

const subir = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const surgir = keyframes`
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
`;
const afastarA = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-6px); }
`;
const afastarB = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(6px); }
`;
const pulsar = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
`;

const entrada = (ordem) => ({ animation: `${subir} 0.5s cubic-bezier(0.05, 0.7, 0.1, 1) ${0.08 + ordem * 0.08}s both` });

const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatarVezes = (razao) => `${umaCasa.format(razao).replace(/,0$/, '')} ${razao < 2 ? 'vez' : 'vezes'}`;

/** Resultado da consulta → o que o placar precisa de cada cidade. */
function lerResultado(resultado) {
  if (resultado.status !== 'pronto') return { situacao: resultado.status, erro: resultado.erro };
  const { totais, distribuicao, insights } = resultado.dados ?? {};
  if (!totais?.totalRegistros) return { situacao: 'semDados' };
  const cr5 = insights?.concentracao;
  return {
    situacao: 'pronto',
    empenhado: totais.valorTotal ?? 0,
    pago: totais.porEtapa?.pago ?? null,
    empenhos: totais.totalEmpenhos ?? null,
    cr5: cr5 && Number.isFinite(Number(cr5.percentual)) ? { percentual: Number(cr5.percentual), alerta: Boolean(cr5.alerta) } : null,
    maiorArea: distribuicao?.[0] ?? null,
  };
}

// ─── Seletores ───────────────────────────────────────────────────────────────
function SeletorCidade({ lado, valor, opcoes, carregando, aoMudar }) {
  const { rotulo, cor } = LADOS[lado];
  return (
    <Autocomplete
      id={`seletor-municipio-${lado}`}
      options={opcoes}
      value={valor || null}
      loading={carregando}
      noOptionsText="Nenhum município encontrado"
      onChange={(_, novoValor) => aoMudar(novoValor || '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label={rotulo}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cor, mx: 0.5, flexShrink: 0 }} />
                {params.InputProps.startAdornment}
              </>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: cor },
            '& .MuiInputLabel-root.Mui-focused': { color: cor },
          }}
        />
      )}
    />
  );
}

// ─── Placar ──────────────────────────────────────────────────────────────────
function NomeCidade({ lado, children }) {
  return (
    <Box component="strong" sx={{ color: LADOS[lado].cor }}>
      {children}
    </Box>
  );
}

function CabecalhoLado({ lado, nome, dado }) {
  const direita = lado === 'b';
  let situacao = null;
  if (dado.situacao === 'carregando') {
    situacao = (
      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent={direita ? 'flex-end' : 'flex-start'}>
        <Box aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: LADOS[lado].cor, animation: `${pulsar} 1.2s ease-in-out infinite` }} />
        <Typography component="span" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Consultando o TCE-SP…</Typography>
      </Stack>
    );
  } else if (dado.situacao === 'erro') {
    situacao = (
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={direita ? 'flex-end' : 'flex-start'} role="alert">
        <CloudOffRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />
        <Typography component="span" sx={{ fontSize: '0.8125rem', color: 'error.main' }}>{dado.erro}</Typography>
      </Stack>
    );
  } else if (dado.situacao === 'semDados') {
    situacao = (
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Sem registros publicados neste período</Typography>
    );
  }

  return (
    <Box sx={{ minWidth: 0, textAlign: direita ? 'right' : 'left' }}>
      <Box aria-hidden sx={{ width: 28, height: 4, borderRadius: 2, bgcolor: LADOS[lado].cor, ml: direita ? 'auto' : 0 }} />
      <Typography sx={{ mt: 0.75, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'text.secondary' }}>
        {LADOS[lado].rotulo}
      </Typography>
      <Typography
        component="h3"
        sx={{ fontSize: { xs: '1rem', sm: '1.1875rem' }, fontWeight: 700, color: 'text.primary', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}
      >
        {nome}
      </Typography>
      {situacao && <Box sx={{ mt: 0.5 }}>{situacao}</Box>}
    </Box>
  );
}

/** Número que conta até o valor real (o leitor de tela ouve só o valor exato). */
function Numero({ valor, formatar, exato }) {
  const animado = useContagem(valor, 1200);
  return (
    <>
      <span aria-hidden="true">{formatar(animado)}</span>
      <Box component="span" sx={visuallyHidden}>{(exato ?? formatar)(valor)}</Box>
    </>
  );
}

function ValorLado({ lado, nome, dado, valor, formatar, exato, detalhe }) {
  const direita = lado === 'b';
  if (dado.situacao === 'carregando') {
    return <Skeleton variant="text" sx={{ fontSize: '1.625rem', width: '70%', justifySelf: direita ? 'end' : 'start' }} />;
  }
  if (valor == null) {
    return (
      <Typography sx={{ textAlign: direita ? 'right' : 'left', fontSize: '1.25rem', fontWeight: 700, color: 'text.disabled' }}>
        <span aria-hidden="true">—</span>
        <Box component="span" sx={visuallyHidden}>{nome}: sem dado</Box>
      </Typography>
    );
  }
  return (
    <Box sx={{ minWidth: 0, textAlign: direita ? 'right' : 'left' }}>
      <Typography
        component="p"
        title={exato?.(valor)}
        sx={{ fontSize: 'clamp(1rem, 4.6cqi, 1.625rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: 'text.primary', overflowWrap: 'anywhere' }}
      >
        <Box component="span" sx={visuallyHidden}>{nome}: </Box>
        <Numero valor={valor} formatar={formatar} exato={exato} />
      </Typography>
      {detalhe && <Box sx={{ mt: 0.5, display: 'flex', justifyContent: direita ? 'flex-end' : 'flex-start' }}>{detalhe}</Box>}
    </Box>
  );
}

/** Barras espelhadas: A cresce do centro para a esquerda, B para a direita. */
function Borboleta({ pa, pb, animado, marca }) {
  const metade = (lado, p) => {
    const direita = lado === 'b';
    return (
      <Box
        sx={{
          position: 'relative',
          height: 10,
          bgcolor: '#EEF1F4',
          borderRadius: direita ? '0 5px 5px 0' : '5px 0 0 5px',
          display: 'flex',
          justifyContent: direita ? 'flex-start' : 'flex-end',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${animado ? p : 0}%`,
            minWidth: animado && p > 0 ? 4 : 0,
            bgcolor: LADOS[lado].cor,
            borderRadius: direita ? '0 5px 5px 0' : '5px 0 0 5px',
            transition: 'width 0.9s cubic-bezier(0.05, 0.7, 0.1, 1)',
          }}
        />
        {marca != null && (
          // Contorno branco: a marca aparece tanto no trilho cinza quanto sobre a barra colorida
          <Box sx={{ position: 'absolute', top: 0, bottom: 0, [direita ? 'left' : 'right']: `${marca}%`, width: 2, bgcolor: '#0F172A', boxShadow: '0 0 0 1px #FFFFFF' }} />
        )}
      </Box>
    );
  };

  return (
    <Box aria-hidden sx={{ mt: 1.25, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
      {metade('a', pa)}
      {metade('b', pb)}
    </Box>
  );
}

function LinhaPlacar({ rotulo, ordem, children }) {
  return (
    <Box component="section" aria-label={rotulo} sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.25 }, ...entrada(ordem) }}>
      <Typography component="h4" sx={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
        {rotulo}
      </Typography>
      {children}
    </Box>
  );
}

/**
 * Uma pergunta do placar. `escala`:
 *   'relativa'    a maior das duas cidades ocupa a barra inteira
 *   'percentual'  a barra vai de 0 a 100% (para proporções, como o CR5)
 */
function LinhaDuelo({ rotulo, ordem, nomes, a, b, ler, formatar, exato, escala = 'relativa', marca, detalhe, legenda, animado }) {
  const va = a.situacao === 'pronto' ? ler(a) : null;
  const vb = b.situacao === 'pronto' ? ler(b) : null;
  const temBarras = va != null && vb != null;
  const maximo = escala === 'percentual' ? 100 : Math.max(va ?? 0, vb ?? 0) || 1;
  const proporcao = (v) => Math.min(Math.max(v ?? 0, 0) / maximo, 1) * 100;

  return (
    <LinhaPlacar rotulo={rotulo} ordem={ordem}>
      <Box sx={{ mt: 0.75, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', columnGap: 2, alignItems: 'start', containerType: 'inline-size' }}>
        <ValorLado lado="a" nome={nomes.a} dado={a} valor={va} formatar={formatar} exato={exato} detalhe={detalhe?.(a)} />
        <ValorLado lado="b" nome={nomes.b} dado={b} valor={vb} formatar={formatar} exato={exato} detalhe={detalhe?.(b)} />
      </Box>
      {temBarras && <Borboleta pa={proporcao(va)} pb={proporcao(vb)} animado={animado} marca={marca} />}
      {temBarras && legenda && (
        <Typography sx={{ mt: 0.75, textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>{legenda}</Typography>
      )}
    </LinhaPlacar>
  );
}

function AreaLado({ lado, dado }) {
  const direita = lado === 'b';
  if (dado.situacao === 'carregando') {
    return <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '80%', justifySelf: direita ? 'end' : 'start' }} />;
  }
  const area = dado.situacao === 'pronto' ? dado.maiorArea : null;
  if (!area) {
    return <Typography sx={{ textAlign: direita ? 'right' : 'left', fontSize: '1.25rem', fontWeight: 700, color: 'text.disabled' }}>—</Typography>;
  }
  const { Icone, cor } = configArea(area.nome);
  return (
    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: direita ? 'flex-end' : 'flex-start', textAlign: direita ? 'right' : 'left' }}>
      <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${cor}1A`, color: cor, display: 'grid', placeItems: 'center' }}>
        <Icone sx={{ fontSize: 20 }} />
      </Box>
      <Typography sx={{ mt: 0.75, fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3, overflowWrap: 'anywhere' }}>
        {area.nome}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
        {formatarPercentual(area.percentual)} do valor pago
      </Typography>
    </Box>
  );
}

function ChipCR5({ cr5 }) {
  if (!cr5) return null;
  const { alerta } = cr5;
  return (
    <Chip
      size="small"
      icon={alerta ? <InsightsRoundedIcon /> : <CheckCircleRoundedIcon />}
      label={alerta ? 'Destaque estatístico' : 'Dentro do esperado'}
      // Num lado de 150px o rótulo quebra em duas linhas em vez de virar "Destaque estatís…"
      sx={{
        maxWidth: '100%',
        height: 'auto',
        minHeight: 24,
        fontWeight: 700,
        fontSize: '0.75rem',
        color: alerta ? '#B45309' : '#15803D',
        bgcolor: alerta ? '#FEF3C7' : '#E8F5E9',
        '& .MuiChip-icon': { color: 'inherit', fontSize: 16 },
        '& .MuiChip-label': { px: 0.75, py: 0.25, whiteSpace: 'normal', lineHeight: 1.25 },
      }}
    />
  );
}

function FraseResumo({ a, b, nomes, periodo }) {
  if (a.situacao !== 'pronto' || b.situacao !== 'pronto' || !(a.empenhado > 0) || !(b.empenhado > 0)) return null;
  const [maior, menor] = a.empenhado >= b.empenhado ? [['a', a], ['b', b]] : [['b', b], ['a', a]];
  const razao = maior[1].empenhado / menor[1].empenhado;

  return (
    <Typography sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, textAlign: 'center', fontSize: '1rem', color: 'text.secondary', lineHeight: 1.6, ...entrada(0) }}>
      {razao < 1.05 ? (
        <>
          Em {periodo}, <NomeCidade lado="a">{nomes.a}</NomeCidade> e <NomeCidade lado="b">{nomes.b}</NomeCidade> empenharam valores parecidos.
        </>
      ) : (
        <>
          Em {periodo}, <NomeCidade lado={maior[0]}>{nomes[maior[0]]}</NomeCidade> empenhou{' '}
          <Box component="strong" sx={{ color: 'text.primary' }}>{formatarVezes(razao)}</Box> o valor de{' '}
          <NomeCidade lado={menor[0]}>{nomes[menor[0]]}</NomeCidade>.
        </>
      )}
    </Typography>
  );
}

function Placar({ nomes, a, b, periodo }) {
  const prontos = a.situacao === 'pronto' && b.situacao === 'pronto';
  const [animado, setAnimado] = useState(false);

  // As barras crescem a partir do centro quando as duas cidades chegam
  useEffect(() => {
    if (!prontos) {
      setAnimado(false);
      return undefined;
    }
    const t = setTimeout(() => setAnimado(true), 150);
    return () => clearTimeout(t);
  }, [prontos]);

  const comum = { nomes, a, b, animado };

  return (
    <Card component="section" aria-label={`Comparação entre ${nomes.a} e ${nomes.b}`} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* ── As duas cidades, frente a frente ─────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
            alignItems: 'center',
            columnGap: { xs: 1.5, sm: 2.5 },
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FAFBFC',
          }}
        >
          <CabecalhoLado lado="a" nome={nomes.a} dado={a} />
          <Box
            aria-hidden
            sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#0F172A', color: '#F8FAFC', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', animation: `${surgir} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both` }}
          >
            VS
          </Box>
          <CabecalhoLado lado="b" nome={nomes.b} dado={b} />
        </Box>

        <Box aria-live="polite">
          <FraseResumo a={a} b={b} nomes={nomes} periodo={periodo} />
        </Box>

        {/* ── As perguntas ─────────────────────────────────────────── */}
        <Box sx={{ '& > section + section': { borderTop: '1px solid', borderColor: 'divider' } }}>
          <LinhaDuelo
            {...comum}
            ordem={1}
            rotulo="Total empenhado no mês"
            ler={(d) => d.empenhado}
            formatar={formatarMoedaExtenso}
            exato={formatarMoeda}
          />
          <LinhaDuelo
            {...comum}
            ordem={2}
            rotulo="Valor pago no mês"
            ler={(d) => d.pago}
            formatar={formatarMoedaExtenso}
            exato={formatarMoeda}
          />
          <LinhaDuelo
            {...comum}
            ordem={3}
            rotulo="Empenhos no período"
            ler={(d) => d.empenhos}
            formatar={formatarInteiro}
          />
          <LinhaDuelo
            {...comum}
            ordem={4}
            rotulo="Com os 5 maiores fornecedores"
            ler={(d) => d.cr5?.percentual ?? null}
            formatar={formatarPercentual}
            escala="percentual"
            marca={LIMITE_CR5}
            detalhe={(d) => <ChipCR5 cr5={d.cr5} />}
            legenda={`A linha escura marca a referência de ${LIMITE_CR5}% do valor pago.`}
          />
          <LinhaPlacar rotulo="Maior área de destino" ordem={5}>
            <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', columnGap: 2, alignItems: 'start' }}>
              <AreaLado lado="a" dado={a} />
              <AreaLado lado="b" dado={b} />
            </Box>
          </LinhaPlacar>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <ExplicacaoCidada rotulo="Como ler a comparação">
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.25 }}>
              Os valores em reais são <strong>absolutos</strong>: cidades com mais habitantes costumam ter orçamentos
              maiores. A participação dos 5 maiores fornecedores e a maior área de destino são proporções e ajudam a
              comparar o perfil do gasto entre cidades de tamanhos diferentes.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.25 }}>
              <strong>Total empenhado</strong> é o dinheiro reservado no orçamento no mês. <strong>Valor pago</strong> é
              o que saiu do caixa (pode quitar empenhos de meses anteriores). <strong>Empenhos</strong> conta cada
              documento uma vez só.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              As barras comparam as duas cidades entre si: a maior ocupa a barra inteira. Na participação dos 5 maiores,
              a barra vai de 0 a 100%.
            </Typography>
          </ExplicacaoCidada>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Antes da escolha: um convite, não uma tela vazia ───────────────────────
const CONVITE = {
  ambas: ['Escolha duas cidades', 'Selecione a Cidade A e a Cidade B acima para ver as duas frente a frente, no mesmo período.'],
  a: ['Escolha a outra cidade', 'Selecione a Cidade A acima para ver as duas frente a frente, no mesmo período.'],
  b: ['Escolha a segunda cidade', 'Selecione a Cidade B acima para ver as duas frente a frente, no mesmo período.'],
};

function ConviteEscolha({ falta }) {
  const [titulo, texto] = CONVITE[falta];
  const circulo = (lado) => ({
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: '1.125rem',
    bgcolor: LADOS[lado].cor,
    border: '3px solid #FFFFFF',
    boxShadow: '0 8px 18px -10px rgba(15,23,42,0.5)',
  });

  return (
    <Card elevation={0} sx={{ border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent', boxShadow: 'none', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
      <CardContent sx={{ py: { xs: 5, sm: 6 }, textAlign: 'center' }}>
        <Box aria-hidden sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ ...circulo('a'), animation: `${afastarA} 2.6s ease-in-out infinite` }}>A</Box>
          <Box sx={{ ...circulo('b'), ml: -1.5, animation: `${afastarB} 2.6s ease-in-out infinite` }}>B</Box>
        </Box>
        <Typography component="p" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary' }}>
          {titulo}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary', maxWidth: 420, mx: 'auto', lineHeight: 1.55 }}>
          {texto}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ComparacaoMunicipios({ filtros, dadosAtuais }) {
  const { municipios, carregando: carregandoMunicipios } = useMunicipiosSP();
  const [municipioA, setMunicipioA] = useState(filtros.municipio || '');
  const [municipioB, setMunicipioB] = useState('');
  const [giro, setGiro] = useState(0);

  // Cidade A igual à que já está carregada no resto da página: reaproveita
  // em vez de repetir a mesma consulta ao TCE-SP.
  const reaproveitaA = Boolean(dadosAtuais) && municipioA === filtros.municipio;
  const buscaA = useAnaliseMunicipio(municipioA, filtros.ano, filtros.mes, { pular: reaproveitaA });
  const resultadoA = reaproveitaA ? { status: 'pronto', dados: dadosAtuais, erro: null } : buscaA;

  const resultadoB = useAnaliseMunicipio(municipioB, filtros.ano, filtros.mes);

  const periodo = formatarPeriodo(filtros.mes, filtros.ano);
  const trocar = () => {
    setMunicipioA(municipioB);
    setMunicipioB(municipioA);
    setGiro((g) => g + 180);
  };

  return (
    <Stack spacing={2.5}>
      <Card component="section" aria-labelledby="titulo-comparacao" elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Typography id="titulo-comparacao" component="h2" sx={{ fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
            Compare duas cidades
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.55 }}>
            As duas no mesmo período: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{periodo}</Box>.
            Para outro período, use o seletor no topo da página.
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto minmax(0, 1fr)' },
              gap: { xs: 1, sm: 1.5 },
              alignItems: 'center',
            }}
          >
            <SeletorCidade
              lado="a"
              valor={municipioA}
              opcoes={municipios.filter((m) => m !== municipioB)}
              carregando={carregandoMunicipios}
              aoMudar={setMunicipioA}
            />
            <Tooltip title="Trocar as cidades de lugar">
              <Box component="span" sx={{ justifySelf: 'center' }}>
                <IconButton
                  onClick={trocar}
                  disabled={!municipioA || !municipioB}
                  aria-label="Trocar as cidades de lugar"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transform: `rotate(${giro}deg)`,
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(15,23,42,0.04)' },
                  }}
                >
                  <SwapHorizRoundedIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
                  <SwapVertRoundedIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                </IconButton>
              </Box>
            </Tooltip>
            <SeletorCidade
              lado="b"
              valor={municipioB}
              opcoes={municipios.filter((m) => m !== municipioA)}
              carregando={carregandoMunicipios}
              aoMudar={setMunicipioB}
            />
          </Box>
        </CardContent>
      </Card>

      {municipioA && municipioB ? (
        // Nova dupla de cidades = o placar entra de novo, do zero
        <Placar
          key={`${municipioA}|${municipioB}`}
          nomes={{ a: municipioA, b: municipioB }}
          a={lerResultado(resultadoA)}
          b={lerResultado(resultadoB)}
          periodo={periodo}
        />
      ) : (
        <ConviteEscolha falta={!municipioA && !municipioB ? 'ambas' : !municipioA ? 'a' : 'b'} />
      )}
    </Stack>
  );
}
