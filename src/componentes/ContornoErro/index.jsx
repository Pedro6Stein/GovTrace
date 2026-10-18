import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

/**
 * ContornoErro — Error Boundary genérico para qualquer componente com
 * import() dinâmico (lazy loading).
 *
 * Por quê: um <Suspense> sem <ErrorBoundary> ao redor é uma armadilha
 * conhecida do React — se o download do chunk falhar (rede instável, CDN
 * fora do ar, cache corrompido), o erro sobe sem ser capturado e o usuário
 * vê a tela travar ou "não acontecer nada", sem nenhuma explicação. Isso é
 * ainda mais provável em componentes pesados como o ProvaMatematica, que
 * baixa KaTeX + Framer Motion só quando clicado.
 *
 * Error Boundaries só existem como componente de CLASSE no React — não há
 * equivalente em hooks (getDerivedStateFromError/componentDidCatch).
 *
 * Props:
 *   mensagem  texto curto explicando o que falhou (default genérico)
 *   children
 */
export default class ContornoErro extends Component {
  state = { comErro: false };

  static getDerivedStateFromError() {
    return { comErro: true };
  }

  componentDidCatch(erro, info) {
    console.error('[GovTrace] Falha ao carregar um componente:', erro, info?.componentStack);
  }

  tentarNovamente = () => this.setState({ comErro: false });

  render() {
    if (!this.state.comErro) return this.props.children;

    return (
      <Box
        role="alert"
        sx={{
          p: 2.5,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: '#FCA5A5',
          bgcolor: '#FEF2F2',
          textAlign: 'center',
        }}
      >
        <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 28, mb: 1 }} />
        <Typography variant="body2" color="error.main" sx={{ mb: 1.5 }}>
          {this.props.mensagem || 'Não foi possível carregar esta parte da página.'}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<RefreshRoundedIcon />}
          onClick={this.tentarNovamente}
        >
          Tentar novamente
        </Button>
      </Box>
    );
  }
}
