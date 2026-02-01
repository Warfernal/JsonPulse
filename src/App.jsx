import { useMemo } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useJsonWorkspace from './hooks/useJsonWorkspace';
import AppHeader from './components/app/AppHeader';
import HeroSection from './components/app/HeroSection';
import FeaturesSection from './components/app/FeaturesSection';
import EditorSection from './components/app/EditorSection';
import AppFooter from './components/app/AppFooter';
import WorkspaceDialog from './components/workspace/WorkspaceDialog';

const DEFAULT_JSON = {
  users: [
    {
      id: 1,
      name: 'Alice Martin',
      email: 'alice@example.com',
      age: 28,
      city: 'Paris',
    },
    {
      id: 2,
      name: 'Bob Dupont',
      email: 'bob@example.com',
      age: 34,
      city: 'Lyon',
    },
    {
      id: 3,
      name: 'Charlie Bernard',
      email: 'charlie@example.com',
      age: 25,
      city: 'Marseille',
    },
  ],
  metadata: {
    total: 3,
    timestamp: '2026-01-30',
  },
};

const GITHUB_URL = 'https://github.com/your-org/JsonPulse';
const DONATE_URL = 'https://github.com/sponsors/your-handle';

function App() {
  const workspace = useJsonWorkspace(DEFAULT_JSON);
  const {
    jsonInput,
    setJsonInput,
    parsedData,
    error,
    loading,
    success,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    isDragging,
    editorRef,
    fileInputRef,
    handleExport,
    handleClear,
    handleLoadExample,
    handleFormat,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    scrollToEditor,
    workspaceOpen,
    openWorkspace,
    closeWorkspace,
    workspaceSplit,
    focusPath,
    handleWorkspaceResizeStart,
    handleWorkspaceResizeMove,
    handleWorkspaceResizeEnd,
    handleUpdateValue,
  } = workspace;

  const muiTheme = useMemo(
    () =>
      createTheme({
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
      }),
    [theme]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenEditor={scrollToEditor}
          githubUrl={GITHUB_URL}
          donateUrl={DONATE_URL}
        />
        <HeroSection
          onOpenEditor={scrollToEditor}
          onLoadExample={handleLoadExample}
          githubUrl={GITHUB_URL}
          donateUrl={DONATE_URL}
        />
        <FeaturesSection />
        <EditorSection
          editorRef={editorRef}
          jsonInput={jsonInput}
          onInputChange={(event) => setJsonInput(event.target.value)}
          parsedData={parsedData}
          error={error}
          viewMode={viewMode}
          onChangeView={setViewMode}
          searchQuery={searchQuery}
          onSearch={(event) => setSearchQuery(event.target.value)}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onClear={handleClear}
          onLoadExample={handleLoadExample}
          onFormat={handleFormat}
          onImportClick={() => fileInputRef.current?.click()}
          onFileSelect={handleFileSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onExport={handleExport}
          loading={loading}
          success={success}
          openWorkspace={openWorkspace}
          onUpdateValue={handleUpdateValue}
          onOpenEditor={scrollToEditor}
          focusPath={focusPath}
        />
        <AppFooter githubUrl={GITHUB_URL} donateUrl={DONATE_URL} />
      </Box>
      <WorkspaceDialog
        open={workspaceOpen}
        onClose={closeWorkspace}
        jsonInput={jsonInput}
        onInputChange={(event) => setJsonInput(event.target.value)}
        parsedData={parsedData}
        error={error}
        searchQuery={searchQuery}
        onSearch={(event) => setSearchQuery(event.target.value)}
        focusPath={focusPath}
        split={workspaceSplit}
        onResizeStart={handleWorkspaceResizeStart}
        onResizeMove={handleWorkspaceResizeMove}
        onResizeEnd={handleWorkspaceResizeEnd}
        onUpdateValue={handleUpdateValue}
        onOpenEditor={scrollToEditor}
      />
    </ThemeProvider>
  );
}

export default App;
