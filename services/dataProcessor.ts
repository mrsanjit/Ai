
import { DataRow, DashboardElementSpec, KPIDescriptor, ChartDescriptor, ProcessedChartData, ProcessedKPIData, MetricDefinition } from '../types';

declare var Papa: any; // From CDN
declare var XLSX: any; // From CDN
declare var alasql: any; // From CDN

interface PapaParseError {
  type: string;
  code: string;
  message: string;
  row?: number; 
}
interface PapaParseMeta {
  delimiter?: string;
  linebreak?: string;
  aborted?: boolean;
  fields?: string[];
  truncated?: boolean;
  cursor?: number;
}
interface PapaParseResult<T> {
  data: T[];
  errors: PapaParseError[];
  meta: PapaParseMeta;
}


export const parseFile = (file: File): Promise<{ columns: string[], rows: DataRow[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        if (!buffer) {
          reject(new Error('File content could not be read.'));
          return;
        }

        if (file.name.endsWith('.csv')) {
          Papa.parse(buffer as string, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, 
            complete: (results: PapaParseResult<DataRow>) => { 
              if (results.errors && results.errors.length > 0) {
                const criticalError = results.errors.find(e => e.code !== 'TooFewFields' && e.code !== 'TooManyFields');
                if (criticalError) {
                    console.error("Critical CSV Parsing error:", criticalError);
                    reject(new Error(`CSV Parsing Error: ${criticalError.message} (Row: ${criticalError.row})`));
                    return;
                } else if (results.errors.length > 0) {
                    console.warn("Minor CSV Parsing issues (e.g. inconsistent field counts):", results.errors);
                }
              }
              const cleanedRows = results.data.filter(row => 
                row && typeof row === 'object' && Object.values(row).some(val => val !== null && val !== undefined && val !== '')
              );
              resolve({ columns: results.meta.fields || (cleanedRows.length > 0 ? Object.keys(cleanedRows[0]) : []), rows: cleanedRows });
            },
            error: (error: Error) => reject(error),
          });
        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
          
          if (!jsonData || jsonData.length === 0) {
            resolve({ columns: [], rows: [] });
            return;
          }
          
          if(workbook.IsEncrypted) {
             reject(new Error('Cannot read password-protected Excel files. Please remove the password and try again.'));
             return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map((rowArray: any[]) => {
            const row: DataRow = {};
            headers.forEach((header, index) => {
              row[header] = rowArray[index];
            });
            return row;
          });
          const cleanedRows = rows.filter(row => 
            row && typeof row === 'object' && Object.values(row).some(val => val !== null && val !== undefined && val !== '')
          );
          resolve({ columns: headers, rows: cleanedRows });
        } else if (file.name.endsWith('.json')) {
            try {
                const jsonString = buffer as string;
                const parsedJson = JSON.parse(jsonString);
                let rows: DataRow[] = [];
                let columns: string[] = [];
    
                if (Array.isArray(parsedJson)) {
                    rows = parsedJson as DataRow[];
                } else if (typeof parsedJson === 'object' && parsedJson !== null) {
                    const arrayKey = Object.keys(parsedJson).find(key => Array.isArray(parsedJson[key]));
                    if (arrayKey && Array.isArray(parsedJson[arrayKey])) {
                        rows = parsedJson[arrayKey] as DataRow[];
                    } 
                    // If not an array and no top-level key is an array, check if the object itself is a single record.
                    // Heuristic: if it's an object and contains non-array values, it's likely a single record.
                    else if (Object.values(parsedJson).some(val => !Array.isArray(val))) { 
                         rows = [parsedJson as DataRow];
                    } else {
                        reject(new Error('JSON file is an object but not a single record or an object containing a clear top-level array of records. Expected formats: `[{}, {}]`, `{"dataKey": [{}, {}]}`, or a single `{}` record.'));
                        return;
                    }
                } else {
                    reject(new Error('JSON file content is not a valid JSON structure (array of objects, single object, or object containing an array of records).'));
                    return;
                }
    
                if (rows.length > 0) {
                    if (typeof rows[0] === 'object' && rows[0] !== null) {
                        columns = Object.keys(rows[0]);
                    } else {
                         reject(new Error('JSON array does not contain objects. Each element in the array must be an object.'));
                         return;
                    }
                }
                
                const cleanedRows = rows.filter(row => 
                    row && typeof row === 'object' && Object.values(row).some(val => val !== null && val !== undefined && val !== '')
                );
    
                resolve({ columns, rows: cleanedRows });
    
            } catch (jsonError: any) {
                console.error("JSON Parsing error:", jsonError);
                reject(new Error(`JSON Parsing Error: ${jsonError.message}`));
            }
        } else {
          // This path should ideally not be reached if the outer check is correct.
          reject(new Error('Internal error: Unexpected file type in onload. Supported types: CSV, Excel, JSON.'));
        }
      } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes('password')) {
            reject(new Error('Cannot read password-protected Excel files. Please remove the password and try again.'));
        } else {
            reject(err);
        }
      }
    };
    reader.onerror = (error) => reject(error);

    if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        reader.readAsText(file); 
    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        reader.readAsArrayBuffer(file); 
    } else {
        reject(new Error('Unsupported file type. Please upload CSV, Excel, or JSON files.'));
    }
  });
};


