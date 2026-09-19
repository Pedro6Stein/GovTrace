import { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination 
} from '@mui/material';

export default function TabelaEvidencias({ despesas }) {
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(10);

  if (!despesas || despesas.length === 0) return null;

  const handleChangePage = (event, novaPagina) => {
    setPagina(novaPagina);
  };

  const handleChangeRowsPerPage = (event) => {
    setLinhasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  // Lógica de paginação no front-end (O(1) para fatiar o array)
  const despesasPaginadas = despesas.slice(
    pagina * linhasPorPagina, 
    pagina * linhasPorPagina + linhasPorPagina
  );

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>
        Evidências e Registos Oficiais
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Explore os dados brutos que fundamentam a nossa análise estatística.
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        {/* TableContainer com overflowX auto garante que não parta o layout no telemóvel */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="tabela de evidências" size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Fornecedor</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.default' }}>Valor (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {despesasPaginadas.map((linha, index) => (
                <TableRow hover key={`${linha.documento}-${index}`}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{linha.data}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{linha.documento}</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 150, sm: 300, md: 450 } }}>
                      {linha.fornecedorNome}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={despesas.length}
          rowsPerPage={linhasPorPagina}
          page={pagina}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Registos por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
}