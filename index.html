import React, { useState, useCallback, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import PromptInput from './components/PromptInput';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import FilterControls from './components/FilterControls';
import Modal from './components/Modal'; 
import DataProfileReport from './components/DataProfileReport'; 
import ChartRenderer from './components/ChartRenderer';
import AutomatedInsights from './components/AutomatedInsights';
import PromptHistory from './components/PromptHistory';
import { getDashboardSpecFromGemini, getAIDataProfile, getAutomatedInsights } from './services/geminiService';
import { DataRow, FileData, GeminiDashboardResponse, FilterConfig, ActiveFilters, DataProfile, DrillDownFilterState, ChartDescriptor, ProcessedChartData, AppState } from './types';

declare var pako: any;

const API_KEY_MISSING = !process.env.API_KEY;
const MAX_CATEGORICAL_OPTIONS = 30;
const MIN_ROWS_FOR_CATEGORICAL_HEURISTIC = 5;
const DEFAULT_THEME = "default";


// Funnel Icon SVG
const FunnelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.59L2.659 6.22A2.25 2.25 0 0 1 2 4.63V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
  </svg>
);

// Plus Icon SVG for FAB
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

// Info Icon for file data in modal
const InfoCircledIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-primary-400">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
);


const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [dashboardData, setDashboardData] = useState<GeminiDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [isFileProcessing, setIsFileProcessing] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>(DEFAULT_THEME);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [isProfilingData, setIsProfilingData] = useState<boolean>(false);
  const [automatedInsights, setAutomatedInsights] = useState<string[] | null>(null);
  const [isFetchingInsights, setIsFetchingInsights] = useState<boolean>(false);

  const [filterableColumns, setFilterableColumns] = useState<FilterConfig[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [filteredDataRows, setFilteredDataRows] = useState<DataRow[] | null>(null);
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false); 

  const [drillDownFilter, setDrillDownFilter] = useState<DrillDownFilterState | null>(null);
  const [focusedChart, setFocusedChart] = useState<{ spec: ChartDescriptor; data: ProcessedChartData } | null>(null);

  // Voice Recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    if (fileData?.rows) {
      setFilteredDataRows(fileData.rows); 
    } else {
      setFilteredDataRows(null);
    }
    setDrillDownFilter(null);
    setFocusedChart(null);
  }, [fileData]);

  // Effect to load state from URL on initial mount
  useEffect(() => {
    const loadStateFromUrl = () => {
        try {
            if (!window.location.hash || !window.location.hash.startsWith('#state=')) return;

            const encodedState = window.location.hash.substring('#state='.length);
            const decoded = atob(encodedState);
            const compressed = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
            const jsonString = pako.inflate(compressed, { to: 'string' });
            const loadedState = JSON.parse(jsonString) as AppState;

            if (loadedState.fileData && loadedState.dashboardData) {
                handleDataLoaded(loadedState.fileData.name, loadedState.fileData.columns, loadedState.fileData.rows, true).then(() => {
                    setDashboardData(loadedState.dashboardData);
                    setActiveFilters(loadedState.activeFilters || {});
                    setDrillDownFilter(loadedState.drillDownFilter || null);
                    setSelectedTheme(loadedState.selectedTheme || DEFAULT_THEME);
                    setCurrentPrompt(loadedState.currentPrompt || "");
                    setPromptHistory(loadedState.promptHistory || []);
                });
                window.history.replaceState(null, '', window.location.pathname + window.location.search); // Clear hash
            }
        } catch (e) {
            console.error("Failed to load state from URL hash:", e);
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    };
    loadStateFromUrl();
  }, []);


  useEffect(() => {
    const newFilterableColumns: FilterConfig[] = [];
    if (fileData && fileData.columns.length > 0 && fileData.rows.length > 0) {
      for (const col of fileData.columns) {
        const sampleValue = fileData.rows[0][col];

        if (typeof sampleValue === 'number') {
          const values = fileData.rows.map(r => r[col] as number).filter(v => typeof v === 'number' && !isNaN(v));
          if (values.length > 0) {
            newFilterableColumns.push({
              column: col,
              type: 'numerical',
              min: Math.min(...values),
              max: Math.max(...values),
            });
          }
        } else if (typeof sampleValue === 'string' || sampleValue === null || sampleValue === undefined ) {
          if (fileData.rows.length >= MIN_ROWS_FOR_CATEGORICAL_HEURISTIC) {
            const uniqueValues = Array.from(new Set(fileData.rows.map(r => String(r[col] ?? ''))));
             if (uniqueValues.length > 0 && uniqueValues.length <= MAX_CATEGORICAL_OPTIONS) {
               newFilterableColumns.push({
                 column: col,
                 type: 'categorical',
                 options: uniqueValues.sort(),
               });
             }
          }
        }
      }
    }
    setFilterableColumns(newFilterableColumns);
    setActiveFilters({});
    setDrillDownFilter(null); 
    setFocusedChart(null); 
  }, [fileData]);

  useEffect(() => {
    if (!fileData?.rows) {
      setFilteredDataRows(null);
      return;
    }

    let intermediateRows = [...fileData.rows];

    if (drillDownFilter) {
      intermediateRows = intermediateRows.filter(row => {
        const rowValue = row[drillDownFilter.column];
        if (drillDownFilter.value === null || drillDownFilter.value === undefined || String(drillDownFilter.value).toLowerCase() === '[blank]' || String(drillDownFilter.value).toLowerCase() === 'n/a' ) {
            return rowValue === null || rowValue === undefined || String(rowValue).trim() === '' || String(rowValue).toLowerCase() === 'n/a';
        }
        return String(rowValue) === String(drillDownFilter.value);
      });
    }
    
    if (Object.keys(activeFilters).length > 0) {
      for (const column in activeFilters) {
        const filterValue = activeFilters[column];
        const columnConfig = filterableColumns.find(fc => fc.column === column);

        if (columnConfig?.type === 'categorical' && Array.isArray(filterValue) && filterValue.length > 0) {
          intermediateRows = intermediateRows.filter(row => {
              const rowVal = String(row[column] ?? ''); 
              return filterValue.includes(rowVal);
          });
        } else if (columnConfig?.type === 'numerical' && typeof filterValue === 'object') {
          const { min, max } = filterValue as { min?: number | string; max?: number | string };
          const numMin = (min === '' || min === undefined) ? -Infinity : Number(min);
          const numMax = (max === '' || max === undefined) ? Infinity : Number(max);

          if (!isNaN(numMin) && !isNaN(numMax)) {
            intermediateRows = intermediateRows.filter(row => {
              const val = Number(row[column]);
              if (isNaN(val)) return false; 
              return val >= numMin && val <= numMax;
            });
          }
        }
      }
    }
    setFilteredDataRows(intermediateRows);
  }, [activeFilters, fileData?.rows, filterableColumns, drillDownFilter]);


  const handleDataLoaded = useCallback(async (fileName: string, columns: string[], rows: DataRow[], fromShare: boolean = false) => {
    const newFileData = { name: fileName, columns, rows };
    setFileData(newFileData); // Set file data immediately
    setError(null); 

    if (!fromShare) {
        setDataProfile(null); 
        setDrillDownFilter(null); 
        setFocusedChart(null);
        setAutomatedInsights(null); 
        setDashboardData(null); 
        setPromptHistory([]);
    }

    if (columns.length > 0 && rows.length > 0) {
        if (API_KEY_MISSING) {
            setError("Data loaded, but AI features (like Data Profiling and Dashboard Generation) are disabled. API_KEY is missing.");
            setDataProfile({ 
                overallSummary: "AI-powered data profiling is unavailable because the API key is not configured.",
                columns: columns.map(col => ({
                    columnName: col,
                    inferredType: "N/A",
                    missingPercentage: 0,
                    notes: "Profiling disabled."
                }))
            });
            return; 
        }

        setIsProfilingData(true);
        try {
            const profileResponse = await getAIDataProfile(columns, rows.slice(0, 10)); 
            setDataProfile(profileResponse.profile);
            if (profileResponse.profile.overallSummary.toLowerCase().includes("error:")) {
                 setError(prevError => prevError ? `${prevError}\nData Profile Note: ${profileResponse.profile.overallSummary}` : `Data Profile Note: ${profileResponse.profile.overallSummary}`);
            } else if (!fromShare) {
                setIsFetchingInsights(true);
                getAutomatedInsights(columns, rows.slice(0, 10))
                    .then(insightsResponse => {
                        setAutomatedInsights(insightsResponse.suggestedPrompts);
                    })
                    .catch(insightsError => {
                        console.error("Error getting AI automated insights:", insightsError);
                    })
                    .finally(() => {
                        setIsFetchingInsights(false);
                    });
            }
        } catch (profileError: any) {
            console.error("Error getting AI data profile:", profileError);
            setError(prevError => prevError ? `${prevError}\nFailed to generate AI data profile: ${profileError.message}` : `Failed to generate AI data profile: ${profileError.message}`);
            setDataProfile(null); 
        } finally {
            setIsProfilingData(false);
        }

    } else if (columns.length > 0 && rows.length === 0) { 
        setError(`File "${fileName}" has headers but no data rows. AI analysis might be limited.`);
    } else { 
        setFileData(null); 
        setError(`File "${fileName}" was processed but appears to be empty or has no usable data structure.`);
    }

    if(!fromShare) {
        setDashboardData(null); 
    }
  }, []); 


  const handleFilterChange = useCallback((column: string, value: any) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && !Array.isArray(value) && value.min === undefined && value.max === undefined) ||
        (typeof value === 'object' && !Array.isArray(value) && value.min === '' && value.max === '')
      ) {
        delete newFilters[column];
      } else {
        newFilters[column] = value;
      }
      return newFilters;
    });
  }, []);

  const handleClearIndividualFilter = useCallback((column: string) => {
    setActiveFilters(prev => {
        const newFilters = {...prev};
        delete newFilters[column];
        return newFilters;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    if (!fileData || !fileData.columns || fileData.columns.length === 0) {
      setError('Please upload and process a data file with valid headers and content first.');
      return;
    }
    if (API_KEY_MISSING) {
        setError("Gemini API Key is not configured. Please set the API_KEY environment variable.");
        return;
    }

    setIsLoading(true);
    setError(null); 
    setCurrentPrompt(prompt);
    setPromptHistory(prev => [prompt, ...prev.filter(p => p !== prompt)].slice(0, 10));
    setIsInputModalOpen(false); 
    setDrillDownFilter(null); 
    setFocusedChart(null); 
    try {
      const sampleRowsForSpec = fileData.rows.slice(0, 5);
      const spec = await getDashboardSpecFromGemini(prompt, fileData.columns, sampleRowsForSpec, null);

      if (spec && spec.elements && spec.elements.length === 1 && spec.elements[0].id.startsWith("error_element_")) {
           console.warn("Gemini service returned an error structure for dashboard specification:", spec.elements[0].title);
      }
      setDashboardData(spec);
      setSelectedTheme(spec.themeSuggestion || DEFAULT_THEME); 

    } catch (err) {
      console.error("Error getting dashboard spec from service:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to generate dashboard: ${message}`);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fileData]); 

  const handleRefineDashboard = useCallback(async (prompt: string) => {
    if (!fileData || !fileData.columns || fileData.columns.length === 0 || !dashboardData) {
      setError('Cannot refine: Initial dashboard or data is missing.');
      return;
    }
    if (API_KEY_MISSING) {
      setError("Gemini API Key is not configured. Please set the API_KEY environment variable.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentPrompt(`Refining with: "${prompt}"`);
    setPromptHistory(prev => [prompt, ...prev.filter(p => p !== prompt)].slice(0, 10));
    setDrillDownFilter(null);
    setFocusedChart(null);
    
    try {
      const sampleRowsForSpec = fileData.rows.slice(0, 5);
      const spec = await getDashboardSpecFromGemini(prompt, fileData.columns, sampleRowsForSpec, dashboardData);
      
      if (spec && spec.elements && spec.elements.length === 1 && spec.elements[0].id.startsWith("error_element_")) {
        console.warn("Gemini service returned an error structure during refinement:", spec.elements[0].title);
      }
      setDashboardData(spec);
      if (spec.themeSuggestion) {
        setSelectedTheme(spec.themeSuggestion);
      }

    } catch (err) {
      console.error("Error refining dashboard spec:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to refine dashboard: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fileData, dashboardData]);

  const handleChartElementClick = useCallback((column: string, value: any) => {
    setDrillDownFilter(prevFilter => {
      const filterValue = (value === '' || value === null || value === undefined) ? '[Blank]' : value;
      if (prevFilter && prevFilter.column === column && prevFilter.value === filterValue) {
        return null; 
      }
      return { column, value: filterValue }; 
    });
  }, []);

  const clearDrillDownFilter = useCallback(() => {
    setDrillDownFilter(null);
  }, []);

  const handleFocusChart = useCallback((spec: ChartDescriptor, data: ProcessedChartData) => {
    setFocusedChart({ spec, data });
  }, []);

  const handleClearFocusChart = useCallback(() => {
    setFocusedChart(null);
  }, []);

  const handleDrillDownFromFocusedChart = useCallback((column: string, value: any) => {
    handleChartElementClick(column, value); 
    handleClearFocusChart(); 
  }, [handleChartElementClick, handleClearFocusChart]);

  const handlePromptClick = useCallback((prompt: string) => {
    handlePromptSubmit(prompt);
  }, [handlePromptSubmit]);

  const handleSaveAndShare = (): string => {
    if (!fileData || !dashboardData) {
        alert("Cannot share, data or dashboard is missing.");
        return "";
    }
    
    const state: AppState = {
        fileData,
        dashboardData,
        activeFilters,
        drillDownFilter,
        selectedTheme,
        currentPrompt,
        promptHistory
    };
    
    const jsonString = JSON.stringify(state);
    const compressed = pako.deflate(jsonString);
    const encodedState = btoa(String.fromCharCode.apply(null, compressed as any));
    
    const url = new URL(window.location.href);
    url.hash = `state=${encodedState}`;
    
    return url.href;
  };

  const handleToggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        setVoiceError("Voice recognition is not supported by your browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
    };

    recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
        setVoiceError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            handleRefineDashboard(transcript);
        }
    };
    
    recognition.start();
  };


  const isGenerateDisabled = isLoading || isFileProcessing || !fileData || !fileData.columns || fileData.columns.length === 0 || API_KEY_MISSING || isProfilingData || isFetchingInsights;
  const isFilterButtonDisabled = isLoading || isFileProcessing || !fileData || !fileData.rows || fileData.rows.length === 0 || filterableColumns.length === 0 || isProfilingData || isFetchingInsights;
  const activeFilterCount = Object.keys(activeFilters).length;

  const handleChangeFile = () => {
    setFileData(null);
    setDashboardData(null);
    setCurrentPrompt("");
    setError(null); 
    setSelectedTheme(DEFAULT_THEME); 
    setDataProfile(null); 
    setIsProfilingData(false);
    setDrillDownFilter(null); 
    setActiveFilters({}); 
    setFilterableColumns([]);
    setFocusedChart(null);
    setAutomatedInsights(null);
    setIsFetchingInsights(false);
    setPromptHistory([]);
  };

  const handleDataCleanAction = useCallback((columnName: string, action: 'remove_missing' | 'fill_mean') => {
    if (!fileData) return;

    let newRows: DataRow[] = [];
    if (action === 'remove_missing') {
        newRows = fileData.rows.filter(row => row[columnName] !== null && row[columnName] !== undefined && String(row[columnName]).trim() !== '');
    } else if (action === 'fill_mean') {
        const numericValues = fileData.rows
            .map(row => parseFloat(String(row[columnName])))
            .filter(val => !isNaN(val));
        
        if (numericValues.length === 0) {
            setError(`Cannot fill with mean: No numeric values found in column "${columnName}".`);
            return;
        }

        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        
        newRows = fileData.rows.map(row => {
            const val = row[columnName];
            if (val === null || val === undefined || String(val).trim() === '' || isNaN(parseFloat(String(val)))) {
                return { ...row, [columnName]: mean };
            }
            return row;
        });
    }

    if (newRows.length !== fileData.rows.length) {
        setError(null); // Clear previous errors
        handleDataLoaded(fileData.name, fileData.columns, newRows);
        // Optionally show a success message
        setTimeout(() => alert(`${fileData.rows.length - newRows.length} rows affected by the cleaning action. Data has been re-profiled.`), 100);
    }

  }, [fileData, handleDataLoaded]);

  const handleChartTypeChange = useCallback((elementId: string, newType: ChartDescriptor['type']) => {
    setDashboardData(prev => {
        if (!prev) return null;
        const newElements = prev.elements.map(el => {
            if (el.id === elementId && el.type !== 'KPI') {
                const newEl: ChartDescriptor = { ...el, type: newType };
                // PieCharts have different data key requirements, reset metrics/dimension if needed
                if(newType === 'PieChart' && el.type !== 'PieChart') {
                    // This is a simplistic assumption. The AI would ideally regenerate this.
                    // For now, we'll just change the type and let the renderer adapt.
                }
                return newEl;
            }
            return el;
        });
        return { ...prev, elements: newElements };
    });
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center p-2 md:p-4 selection:bg-accent-500 selection:text-white">
        <header className="w-full max-w-7xl text-center py-6 md:py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-500 to-sky-400">
            AI-Powered Insight Engine
          </h1>
          <p className="text-slate-400 mt-3 text-sm md:text-base max-w-2xl mx-auto">
            Upload data, ask in natural language, SQL, or Python (for data logic), and transform it into stunning, insightful dashboards instantly. Apply filters, drill-down, get AI anomaly insights, and focus on visuals.
          </p>
        </header>

        {API_KEY_MISSING && (
           <div className="w-full max-w-4xl mb-6 p-4">
              <ErrorMessage title="Configuration Error" message="Gemini API Key (API_KEY) is not set. Please ensure it's configured in your environment for the application to function." />
          </div>
        )}
        
        {error && !isLoading && !isInputModalOpen && (
            <div className="w-full max-w-4xl mb-4 p-2">
            <ErrorMessage message={error} />
            </div>
        )}


        <main className="w-full max-w-7xl px-2 flex-grow flex flex-col">
          <div className="space-y-4 flex-grow flex flex-col">
            {fileData && fileData.rows && fileData.rows.length > 0 && filterableColumns.length > 0 && (
                <div className="flex justify-end mb-0">
                    <button
                        onClick={() => setIsFilterPaneOpen(true)}
                        disabled={isFilterButtonDisabled}
                        className="relative flex items-center gap-2 px-4 py-2 bg-primary-600/80 hover:bg-primary-500/90 backdrop-blur-sm text-white rounded-lg shadow-lg hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                        title="Open Filters"
                        aria-label="Open filter panel"
                    >
                        <FunnelIcon />
                        <span className="text-sm font-medium">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            )}
             <div className="bg-slate-800/60 backdrop-blur-md shadow-2xl rounded-xl border border-slate-700/50 flex-grow flex flex-col min-h-[400px] lg:min-h-[calc(100vh-320px)] max-h-[calc(100vh-180px)]">
              <Dashboard
                dashboardData={dashboardData}
                rawData={filteredDataRows} 
                originalFileData={fileData}
                isLoading={isLoading && !isFileProcessing && !isProfilingData}
                currentPrompt={currentPrompt}
                activeFiltersCount={activeFilterCount}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                drillDownFilter={drillDownFilter}
                onChartElementClick={handleChartElementClick}
                onClearDrillDownFilter={clearDrillDownFilter}
                onFocusChart={handleFocusChart}
                onRefine={handleRefineDashboard}
                onSaveAndShare={handleSaveAndShare}
                onToggleListening={handleToggleListening}
                isListening={isListening}
                voiceError={voiceError}
                onChartTypeChange={handleChartTypeChange}
              />
            </div>
          </div>
        </main>
      </div>

      <button
        onClick={() => {
            setError(null); 
            setIsInputModalOpen(true);
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-to-br from-accent-500 to-teal-500 hover:from-accent-600 hover:to-teal-600 text-white p-4 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent-500/50 transition-all duration-200 ease-in-out hover:scale-110 z-[1000]"
        title="Add Data & Ask Question"
        aria-label="Add Data and Ask Question"
      >
        <PlusIcon />
      </button>

      <Modal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        title={fileData ? "Data Hub & AI Query" : "Upload Data & Query AI"}
        size="lg" 
      >
        <div className="space-y-6 p-1 md:p-2">
            {error && ( 
              <div className="mb-0">
                <ErrorMessage message={error} title="Input Issue" />
              </div>
            )}

            {fileData && fileData.columns.length > 0 ? (
                <div className="space-y-6">
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-xl shadow">
                        <div className="flex items-start">
                            <InfoCircledIcon />
                            <div>
                                <p className="text-sm font-medium text-primary-300">
                                    Active Data Source: <span className="font-semibold text-primary-200">{fileData.name}</span>
                                </p>
                                <p className="text-xs text-slate-400">{fileData.rows.length} rows, {fileData.columns.length} columns.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleChangeFile}
                            className="mt-3 text-xs text-accent-400 hover:text-accent-300 font-medium focus:outline-none underline"
                        >
                            Upload a different file
                        </button>
                    </div>
                    
                    {isProfilingData && <LoadingSpinner message="AI is analyzing data structure..." />}
                    {dataProfile && !isProfilingData && <DataProfileReport profile={dataProfile} onCleanAction={handleDataCleanAction} />}

                    <PromptHistory history={promptHistory} onPromptClick={handlePromptClick} />

                    <AutomatedInsights 
                        insights={automatedInsights} 
                        isLoading={isFetchingInsights} 
                        onPromptClick={handlePromptClick} 
                    />

                    <PromptInput onSubmit={handlePromptSubmit} disabled={isGenerateDisabled} />
                </div>
            ) : (
                <>
                    <FileUpload
                        onDataLoaded={(name, cols, rows) => handleDataLoaded(name, cols, rows)} 
                        setLoading={setIsFileProcessing}
                        setError={(criticalError) => { 
                            setError(criticalError);
                            setFileData(null);
                            setDashboardData(null);
                            setDataProfile(null);
                        }}
                    />
                    {isFileProcessing && <LoadingSpinner message="Processing file..." />}
                    {isProfilingData && <LoadingSpinner message="AI is analyzing data structure..." />}
                    {dataProfile && !isProfilingData && <DataProfileReport profile={dataProfile} onCleanAction={handleDataCleanAction} />}

                    <AutomatedInsights 
                        insights={automatedInsights} 
                        isLoading={isFetchingInsights} 
                        onPromptClick={handlePromptClick} 
                    />

                    <PromptInput onSubmit={handlePromptSubmit} disabled={isGenerateDisabled} />
                </>
            )}
        </div>
      </Modal>

      <FilterControls
        isOpen={isFilterPaneOpen}
        onClose={() => setIsFilterPaneOpen(false)}
        filterableColumns={filterableColumns}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearIndividualFilter={handleClearIndividualFilter}
        onClearFilters={handleClearFilters}
        disabled={isLoading || isFileProcessing || isProfilingData}
      />

      {focusedChart && (
        <Modal
          isOpen={!!focusedChart}
          onClose={handleClearFocusChart}
          title={`Focus View: ${focusedChart.spec.title}`}
          size="xl" 
        >
          <div className="w-full h-[70vh] min-h-[400px] p-1 bg-slate-700/30 rounded-lg">
            <ChartRenderer
              processedData={focusedChart.data}
              themeSuggestion={selectedTheme}
              onChartElementClick={handleDrillDownFromFocusedChart} 
            />
          </div>
          {focusedChart.spec.interpretation && (
             <div className="mt-4 p-3 bg-slate-700/50 border-t border-slate-600 text-sm text-slate-300 rounded-b-xl">
                <p><span className="font-semibold text-primary-300">AI Interpretation:</span> {focusedChart.spec.interpretation}</p>
             </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default App;