const applyAggregation = (data: DataRow[], metric: MetricDefinition): number | string => {
  const column = metric.column;
  if (metric.operation === 'NONE') {
    if (data.length > 0 && data[0] !== null && typeof data[0] === 'object' && data[0].hasOwnProperty(column)) {
        const val = data[0][column];
        return typeof val === 'number' ? parseFloat(val.toFixed(2)) : val;
    }
    return data.length > 0 ? "N/A (Col not found)" : "N/A (No data)";
  }

  const values = data.map(row => row ? row[column] : undefined).filter(val => val !== null && val !== undefined && val !== '');
  const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));

  switch (metric.operation) {
    case 'SUM':
      return numericValues.reduce((acc, val) => acc + val, 0);
    case 'COUNT':
      return values.length;
    case 'AVG':
      return numericValues.length > 0 ? parseFloat((numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length).toFixed(2)) : 0;
    case 'MIN':
      return numericValues.length > 0 ? Math.min(...numericValues) : 0;
    case 'MAX':
      return numericValues.length > 0 ? Math.max(...numericValues) : 0;
    case 'COUNT_DISTINCT':
      return new Set(values).size;
    default: 
      return 0;
  }
};

export const processKpiData = (
  dataForKpi: DataRow[], 
  spec: KPIDescriptor
): ProcessedKPIData => {
  const value = applyAggregation(dataForKpi, spec.metric);
  return {
    value: typeof value === 'number' ? parseFloat(value.toFixed(2)) : value,
    title: spec.title,
    prefix: spec.valuePrefix,
    suffix: spec.valueSuffix,
  };
};


