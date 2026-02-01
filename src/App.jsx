import { useState, useEffect, useRef, useMemo } from 'react';
import { exportToExcel, parseJSON } from './excelConverter';
import TreeViewer from './TreeViewer';
import JsonTreeView from './JsonTreeView';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  Divider,
  TextField,
  Grid,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const DEFAULT_JSON = {
  "users": [
    {
      "id": 1,
      "name": "Alice Martin",
      "email": "alice@example.com",
      "age": 28,
      "city": "Paris"
    },
    {
      "id": 2,
      "name": "Bob Dupont",
      "email": "bob@example.com",
      "age": 34,
      "city": "Lyon"
    },
    {
      "id": 3,
      "name": "Charlie Bernard",
      "email": "charlie@example.com",
      "age": 25,
      "city": "Marseille"
    }
  ],
  "metadata": {
    "total": 3,
    "timestamp": "2026-01-30"
  }
};

const GITHUB_URL = 'https://github.com/your-org/JsonPulse';
const DONATE_URL = 'https://github.com/sponsors/your-handle';

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [parsedData, setParsedData] = useState(DEFAULT_JSON);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('graph');
  const [theme, setTheme] = useState(() => localStorage.getItem('jp-theme') || 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      background: {
        default: theme === 'dark' ? '#0b0d10' : '#f8fafc',
        paper: theme === 'dark' ? '#151922' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    },
    shape: {
      borderRadius: 16,
    },
  }), [theme]);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    const result = parseJSON(jsonInput);

    if (result.success) {
      setParsedData(result.data);
      setError(null);
    } else {
      setParsedData(null);
      setError(result.error);
    }
  }, [jsonInput]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('jp-theme', theme);
  }, [theme]);

  const handleExport = async () => {
    if (!parsedData || error) return;

    setLoading(true);
    setSuccess(false);

    try {
      await exportToExcel(parsedData, 'export.xlsx');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Erreur lors de l\'export: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setError(null);
  };

  const handleLoadExample = () => {
    setJsonInput(JSON.stringify(DEFAULT_JSON, null, 2));
  };

  const handleFormat = () => {
    if (!jsonInput.trim()) return;
    const result = parseJSON(jsonInput);
    if (result.success) {
      setJsonInput(JSON.stringify(result.data, null, 2));
    } else {
      setError(result.error);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await loadJsonFile(file);
    event.target.value = '';
  };

  const loadJsonFile = async (file) => {
    try {
      const content = await file.text();
      const result = parseJSON(content);
      if (result.success) {
        setJsonInput(JSON.stringify(result.data, null, 2));
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Unable to read file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await loadJsonFile(file);
    }
  };

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUpdateValue = (path, rawInput) => {
    if (!parsedData || !Array.isArray(path) || !path.length) return;
    const pathParts = path[0] === 'root' ? path.slice(1) : path;
    const updated = JSON.parse(JSON.stringify(parsedData));
    let cursor = updated;
    for (let i = 0; i < pathParts.length - 1; i += 1) {
      const key = pathParts[i];
      const nextKey = Array.isArray(cursor) ? Number(key) : key;
      if (typeof cursor[nextKey] === 'undefined') return;
      cursor = cursor[nextKey];
    }
    const lastKeyRaw = pathParts[pathParts.length - 1];
    const lastKey = Array.isArray(cursor) ? Number(lastKeyRaw) : lastKeyRaw;
    let nextValue = rawInput;
    try {
      nextValue = JSON.parse(rawInput);
    } catch {
      // keep raw string
    }
    cursor[lastKey] = nextValue;
    setJsonInput(JSON.stringify(updated, null, 2));
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              JsonPulse
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" onClick={toggleTheme}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Button>
              <Button size="small" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</Button>
              <Button size="small" href={DONATE_URL} target="_blank" rel="noreferrer">Donate</Button>
              <Button variant="contained" onClick={scrollToEditor}>Open editor</Button>
            </Stack>
          </Toolbar>
        </AppBar>

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
                <Button variant="contained" onClick={scrollToEditor}>Try the editor</Button>
                <Button variant="outlined" onClick={handleLoadExample}>Load example</Button>
              </Stack>
              <Stack direction="row" spacing={1} color="text.secondary">
                <Button size="small" href={GITHUB_URL} target="_blank" rel="noreferrer">Open-source</Button>
                <Button size="small" href={DONATE_URL} target="_blank" rel="noreferrer">Support</Button>
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

        <Container sx={{ pb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Designed for clarity</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Borrowing the best ideas from JsonCrack and JsonLens.</Typography>
          <Grid container spacing={2}>
            {[
              { title: 'Graph clarity', text: 'See your JSON as a structured graph with smooth layout and intuitive nodes.' },
              { title: 'Tree precision', text: 'Expand, collapse, and copy values instantly with a clean tree explorer.' },
              { title: 'Excel export', text: 'Flatten nested objects and download a ready-to-share spreadsheet.' },
            ].map((card) => (
              <Grid item xs={12} md={4} key={card.title}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{card.title}</Typography>
                  <Typography color="text.secondary">{card.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container sx={{ pb: 10 }} ref={editorRef}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>JSON Workspace</Typography>
              <Typography color="text.secondary">Paste your JSON, choose the view, and export when ready.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={handleClear}>Clear</Button>
              <Button variant="outlined" onClick={handleLoadExample}>Load example</Button>
              <Button variant="outlined" onClick={handleFormat}>Format</Button>
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
              <Button variant={viewMode === 'graph' ? 'contained' : 'outlined'} onClick={() => setViewMode('graph')}>Graph</Button>
              <Button variant={viewMode === 'tree' ? 'contained' : 'outlined'} onClick={() => setViewMode('tree')}>Tree</Button>
            </Stack>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{ p: 2, height: '100%' }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>JSON input</Typography>
                  <Typography variant="caption" color="text.secondary">Drop .json file to import</Typography>
                </Stack>
                <TextField
                  multiline
                  minRows={20}
                  fullWidth
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  placeholder='{
  "data": "paste JSON here..."
}'
                  error={!!error}
                />
                {error && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Parse error: {error}
                  </Typography>
                )}
                {isDragging && (
                  <Box sx={{ mt: 1, p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                    Drop file to import
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Visualization</Typography>
                  <TextField
                    size="small"
                    placeholder="Search nodes"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </Stack>
                <Box
                  sx={{
                    minHeight: 520,
                    height: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    '& .graph-view': { height: '100%' },
                  }}
                >
                  {viewMode === 'graph' ? (
                    <TreeViewer
                      data={parsedData}
                      searchQuery={searchQuery}
                      onOpenEditor={scrollToEditor}
                      onUpdateValue={handleUpdateValue}
                    />
                  ) : (
                    <JsonTreeView data={parsedData} />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Export to Excel</Typography>
                <Typography variant="caption" color="text.secondary">Flatten objects to columns automatically.</Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleExport}
                disabled={!parsedData || error || loading}
              >
                {loading ? 'Exporting…' : success ? 'Exported' : 'Download XLSX'}
              </Button>
            </Stack>
          </Paper>
        </Container>

        <Divider />
        <Container sx={{ py: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" color="text.secondary">
            <Typography variant="caption">Private by design — everything runs in your browser.</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</Button>
              <Button size="small" href={DONATE_URL} target="_blank" rel="noreferrer">Donate</Button>
              <Typography variant="caption">Inspired by JsonCrack and JsonLens</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
