import { Container, Typography, Grid, Paper } from '@mui/material';

const FEATURES = [
  { title: 'Graph clarity', text: 'See your JSON as a structured graph with smooth layout and intuitive nodes.' },
  { title: 'Tree precision', text: 'Expand, collapse, and copy values instantly with a clean tree explorer.' },
  { title: 'Excel export', text: 'Flatten nested objects and download a ready-to-share spreadsheet.' },
];

function FeaturesSection() {
  return (
    <Container sx={{ pb: 8 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Designed for clarity</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Borrowing the best ideas from JsonCrack and JsonLens.</Typography>
      <Grid container spacing={2}>
        {FEATURES.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{card.title}</Typography>
              <Typography color="text.secondary">{card.text}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default FeaturesSection;
