import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Stack, Autocomplete, TextField, CircularProgress } from '@mui/material';

// Geração dinâmica dos últimos 5 anos com base no ano atual do sistema
const anoAtual = new Date().getFullYear();
const anos = Array.from({ length: 5 }, (_, i) => (anoAtual - i).toString());

// Geração dinâmica e localizada dos meses
const meses = Array.from({ length: 12 }, (_, i) => {
  const data = new Date(0, i);
  return {
    valor: (i + 1).toString(),
    rotulo: data.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())
  };
});

export default function SeletorPeriodo({ filtros, onFiltroChange }) {
  const [municipiosSP, setMunicipiosSP] = useState([]);
  const [carregandoMunicipios, setCarregandoMunicipios] = useState(true);

  useEffect(() => {
    const buscarMunicipios = async () => {
      try {
        // Consumindo a API pública do IBGE para listar as 645 cidades de SP
        const resposta = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios');
        const dados = await resposta.json();
        
        // Extrai apenas os nomes e ordena em ordem alfabética
        const nomesMunicipios = dados.map(m => m.nome).sort();
        setMunicipiosSP(nomesMunicipios);
      } catch (erro) {
        console.error('Erro ao buscar municípios do IBGE:', erro);
        // Fallback de segurança para não travar a interface
        setMunicipiosSP(['Bragança Paulista', 'Campinas', 'São Paulo']);
      } finally {
        setCarregandoMunicipios(false);
      }
    };

    buscarMunicipios();
  }, []);

  const handleChange = (campo, valor) => {
    onFiltroChange({ ...filtros, [campo]: valor });
  };

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        
        <Autocomplete
          fullWidth
          options={municipiosSP}
          value={filtros.municipio}
          loading={carregandoMunicipios}
          onChange={(_, novoValor) => handleChange('municipio', novoValor || '')}
          disableClearable
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Município" 
              variant="outlined" 
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {carregandoMunicipios ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{ '& .MuiInputBase-root': { minHeight: '44px' } }}
            />
          )}
        />

        <FormControl fullWidth sx={{ maxWidth: { sm: 150 } }}>
          <InputLabel id="label-ano">Ano</InputLabel>
          <Select
            labelId="label-ano"
            value={filtros.ano}
            label="Ano"
            onChange={(e) => handleChange('ano', e.target.value)}
            sx={{ minHeight: '44px' }}
          >
            {anos.map((ano) => (
              <MenuItem key={ano} value={ano}>{ano}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ maxWidth: { sm: 200 } }}>
          <InputLabel id="label-mes">Mês</InputLabel>
          <Select
            labelId="label-mes"
            value={filtros.mes}
            label="Mês"
            onChange={(e) => handleChange('mes', e.target.value)}
            sx={{ minHeight: '44px' }}
          >
            {meses.map((mes) => (
              <MenuItem key={mes.valor} value={mes.valor}>{mes.rotulo}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
      </Stack>
    </Box>
  );
}