export const processChartData = (
  dataForChart: DataRow[], 
  spec: ChartDescriptor
): ProcessedChartData => {
  const { dimension, metrics, type } = spec;
  let processedData: any[] = [];
  let dimensionKey = dimension?.displayName || dimension?.column || '_dimension';
  const metricKeys = metrics.map(m => m.displayName || m.column);

  if (type === 'Table') {
    processedData = dataForChart.map(row => {
      const tableRow: DataRow = {};
      metrics.forEach(metricSpec => {
        tableRow[metricSpec.displayName || metricSpec.column] = row ? row[metricSpec.column] : null;
      });
      return tableRow;
    });
  } else if (type === 'ScatterPlot') {
    dimensionKey = dimension?.displayName || dimension?.column || (metrics.length > 2 ? metrics[2].displayName || metrics[2].column : undefined);

    processedData = dataForChart.map(row => {
        const item: DataRow = {};
        if (!row) return null; // Handle case where a row might be null/undefined
        item[metricKeys[0]] = row[metrics[0].column]; 
        item[metricKeys[1]] = row[metrics[1].column]; 
        if (dimensionKey && dimension?.column && row.hasOwnProperty(dimension.column)) {
            item[dimensionKey] = row[dimension.column]; 
        } else if (dimensionKey && metrics.length > 2 && metrics[2].column && row.hasOwnProperty(metrics[2].column)){
             item[dimensionKey] = row[metrics[2].column];
        }
        return item;
    }).filter(item => item !== null); // Filter out any null items
  } else if (type === 'Histogram') {
    if (metrics.length === 0 || !metrics[0].column) {
      console.warn('Histogram requires a metric column.');
      return { data: [], dimensionKey: 'binRange', metricKeys: ['count'], chartType: type };
    }
    const dataColumn = metrics[0].column;
    const values = dataForChart.map(row => row ? parseFloat(String(row[dataColumn])) : NaN).filter(v => !isNaN(v));

    if (values.length === 0) {
      return { data: [], dimensionKey: 'binRange', metricKeys: ['count'], chartType: type };
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    // Sturges' formula for number of bins: k = 1 + log2(N)
    let numBins = Math.ceil(1 + Math.log2(values.length));
    numBins = Math.max(5, Math.min(numBins, 20)); // Clamp between 5 and 20 bins

    if (minVal === maxVal) { // Handle case where all values are the same
        numBins = 1;
    }
    
    const binWidth = (maxVal - minVal) / numBins > 0 ? (maxVal - minVal) / numBins : 1; // Ensure binWidth > 0

    const bins: { binRange: string; count: number }[] = [];
    for (let i = 0; i < numBins; i++) {
      const binMin = minVal + i * binWidth;
      const binMax = minVal + (i + 1) * binWidth;
      bins.push({
        binRange: `${binMin.toLocaleString(undefined, {maximumFractionDigits:2})} - ${binMax.toLocaleString(undefined, {maximumFractionDigits:2})}`,
        count: 0,
      });
    }
    // Ensure the last bin includes the max value
    if (bins.length > 0 && numBins > 1) {
        const lastBinMin = minVal + (numBins - 1) * binWidth;
        bins[bins.length - 1].binRange = `${lastBinMin.toLocaleString(undefined, {maximumFractionDigits:2})} - ${maxVal.toLocaleString(undefined, {maximumFractionDigits:2})}`;
    } else if (bins.length === 0 && numBins === 1) { // Single bin case
         bins.push({
            binRange: `${minVal.toLocaleString(undefined, {maximumFractionDigits:2})} - ${maxVal.toLocaleString(undefined, {maximumFractionDigits:2})}`,
            count: 0
         });
    }


    values.forEach(value => {
      let binIndex = Math.floor((value - minVal) / binWidth);
      if (value === maxVal) { // Ensure maxVal falls into the last bin
        binIndex = numBins - 1;
      }
      binIndex = Math.max(0, Math.min(binIndex, numBins - 1)); // Clamp index
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    });
    
    processedData = bins;
    dimensionKey = 'binRange';
    metricKeys[0] = 'count'; // Override metricKeys for histogram

  } else if (dimension) { 
    const requiresAggregation = metrics.some(m => m.operation !== 'NONE');

    if (requiresAggregation) {
        const groupedData: Record<string, DataRow[]> = {};
        dataForChart.forEach(row => {
          if (!row || !row.hasOwnProperty(dimension.column)) return;
          const groupKeyVal = row[dimension.column];
          const groupKey = groupKeyVal === null || groupKeyVal === undefined ? 'N/A' : String(groupKeyVal);
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = [];
          }
          groupedData[groupKey].push(row);
        });

        processedData = Object.keys(groupedData).map(groupValue => {
          const groupRows = groupedData[groupValue];
          const chartItem: DataRow = { [dimensionKey]: groupValue };
          metrics.forEach(metricSpec => {
            chartItem[metricSpec.displayName || metricSpec.column] = applyAggregation(groupRows, metricSpec);
          });
          return chartItem;
        });
    } else {
        processedData = dataForChart.map(row => {
            if (!row || !row.hasOwnProperty(dimension.column)) return null; // Handle missing dimension column in a row
            const chartItem: DataRow = { [dimensionKey]: row[dimension.column] };
            metrics.forEach(metricSpec => {
                chartItem[metricSpec.displayName || metricSpec.column] = row[metricSpec.column];
            });
            return chartItem;
        }).filter(item => item !== null); // Filter out any null items
    }
  } else {
    console.warn(`Chart type ${type} often requires a dimension. Assuming data is prepared.`);
    processedData = [...dataForChart]; 
  }
  
  if (type === 'PieChart' && processedData.length > 0 && metrics.length > 0) {
    const pieMetricKey = metrics[0].displayName || metrics[0].column;
    const originalDimensionKey = dimension?.displayName || dimension?.column;
    if (originalDimensionKey) {
        processedData = processedData.map(item => {
            if (!item || !item.hasOwnProperty(originalDimensionKey) || !item.hasOwnProperty(pieMetricKey)) return null;
            return {
                name: item[originalDimensionKey], 
                value: typeof item[pieMetricKey] === 'number' ? parseFloat(item[pieMetricKey].toFixed(2)) : 0,
            };
        }).filter(item => item !== null && item.value > 0); 
        dimensionKey = 'name'; 
        metricKeys[0] = 'value';
    } else {
        console.warn("PieChart missing original dimension key for processing.");
    }
  }

  return { data: processedData, dimensionKey, metricKeys, chartType: type };
};

