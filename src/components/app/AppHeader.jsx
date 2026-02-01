import { AppBar, Toolbar, Box, Typography, Button, Stack } from '@mui/material';

function AppHeader({ theme, onToggleTheme, onOpenEditor, githubUrl, donateUrl }) {
  return (
    <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          JsonPulse
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" onClick={onToggleTheme}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </Button>
          <Button size="small" href={githubUrl} target="_blank" rel="noreferrer">GitHub</Button>
          <Button size="small" href={donateUrl} target="_blank" rel="noreferrer">Donate</Button>
          <Button variant="contained" onClick={onOpenEditor}>Open editor</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
