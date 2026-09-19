import { Card, CardContent, Typography, Box, Stack, Divider } from '@mui/material';
import { IconeAtencao, IconeNormal } from '../../icones/icones';

function CardAlerta({ titulo, mensagem, alertaAtivo }) {
  const corBase = alertaAtivo ? 'warning.main' : 'success.main';
  const Icone = alertaAtivo ? IconeAtencao : IconeNormal;

  return (
    <Box sx={{ 
      p: 3, 
      borderRadius: 3, 
      bgcolor: 'background.paper', // Fundo estritamente limpo e branco
      borderLeft: '4px solid', 
      borderColor: corBase,
      boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.03)' // Sombra quase imperceptível
    }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ color: corBase, mt: 0.5 }}>
          <Icone fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary', mb: 1 }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mensagem}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default function PainelAlertas({ insights }) {
  // Trava de segurança para impedir renderização se o motor principal falhar
  if (!insights || !insights.concentracao) return null;

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>
        Auditoria Algorítmica (O que a I.A. encontrou?)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Nossos motores analisam o volume e a temporalidade dos gastos cruzando com parâmetros da ciência de dados.
      </Typography>

      <Stack spacing={2}>
        <CardAlerta 
          titulo={insights.concentracao.mensagemPrincipal || "Concentração de Mercado"}
          mensagem={insights.concentracao.insightEducativo || "Base insuficiente."}
          alertaAtivo={insights.concentracao.alerta}
        />
        <CardAlerta 
          titulo={insights.zScore.titulo}
          mensagem={insights.zScore.insightEducativo}
          alertaAtivo={insights.zScore.alerta}
        />
        <CardAlerta 
          titulo={insights.benford.titulo}
          mensagem={insights.benford.insightEducativo}
          alertaAtivo={insights.benford.alerta}
        />
        <CardAlerta 
          titulo={insights.fracionamento.titulo}
          mensagem={insights.fracionamento.insightEducativo}
          alertaAtivo={insights.fracionamento.alerta}
        />
        <CardAlerta 
          titulo={insights.monopolio.titulo}
          mensagem={insights.monopolio.insightEducativo}
          alertaAtivo={insights.monopolio.alerta}
        />
      </Stack>
    </Box>
  );
}