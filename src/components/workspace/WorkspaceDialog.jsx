import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import TreeViewer from '../../TreeViewer';

function WorkspaceDialog({
  open,
  onClose,
  jsonInput,
  onInputChange,
  parsedData,
  error,
  searchQuery,
  onSearch,
  focusPath,
  split,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onUpdateValue,
  onOpenEditor,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Workspace
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{ p: 3, bgcolor: 'background.default', height: '100%' }}
        onMouseMove={onResizeMove}
        onMouseUp={onResizeEnd}
        onMouseLeave={onResizeEnd}
      >
        <Box sx={{ height: '100%', display: 'flex', gap: 0 }}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              width: `${split}%`,
              minWidth: 0,
            }}
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
                Editable in fullscreen
              </Typography>
            </Stack>
            <TextField
              multiline
              minRows={18}
              fullWidth
              value={jsonInput}
              onChange={onInputChange}
              placeholder='{
  "data": "paste JSON here..."
}'
              error={!!error}
              sx={{ flex: 1 }}
            />
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Parse error: {error}
              </Typography>
            )}
          </Paper>
          <Box
            role="separator"
            aria-orientation="vertical"
            onMouseDown={onResizeStart}
            sx={{
              width: 10,
              cursor: 'col-resize',
              mx: 1.5,
              position: 'relative',
              display: { xs: 'none', md: 'block' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: 2,
                bgcolor: 'divider',
                transform: 'translateX(-50%)',
                borderRadius: 999,
              },
            }}
          />
          <Paper
            sx={{
              p: 2,
              height: '100%',
              width: `${100 - split}%`,
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Graph view
              </Typography>
              <TextField
                size="small"
                placeholder="Search nodes"
                value={searchQuery}
                onChange={onSearch}
              />
            </Stack>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <TreeViewer
                data={parsedData}
                searchQuery={searchQuery}
                focusPath={focusPath}
                onOpenEditor={onOpenEditor}
                onUpdateValue={onUpdateValue}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Dialog>
  );
}

export default WorkspaceDialog;
