import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { toBlob } from 'html-to-image';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import CartaoCompartilhavel from './CartaoCompartilhavel';

// Mesmo teto de segurança usado em FormulaKatex.jsx: nunca trava esperando
// fontes que, por algum motivo, nunca disparam "ready" nesse navegador.
const TETO_ESPERA_FONTE_MS = 1200;

const esperarFontesProntas = () =>
  new Promise((resolve) => {
    if (!document.fonts?.ready) return resolve();
    const seguranca = setTimeout(resolve, TETO_ESPERA_FONTE_MS);
    document.fonts.ready.then(() => { clearTimeout(seguranca); resolve(); });
  });

// Nunca corta a explicação: em vez de truncar o texto, reduz a fonte dela
// até o texto inteiro caber no espaço reservado do cartão (ver medição
// abaixo, em ajustarFonteExplicacao).
const FONTE_EXPLICACAO_MAXIMA = 20;
const FONTE_EXPLICACAO_MINIMA = 12;

const slugMunicipio = (nome) =>
  (nome || 'municipio')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * DialogoCompartilhar — rasteriza CartaoCompartilhavel em PNG e oferece
 * baixar ou compartilhar (Web Share API, quando o navegador suporta arquivo).
 *
 * O cartão-fonte é montado fora da tela (nunca visível) só para o
 * html-to-image ter um nó real do DOM, com layout e fontes carregadas, pra
 * rasterizar — o que o usuário vê no diálogo é sempre o PNG já pronto.
 *
 * Props:
 *   aberto, aoFechar
 *   tipo, dados   mesmos de CartaoCena — a fonte de verdade do resultado
 *   filtros       { municipio, ano, mes }
 */
export default function DialogoCompartilhar({ aberto, aoFechar, tipo, dados, filtros }) {
  const tema = useTheme();
  const telaCheia = useMediaQuery(tema.breakpoints.down('sm'));
  const referenciaCartao = useRef(null);

  const [estado, setEstado] = useState('gerando'); // 'gerando' | 'pronto' | 'erro'
  const [blob, setBlob] = useState(null);
  const [urlImagem, setUrlImagem] = useState(null);
  const [podeCompartilharArquivo, setPodeCompartilharArquivo] = useState(false);
  const [fonteExplicacao, setFonteExplicacao] = useState(FONTE_EXPLICACAO_MAXIMA);

  // Mede a altura real do texto (fora da tela) contra o espaço reservado e
  // vai reduzindo a fonte até caber por inteiro — nunca corta a frase.
  const ajustarFonteExplicacao = async () => {
    for (let tamanho = FONTE_EXPLICACAO_MAXIMA; tamanho >= FONTE_EXPLICACAO_MINIMA; tamanho--) {
      flushSync(() => setFonteExplicacao(tamanho));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const container = referenciaCartao.current?.querySelector('[data-papel="explicacao-container"]');
      const texto = referenciaCartao.current?.querySelector('[data-papel="explicacao"]');
      if (!container || !texto) return; // sem explicação neste motor — nada a ajustar
      if (texto.scrollHeight <= container.clientHeight + 1) return; // já coube inteiro
    }
  };

  const gerarImagem = async () => {
    setEstado('gerando');
    try {
      await esperarFontesProntas();
      await ajustarFonteExplicacao(); // começa do maior tamanho a cada tentativa
      const novoBlob = await toBlob(referenciaCartao.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        backgroundColor: '#FFFFFF',
      });
      if (!novoBlob) throw new Error('html-to-image devolveu blob vazio');

      setBlob(novoBlob);
      setUrlImagem(URL.createObjectURL(novoBlob));
      setPodeCompartilharArquivo(
        Boolean(navigator.canShare?.({ files: [new File([novoBlob], 'a.png', { type: 'image/png' })] })),
      );
      setEstado('pronto');
    } catch (erro) {
      console.error('[GovTrace] Falha ao gerar imagem de compartilhamento:', erro);
      setEstado('erro');
    }
  };

  useEffect(() => {
    if (!aberto) return;
    gerarImagem();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve rodar na abertura do diálogo
  }, [aberto]);

  // Libera a memória do blob anterior sempre que uma nova URL é criada ou o
  // componente desmonta — senão cada "tentar novamente" vaza um Blob.
  useEffect(() => () => { if (urlImagem) URL.revokeObjectURL(urlImagem); }, [urlImagem]);

  const nomeArquivo = `govtrace-${tipo}-${slugMunicipio(filtros?.municipio)}-${filtros?.ano}-${filtros?.mes}.png`;

  const compartilhar = async () => {
    if (!blob) return;
    try {
      const arquivo = new File([blob], nomeArquivo, { type: 'image/png' });
      await navigator.share({
        files: [arquivo],
        title: 'GovTrace — Transparência Pública',
        text: 'Padrão estatístico do Laboratório Matemático do GovTrace.',
      });
    } catch (erro) {
      // AbortError = usuário cancelou o compartilhamento — não é uma falha real.
      if (erro?.name !== 'AbortError') console.error('[GovTrace] Falha ao compartilhar:', erro);
    }
  };

  return (
    <Dialog
      open={aberto}
      onClose={aoFechar}
      fullScreen={telaCheia}
      maxWidth="xs"
      fullWidth
      aria-labelledby="titulo-compartilhar"
    >
      <DialogTitle id="titulo-compartilhar" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        Compartilhar resultado
        <IconButton onClick={aoFechar} size="small" aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Nó real, fora da tela — é o que o html-to-image rasteriza. */}
        <Box sx={{ position: 'fixed', top: 0, left: '-9999px', pointerEvents: 'none' }} aria-hidden="true">
          <Box ref={referenciaCartao}>
            <CartaoCompartilhavel
              tipo={tipo}
              dados={dados}
              municipio={filtros?.municipio}
              ano={filtros?.ano}
              mes={filtros?.mes}
              fonteExplicacao={fonteExplicacao}
            />
          </Box>
        </Box>

        {estado === 'gerando' && (
          <Skeleton variant="rounded" sx={{ width: '100%', maxWidth: 320, aspectRatio: '1 / 1', borderRadius: '12px' }} />
        )}

        {estado === 'erro' && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 3, textAlign: 'center' }}>
            <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 28 }} />
            <Typography variant="body2" color="error.main">Não foi possível gerar a imagem.</Typography>
            <Button size="small" variant="outlined" color="error" startIcon={<RefreshRoundedIcon />} onClick={gerarImagem}>
              Tentar novamente
            </Button>
          </Stack>
        )}

        {estado === 'pronto' && (
          <Box
            component="img"
            src={urlImagem}
            alt="Prévia da imagem gerada com o resultado do Laboratório Matemático"
            sx={{ width: '100%', maxWidth: 320, aspectRatio: '1 / 1', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          component="a"
          href={urlImagem || undefined}
          download={nomeArquivo}
          disabled={estado !== 'pronto'}
          startIcon={<DownloadRoundedIcon />}
          variant="outlined"
          fullWidth={telaCheia}
        >
          Baixar imagem
        </Button>
        {podeCompartilharArquivo && (
          <Button
            onClick={compartilhar}
            disabled={estado !== 'pronto'}
            startIcon={<IosShareRoundedIcon />}
            variant="contained"
            fullWidth={telaCheia}
          >
            Compartilhar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
