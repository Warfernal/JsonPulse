import { Container, Grid, Chip, Typography, Stack, Button, Paper, Box } from '@mui/material';

function HeroSection({ onOpenEditor, onLoadExample, githubUrl, donateUrl }) {
  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Chip label="JSON → Excel • Graph • Tree" sx={{ mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Turn JSON into insight, not guesswork.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            JsonPulse lets you explore complex JSON like a map, switch between graph and tree views,
            then export clean Excel reports in seconds — all in your browser.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" onClick={onOpenEditor}>Try the editor</Button>
            <Button variant="outlined" onClick={onLoadExample}>Load example</Button>
          </Stack>
          <Stack direction="row" spacing={1} color="text.secondary">
            <Button size="small" href={githubUrl} target="_blank" rel="noreferrer">Open-source</Button>
            <Button size="small" href={donateUrl} target="_blank" rel="noreferrer">Support</Button>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Live preview</Typography>
            <Box component="pre" sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2, fontSize: 12, overflow: 'auto' }}>
{`{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "metadata": { "total": 2 }
}`}
            </Box>
            <Typography variant="caption" color="text.secondary">Graph & tree rendering ready</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HeroSection;
