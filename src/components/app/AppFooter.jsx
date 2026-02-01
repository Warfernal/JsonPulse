import { Divider, Container, Stack, Typography, Button } from '@mui/material';

function AppFooter({ githubUrl, donateUrl }) {
  return (
    <>
      <Divider />
      <Container sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" color="text.secondary">
          <Typography variant="caption">Private by design — everything runs in your browser.</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" href={githubUrl} target="_blank" rel="noreferrer">GitHub</Button>
            <Button size="small" href={donateUrl} target="_blank" rel="noreferrer">Donate</Button>
            <Typography variant="caption">Inspired by JsonCrack and JsonLens</Typography>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default AppFooter;