export const processDashboardElement = (
  allRows: DataRow[], // This is rawData from Dashboard.tsx
  elementSpec: DashboardElementSpec
): ProcessedKPIData | ProcessedChartData | null => {
  // Initial guard: if allRows is null or undefined, processing cannot continue.
  if (allRows === null || typeof allRows === 'undefined') {
    console.warn(`processDashboardElement called with null or undefined allRows for element: ${elementSpec.id}. This should ideally be caught upstream.`);
    return { error: true, message: `Data not available for element: ${elementSpec.title}`, title: elementSpec.title } as any;
  }

  let dataForElement: DataRow[];

  try {
    if (elementSpec.dataSourceQuery) {
      console.log(`Executing SQL for element ${elementSpec.id}: ${elementSpec.dataSourceQuery}. Input data length: ${allRows.length}`);
      
      const sourceDataForSql = Array.isArray(allRows) ? allRows : [];
      
      dataForElement = alasql(elementSpec.dataSourceQuery, [sourceDataForSql]);
      
      console.log(`SQL Result for ${elementSpec.id} (type: ${typeof dataForElement}):`, dataForElement);

      if (typeof dataForElement === 'undefined') {
        console.warn(`AlaSQL returned undefined for element ${elementSpec.id}. Query: ${elementSpec.dataSourceQuery}. Treating as empty array.`);
        dataForElement = [];
      }
      if (!Array.isArray(dataForElement)) {
        console.warn(`AlaSQL result for ${elementSpec.id} was not an array (type: ${typeof dataForElement}). Query: ${elementSpec.dataSourceQuery}. Coercing to empty array.`);
        dataForElement = [];
      }

    } else {
      dataForElement = Array.isArray(allRows) ? allRows : []; 
    }
    
    if (dataForElement.length === 0 && elementSpec.type !== 'KPI' && !elementSpec.dataSourceQuery?.match(/COUNT\s*\(\s*(\*|\w+)\s*\)/i) ) {
        if (['BarChart', 'PieChart', 'LineChart', 'Table', 'ScatterPlot', 'AreaChart', 'Histogram'].includes(elementSpec.type)) {
             return { data: [], dimensionKey: (elementSpec as ChartDescriptor).dimension?.column || (elementSpec.type === 'Histogram' ? 'binRange' : '_dimension'), metricKeys: (elementSpec as ChartDescriptor).metrics.map(m=>m.column), chartType: (elementSpec as ChartDescriptor).type };
        }
    }

    if (elementSpec.type === 'KPI') {
      return processKpiData(dataForElement, elementSpec as KPIDescriptor);
    } else if (['BarChart', 'PieChart', 'LineChart', 'Table', 'ScatterPlot', 'AreaChart', 'Histogram'].includes(elementSpec.type)) {
      return processChartData(dataForElement, elementSpec as ChartDescriptor);
    }
  } catch (error) {
    console.error(`Error processing element ${elementSpec.id} (Title: ${elementSpec.title}):`, error);
    let message = (error instanceof Error ? error.message : String(error));
    if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as {message: string}).message;
    }
    
    if (elementSpec.dataSourceQuery) {
        message = `SQL Error: ${message}. Query: ${elementSpec.dataSourceQuery}`;
    }
    return { error: true, message: message, title: elementSpec.title } as any; 
  }
  return null;
};

export const exportDataToCsv = (data: DataRow[], filename: string): void => {
  if (!data || data.length === 0) {
    console.warn("Attempted to export empty data.");
    alert("No data available to export for this chart.");
    return;
  }

  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Error generating CSV: ", err);
    alert("An error occurred while generating the CSV file.");
  }
};
