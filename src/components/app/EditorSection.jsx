import { Container, Stack, Box, Typography, Button, Grid, Paper, TextField } from '@mui/material';
import TreeViewer from '../../TreeViewer';
import JsonTreeView from '../../JsonTreeView';

function EditorSection({
  editorRef,
  jsonInput,
  onInputChange,
  parsedData,
  error,
  viewMode,
  onChangeView,
  searchQuery,
  onSearch,
  isDragging,
  fileInputRef,
  onClear,
  onLoadExample,
  onFormat,
  onImportClick,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onExport,
  loading,
  success,
  openWorkspace,
  onUpdateValue,
  onOpenEditor,
  focusPath,
}) {
  return (
    <Container sx={{ pb: 10 }} ref={editorRef}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            JSON Workspace
          </Typography>
          <Typography color="text.secondary">
            Paste your JSON, choose the view, and export when ready.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" onClick={onClear}>
            Clear
          </Button>
          <Button variant="outlined" onClick={onLoadExample}>
            Load example
          </Button>
          <Button variant="outlined" onClick={onFormat}>
            Format
          </Button>
          <Button variant="outlined" onClick={onImportClick}>
            Import JSON
          </Button>
          <Button
            variant={viewMode === 'graph' ? 'contained' : 'outlined'}
            onClick={() => onChangeView('graph')}
          >
            Graph
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'contained' : 'outlined'}
            onClick={() => onChangeView('tree')}
          >
            Tree
          </Button>
        </Stack>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, height: '100%' }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                JSON input
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Drop .json file to import
              </Typography>
            </Stack>
            <TextField
              multiline
              minRows={20}
              fullWidth
              value={jsonInput}
              onChange={onInputChange}
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
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                Drop file to import
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Visualization
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search nodes"
                  value={searchQuery}
                  onChange={onSearch}
                />
                <Button size="small" variant="outlined" onClick={openWorkspace}>
                  Fullscreen workspace
                </Button>
              </Stack>
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
                  focusPath={focusPath}
                  onOpenEditor={onOpenEditor}
                  onUpdateValue={onUpdateValue}
                />
              ) : (
                <JsonTreeView data={parsedData} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Export to Excel
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Flatten objects to columns automatically.
            </Typography>
          </Box>
          <Button variant="contained" onClick={onExport} disabled={!parsedData || error || loading}>
            {loading ? 'Exporting…' : success ? 'Exported' : 'Download XLSX'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default EditorSection;
