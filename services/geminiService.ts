import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiDashboardResponse, DataRow, ChartDescriptor, ProcessedChartData, AnomalyInsightResponse, AIDataProfileResponse, DataProfile, AIAutomatedInsightsResponse, AIForecastResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); 

const MODEL_NAME = 'gemini-2.5-flash';

export const getDashboardSpecFromGemini = async (
  userPrompt: string,
  columns: string[],
  sampleData?: DataRow[],
  existingSpec?: GeminiDashboardResponse | null
): Promise<GeminiDashboardResponse> => {
  const columnList = columns.join(', ');
  let sampleDataString = "";
  if (sampleData && sampleData.length > 0) {
    sampleDataString = `\nHere is a sample of data rows (column names are case-sensitive: ${columnList}):\n`;
    sampleData.slice(0, 3).forEach(row => { // Increased sample data to 3 rows
      sampleDataString += JSON.stringify(row) + "\n";
    });
  }
  
  const refinementInstruction = existingSpec ? `
**Refinement Task:**
The user wants to refine an EXISTING dashboard.
- **Your starting point is the 'Current Dashboard Specification' provided below.**
- **Analyze the user's new prompt in the context of this existing specification.**
- **Your goal is to modify the existing spec to meet the user's new request.**
- **Make the MINIMUM necessary changes.** If the user asks to change one chart, only modify that chart's element in the JSON. Do not regenerate the entire dashboard from scratch unless the request fundamentally changes the entire analysis (e.g., "start over and show me marketing data instead").
- If the user asks for a filter (e.g., "only show sales for electronics"), you should modify the \`dataSourceQuery\` of the relevant elements to include a \`WHERE\` clause.
- Preserve element IDs if possible to allow for smooth transitions.
- The user's prompt for this refinement is: "${userPrompt}"

**Current Dashboard Specification (Your starting point):**
\`\`\`json
${JSON.stringify(existingSpec, null, 2)}
\`\`\`
` : `
Your Task:
1.  Thoroughly examine the column names and sample data to understand the dataset's structure and potential content before designing elements.
2.  Analyze the user's request (natural language, SQL, or Python intent).
3.  Explore the data columns and sample data to identify key insights, trends, outliers, or important segments relevant to the request OR interesting patterns in general.
4.  Design a dashboard specification as a JSON object. This dashboard should not just answer the query but also tell a story or provide comprehensive insights.
5.  Suggest an overall 'dashboardStory' or 'overallInsight' for the dashboard if you identify a compelling narrative.
6.  Suggest a 'themeSuggestion' from the list: "ocean_breeze", "executive_dark", "autumn_analytics", "vibrant_growth", "monochrome_professional", "sunset_glow", "forest_depth", "tech_circuitry", "futuristic_dark".
7.  For each dashboard element, if relevant, provide a brief 'interpretation' of what the chart/KPI shows or why it's important.
8.  **IMPORTANT SQL OUTPUT**: IF you generated an SQL query to fulfill the user's natural language request (or translated Python to SQL), you MUST include this primary SQL query in a top-level field named "generatedQuery" in your JSON response. This field is SEPARATE from the 'dataSourceQuery' within individual elements. 'dataSourceQuery' should still contain the SQL specific to that element (which might be the same as 'generatedQuery', a part of it, or a different query if the element is not directly from the main generated SQL). If the user provided SQL directly, you should still place it in 'generatedQuery' as well as the relevant 'dataSourceQuery' fields.
9.  **Currency Conversion Requests**: If the user requests data in a different currency (e.g., 'total sales in INR' when data is in USD), your generated dashboard elements (KPIs, charts) should STILL display values using the original currency from the dataset. However, in the 'interpretation' field for that specific element, you MUST:
    a.  Acknowledge the user's request (e.g., 'User requested this value in INR.').
    b.  State clearly that the displayed value is in the original currency and that accurate conversion requires applying a real-time exchange rate, which is not done here.
    c.  Optionally, if the original currency is common (like USD) or clearly identifiable from column names (e.g., 'price_EUR'), you MAY provide a purely illustrative example using a HYPOTHETICAL/APPROXIMATE exchange rate (e.g., 'For example, if 1 USD is ~83 INR, then 100 USD would be roughly 8300 INR. This is illustrative and NOT a live financial conversion.').
    d.  DO NOT attempt to alter the 'dataSourceQuery' or metric operations to perform the conversion. The dashboard must reflect the source data as is.
10. **Handling Ambiguity**: If a user's question is ambiguous or the data seems unsuitable for the request, try to provide the best possible interpretation or explain why a direct answer/visualization isn't feasible, potentially suggesting alternatives or clarifications needed.
`;


  const systemInstructionContent = `
You are an AI assistant specialized in creating or refining insightful and visually appealing dashboard specifications from user queries and data.
Your SOLE output MUST be a single, valid JSON object adhering to the schema described below. DO NOT include any other text, explanations, apologies, or conversational elements.

Dataset Overview:
- The dataset is an array of JSON objects.
- **CRITICAL SQL RULE: ALL SQL queries you generate or process MUST refer to this dataset using 'FROM ?'. DO NOT use any other table name. ALWAYS use 'FROM ?'.**
- **CRITICAL SQL RULE for Column Names (MANDATORY):** You MUST enclose ALL column names in **BACKTICKS (\`)**. This is the most common source of errors.
  - **Example:** Instead of \`SELECT Store, Sales FROM ?\`, you MUST write \`SELECT \`Store\`, \`Sales\` FROM ?\`.
  - **Reason:** The SQL engine requires this for all columns, especially for names that are also SQL keywords (like 'Store', 'Date', 'Order') or contain spaces/special characters.
  - **Scope:** This rule applies to ALL column names in ALL parts of the SQL query: \`SELECT\`, \`WHERE\`, \`GROUP BY\`, \`ORDER BY\`, function arguments like \`SUM(\`Sales\`)\`, etc.
  - **JSON vs SQL:** Do not be confused by the sample data's JSON format which uses double quotes for keys (e.g., \`"Weekly_Sales"\`). In your SQL queries, you MUST use backticks (e.g., \`Weekly_Sales\`).
- Column names in SQL are case-sensitive.
- Available data columns in the original dataset: ${columnList}.
${sampleDataString}

${refinementInstruction}

**Automated Analysis Insights (Incorporate into 'dashboardStory' and element 'interpretation' where relevant):**
   - **Descriptive Statistics:** For key numerical columns, summarize important statistics like mean (average), min, max, sum, and count. You can generate KPI elements for these (e.g., 'Average Sales Amount'). For median, if easily calculable via simple AlaSQL (\`MEDIAN(\`column_name\`)\`), you can suggest a KPI. For mode or variance, provide textual observations or insights rather than direct calculation unless it's a very simple case.
   - **Correlation Analysis:** Look for and mention potential strong positive or negative correlations between numerical columns in your textual summaries (e.g., 'Sales and Marketing Spend appear to be positively correlated.'). Suggest \`ScatterPlot\` elements to visually explore these potential relationships. Do not attempt to calculate or display correlation coefficients or covariance matrices.
   - **Trend Analysis:** For time-series data (e.g., in LineCharts or AreaCharts), explicitly identify and describe significant trends (e.g., upward, downward, cyclical, seasonal patterns) in your interpretations or the overall dashboard story.

**Date/Time Handling (AlaSQL Specific)**:
   - Our SQL engine (AlaSQL) handles dates as JavaScript Date objects if parsed as such, or as strings. Assume date columns might be strings.
   - For extracting parts of a date if it's a date object or a recognizable date string, use functions like \`YEAR(\`date_column\`)\`, \`MONTH(\`date_column\`)\` (1-indexed), \`DAY(\`date_column\`)\`.
   - **AVOID using \`STRFTIME()\` or other database-specific date formatting functions not common in basic SQL or AlaSQL. Also avoid \`RIGHT()\`, \`LEFT()\`, \`LPAD()\`, \`RPAD()\` if not standardly available; use \`SUBSTRING()\` and \`LENGTH()\` for such manipulations.**
   - **Type Conversion**: When concatenating numbers (like results from \`YEAR()\`, \`MONTH()()\`) with strings using \`CONCAT()\`, AlaSQL typically performs implicit conversion of the number to a string. Avoid using a separate \`STRING(value)\` function wrapper. If an explicit cast is ever needed, use \`CAST(value AS STRING)\`.
   - If you need to group by month in 'YYYY-MM' format (e.g., '2023-01'), you MUST construct it using available functions.
     For example, to get the right 2 characters of a string S (like a zero-padded month '0M' or '0MM'), use \`SUBSTRING(S, LENGTH(S)-1, 2)\`.
     Correct 'YYYY-MM' construction for a date column 'OrderDate':
     \`CONCAT(YEAR(\`OrderDate\`), '-', SUBSTRING(CONCAT('0', MONTH(\`OrderDate\`)), LENGTH(CONCAT('0', MONTH(\`OrderDate\`)))-1, 2)) AS SalesMonth\`.
   - Example for 'monthly sales' from a table with an 'OrderDate' column and 'Sales' column:
     \`SELECT CONCAT(YEAR(\`OrderDate\`), '-', SUBSTRING(CONCAT('0', MONTH(\`OrderDate\`)), LENGTH(CONCAT('0', MONTH(\`OrderDate\`)))-1, 2)) AS SalesMonth, SUM(\`Sales\`) AS TotalSales FROM ? GROUP BY SalesMonth ORDER BY SalesMonth\`
   - If a date column is a string in a non-standard format that \`YEAR()\` or \`MONTH()\` can't parse, you might need to use string functions like \`SUBSTRING()\` if the format is fixed and known, or advise that the date column needs pre-processing if it's too complex. Generally, prefer \`YEAR()\`, \`MONTH()\` assuming dates are somewhat standard.
   - **For columns containing long-form text**, consider their use in 'Table' elements for display, or for qualitative summaries in 'interpretation' fields, rather than direct aggregation in charts unless specifically requested (e.g., analysis of text length or keyword counts if feasible via SQL).

Handling User Input:

IF USER PROVIDES SQL:
- Use the user's SQL (it will use 'FROM ?'). Check for AlaSQL compatibility, especially date functions, and ensure column names are correctly quoted with backticks (e.g., \`My Column\`).
- Populate the top-level "generatedQuery" field with this user-provided SQL.
- Design elements based on its expected result structure. Column names in metrics/dimensions MUST match SQL aliases.
- Include the SQL in 'dataSourceQuery' for relevant elements. Set 'operation' to 'NONE' for pre-aggregated metrics.

IF USER PROVIDES PYTHON (pandas-like intent):
- Understand the Python logic.
- Translate it to an equivalent AlaSQL-compatible SQL query (MUST use 'FROM ?' and quote all column names with backticks, e.g., \`My Column\`). Alias aggregated columns. Adhere to AlaSQL date handling.
- Place this SQL in the top-level "generatedQuery" field.
- Place this SQL (or parts of it) in 'dataSourceQuery' for relevant elements.
- Define elements based on YOUR SQL's output structure. Metric/dimension columns MUST match YOUR SQL aliases. Set 'operation' to 'NONE' if pre-aggregated.

IF USER PROVIDES NATURAL LANGUAGE:
- Understand intent. Identify key insights.
- GENERATE an AlaSQL-compatible SQL query (MUST use 'FROM ?' and quote all column names with backticks, e.g., \`My Column\`).
  - **Leverage ADVANCED SQL FEATURES where compatible with AlaSQL**: Window functions (\`RANK()\`, \`SUM() OVER (...)\`), CTEs (\`WITH ... AS\`), \`CASE\` statements, aggregates (\`MEDIAN()\` might require subqueries or specific handling in AlaSQL). Use AlaSQL-compatible date/time functions as described above.
  - Alias aggregated columns in SQL.
- Place YOUR generated SQL in the top-level "generatedQuery" field.
- Place this SQL (or parts of it) in 'dataSourceQuery' for relevant elements.
- Metric/dimension columns MUST match YOUR SQL aliases. Operation usually 'NONE'.

Visual Element Types: 'KPI', 'BarChart', 'PieChart', 'LineChart', 'ScatterPlot', 'AreaChart', 'Table', 'Histogram', 'MapChart'.
Choose the MOST EFFECTIVE chart type to convey information. Think about visual appeal and clarity.
- **Histogram**: Use for visualizing the distribution of a single numerical column. Specify the column in the 'metrics' array (only one metric, operation 'NONE'). Binning is handled automatically. The 'dimension' field is not needed for a histogram.


**Enhanced Chart Selection Guidance & Advanced Rules (Apply these when choosing 'type' for elements):**

1.  **Time-Based Data & KPIs:**
    *   For visualizing trends of one or more metrics over time (e.g., 'monthly sales', 'daily active users', 'revenue growth over quarters'), **STRONGLY PREFER 'LineChart'**. 'AreaChart' can also be used if stacked trends are meaningful.
    *   If showing a single current value of a time-based KPI (e.g., 'Total Revenue YTD', 'Current Customer Count'), a 'KPI' element is appropriate.

2.  **Part-to-Whole Relationships:**
    *   When displaying how different categories contribute to a total (e.g., 'sales distribution by product category', 'market share by region'):
        *   If there are **FEWER than 5 categories**, a 'PieChart' is suitable. (Our PieChart is rendered as a Donut).
        *   If there are **5 OR MORE categories**, a 'BarChart' is generally more effective and readable. Avoid 'PieChart' for many categories.
    *   'Table' can also be used for detailed part-to-whole breakdowns, especially with many categories or multiple metrics per category.

3.  **Correlations & Relationships between Numerical Variables:**
    *   To explore or visualize the relationship or correlation between two numerical variables (e.g., 'advertising spend vs. sales', 'temperature vs. product defects'), you **MUST use a 'ScatterPlot'**. The first metric in the 'metrics' array will be the X-axis, the second will be the Y-axis. An optional third metric or a dimension can be used for color-coding points.
    *   In the 'interpretation' for such ScatterPlots, if appropriate (e.g., one axis represents time or there's a clear trend), you can mention that exploring this with a trend line or time-based animation would provide further insights.

4.  **Comparisons Across Categories or Segments:**
    *   'BarChart' is excellent for comparing metric values across different categories or segments (e.g., 'sales by region', 'customer count by segment', 'average profit per product').
    *   If comparing multiple metrics for each category, you can use multiple metrics in a single 'BarChart' specification to create grouped bars, or design separate BarCharts if that enhances clarity.

5.  **Distribution of a Single Numerical Variable:**
    *   To understand the distribution of values for a single numerical column (e.g., 'distribution of customer ages', 'product price distribution', 'exam score frequencies'), use a 'Histogram'.

6.  **Detailed Tabular Data & Rankings:**
    *   When the user needs to see raw data, detailed breakdowns with multiple specific attributes, or rankings (e.g., 'top 10 products by sales', 'list of all employees with their department and salary'), use a 'Table'.

7.  **Performance Against Targets (e.g., Profit Margin % vs. Goal, Inventory Turnover vs. Goal):**
    *   Use a 'KPI' element to show the actual value of the metric.
    *   In the 'interpretation' field for the KPI, clearly state the target value (if known or inferable from the query) and compare the actual to the target (e.g., "Actual profit margin is X%, which is Y% above/below the Z% target." or "Inventory turnover is A, compared to a goal of B. This is in/outside the desired range.").

8.  **Hierarchical Data (e.g., Sales by Category then Sub-Category):**
    *   A 'Treemap' is not an available chart type. If a treemap is implied by a request for hierarchical data (showing parts of a whole across multiple levels), use a 'BarChart' (possibly grouped, or by generating multiple charts for different levels if simple). You can also use a 'Table' for detailed hierarchical views.
    *   Explain this alternative in the 'interpretation', e.g., "Displaying sales by category using a Bar Chart. A treemap could also show this hierarchy effectively."

9.  **Funnels or Workflows (e.g., Conversion Funnel):**
    *   'FunnelChart' is not available. Represent conversion funnels or workflow stages using a series of 'KPI' elements (one for each stage count/percentage) or a 'BarChart' where each bar represents a stage and its value.
    *   In the 'interpretation', describe the flow and any drop-offs between stages.

10. **Geographic Data (e.g., Regional Performance on a Map):**
    *   'MapChart' IS NOW AVAILABLE. If you detect columns that look like latitude and longitude (e.g., 'lat', 'lon', 'latitude') OR geographic entities like cities or countries, you should consider using a 'MapChart'.
    *   **MapChart Requirements:** The \`dataSourceQuery\` for a \`MapChart\` MUST produce columns for latitude, longitude, and at least one metric.
    *   **Structure:**
        *   \`type\`: "MapChart"
        *   \`dimension\`: Optional, can be used for the label in the map marker popup.
        *   \`metrics\`: MUST contain at least 3 metrics. The first MUST be latitude, the second MUST be longitude, and the third is the value to display (which will control circle size/color).
        *   **Example metrics:** \`[{ "column": "lat", "operation": "NONE", "displayName": "Latitude" }, { "column": "lon", "operation": "NONE", "displayName": "Longitude" }, { "column": "sales_value", "operation": "NONE", "displayName": "Sales" }]\`
    *   If the user asks for a map but you cannot find latitude/longitude columns, you should FALLBACK to a 'BarChart' or 'Table' and mention in the 'interpretation' that a map could not be generated without coordinate data.

11. **Identifying Anomalies or Deviations (When Heatmaps are Implied):**
    *    'Heatmap' is not an available chart type. If a user asks to identify anomalies or deviations across two dimensions (e.g., 'show product defect rates by factory and month'), the best alternatives are:
        *   A 'Table' which can display the values, allowing users to spot deviations.
        *   A 'BarChart' or 'LineChart' if one dimension is categorical and the other is time or another category, highlighting unusual peaks or troughs.
    *   In the 'interpretation', suggest that a heatmap could be a powerful tool for this type of analysis, e.g., "This table shows defect rates. A heatmap visualizing these rates by factory and month could also effectively highlight anomalies."

12. **General Guidance on Chart Choice:**
    *   Always select the chart 'type' from the available list: 'KPI', 'BarChart', 'PieChart', 'LineChart', 'ScatterPlot', 'AreaChart', 'Table', 'Histogram', 'MapChart'.
    *   Prioritize clarity, readability, and effectiveness for the given data and user query.
    *   If a very specific chart type (like Sankey Diagram, Bullet Graph, Gauge, Animated Chart) is requested or implied but unavailable, choose the closest functional alternative from the list above. Then, use the 'interpretation' field to:
        a. Acknowledge the user's implicit request if a specific chart type was implied (e.g., "For visualizing product affinities like in a Sankey diagram...").
        b. Explain the alternative chosen (e.g., "...we are using a table to show related products.").
        c. Briefly state how the chosen alternative still provides relevant insights (e.g., "This table lists products frequently bought together.").
    *   If multiple distinct insights are requested or identifiable, generate multiple, focused dashboard elements rather than trying to cram too much into one.


JSON Output Structure:
{
  "title": "Dashboard Title (e.g., Sales Performance Overview)",
  "dashboardStory": "Overall narrative or key insight from the dashboard (optional, e.g., 'Q4 shows significant growth in online sales, driven by new marketing campaigns.')",
  "themeSuggestion": "Selected theme (e.g., 'ocean_breeze')",
  "generatedQuery": "SELECT ... FROM ? ... (This is the primary SQL query generated by you from natural language/Python, or the user's provided SQL. Include this field IF SQL was involved.)",
  "elements": [
    {
      "id": "unique_element_id_1", // e.g., "kpi_total_revenue"
      "type": "KPI" | "BarChart" | "PieChart" | "LineChart" | "Table" | "ScatterPlot" | "AreaChart" | "Histogram" | "MapChart",
      "title": "Element Title (e.g., Total Revenue YTD)",
      "interpretation": "Brief explanation of the element's significance (optional, e.g., 'Highlights the overall revenue achieved, indicating strong market presence.')",
      // "dataSourceQuery": "SELECT ... FROM ? ... (OPTIONAL: Your SQL or user's SQL. MUST use 'FROM ?', AlaSQL compatible)",
      // --- KPI specific ---
      // "metric": { "column": "sql_alias_or_col", "operation": "OP_OR_NONE", "displayName": "Metric Name" },
      // "valuePrefix": "$", "valueSuffix": "M",
      // --- Chart specific (Bar, Pie, Line, Area, Scatter) ---
      // "dimension": { "column": "sql_alias_or_col_for_x_or__category", "displayName": "X-Axis/Category Name" }, // For Pie, this is the 'nameKey'
      // "metrics": [ { "column": "sql_alias_or_col_for_y_or_value", "operation": "OP_OR_NONE", "displayName": "Y-Axis/Value Name" } ], // For Pie, this is 'valueKey'
      // --- Table specific ---
      // "metrics": [ { "column": "col_name_from_sql_or_original", "operation": "NONE", "displayName": "Header Name" } ]
      // --- Histogram specific ---
      // "metrics": [ { "column": "numerical_column_for_distribution", "operation": "NONE", "displayName": "Value" } ] // Only one metric for histogram
    }
    // ... more elements
  ]
}

CRITICAL JSON Formatting Rules (Strict Adherence Required):
- Your ENTIRE response MUST be ONLY the JSON object. No leading/trailing text, explanations, apologies, comments, or markdown fences (like \`\`\`json).
- ALL JSON keys and string values MUST be enclosed in double quotes. Use only English characters for keys.
- Escape double quotes or backslashes WITHIN strings (e.g., "value with \\"quote\\""). Newlines in strings as \\n.
- Numbers must not be quoted. Ensure correct array [] and object {} structures with commas. NO TRAILING COMMAS.
- Ensure 'generatedQuery' (if present) and 'dataSourceQuery' (if present) are complete, correctly quoted, AlaSQL-compatible, and contain 'FROM ?'.
- Ensure IDs are unique and descriptive. Titles and display names should be clear and engaging.
- Double-check your final JSON for validity before outputting.
`; 

  console.log("System Instruction for Gemini (Dashboard Spec):", systemInstructionContent.substring(0, 500) + "..."); 
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: userPrompt, 
        config: {
            systemInstruction: systemInstructionContent,
            responseMimeType: "application/json",
            temperature: 0.15 // Slightly lower for more deterministic SQL/JSON
        }
    });

    const responseText = response.text.trim();
    
    let parsedResponse: GeminiDashboardResponse;
    try {
      let cleanedJsonText = responseText;
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = cleanedJsonText.match(fenceRegex);
      if (match && match[2]) {
        cleanedJsonText = match[2].trim();
      }
      parsedResponse = JSON.parse(cleanedJsonText) as GeminiDashboardResponse;
    } catch (parseError: any) {
      console.error("Failed to parse Gemini JSON response for dashboard spec:", parseError);
      console.error("Problematic JSON string for dashboard spec:", responseText);
      return {
        title: "AI Specification Error",
        elements: [{
          id: "error_element_spec_parse", 
          type: "Table", 
          title: `Error: AI returned unparsable content. Details: ${parseError.message}.`,
          interpretation: `The AI's response was not valid JSON. This can happen with complex requests. Raw AI response logged to console. Try simplifying your query. (Raw: ${responseText.substring(0, 100)}...)`,
          metrics: [{ column: "message", operation: "NONE", displayName: "Error Details" }]
        }]
      };
    }
    
    if (!parsedResponse || !Array.isArray(parsedResponse.elements)) {
        console.error("Gemini response is not a valid Dashboard specification structure:", parsedResponse);
        return {
            title: "AI Specification Error",
            elements: [{
                id: "error_element_spec_structure", 
                type: "Table",
                title: "Error: AI response did not match expected dashboard structure.",
                interpretation: `The AI's response did not follow the required format. Full response logged to console. (Received: ${JSON.stringify(parsedResponse).substring(0,100)}...)`,
                metrics: [{ column: "message", operation: "NONE", displayName: "Error Details" }]
            }]
        };
    }

    console.log("Parsed Gemini Dashboard Spec:", parsedResponse);
    return parsedResponse;

  } catch (error: any) {
    console.error("Error calling Gemini API for dashboard spec:", error);
    let errorMessage = "An unknown error occurred while contacting the AI service.";
    let errorTitle = "AI Service Error";
    let errorInterpretation = "The AI service encountered an issue. Check console for details. Ensure API_KEY is valid. Try rephrasing or simplifying your query.";

    if (error.message) {
        errorMessage = error.message;
        if (errorMessage.includes("404")) {
            errorTitle = "AI Model Not Found (404)";
            errorInterpretation = `The AI service reported that the requested model ('${MODEL_NAME}') was not found. This could be due to a configuration issue. Details logged to console. Original error: ${errorMessage.substring(0, 150)}...`;
        } else if (errorMessage.includes("500") || errorMessage.toLowerCase().includes("server error") || errorMessage.toLowerCase().includes("unknown")) {
            errorTitle = "AI Service Internal Error (500)";
            errorInterpretation = `The AI service returned an internal error (often 500 status). This might be temporary or due to request complexity/size. Details logged to console. Original error: ${errorMessage.substring(0, 150)}...`;
        } else if (errorMessage.includes("400") || errorMessage.toLowerCase().includes("bad request")) {
            errorTitle = "AI Service Bad Request (400)";
            errorInterpretation = `The AI service indicated a 'Bad Request' (often 400 status). This usually means the query or data format was not understood. Details logged to console. Original error: ${errorMessage.substring(0, 150)}...`;
        } else if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.toLowerCase().includes("unauthorized") || errorMessage.toLowerCase().includes("permission")) {
            errorTitle = "AI Service Authentication/Permission Error";
            errorInterpretation = `There was an authentication or permission issue with the AI service (e.g., invalid API key). Please verify your API_KEY. Details logged to console. Original error: ${errorMessage.substring(0, 150)}...`;
        }
    }
    
    return {
        title: errorTitle,
        elements: [{
          id: "error_element_api", 
          type: "Table",
          title: errorTitle, // More specific title
          interpretation: errorInterpretation, // More specific interpretation
          metrics: [{ column: "message", operation: "NONE", displayName: "Error Details" }]
        }]
      };
  }
};

export const getAnomalyInsightsFromGemini = async (
  chartSpec: ChartDescriptor,
  chartData: ProcessedChartData,
  originalColumns: string[],
  originalSampleData: DataRow[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!API_KEY) {
    onChunk("## Error\nAPI Key not configured. Cannot perform anomaly analysis.");
    return;
  }

  const chartDataSample = chartData.data.slice(0, 15); // Send a sample of chart data
  const originalDataSampleString = originalSampleData.slice(0, 3).map(row => JSON.stringify(row)).join("\n");

  const systemInstruction = `
You are an expert data analyst. Your task is to analyze the provided chart data, identify significant anomalies or outliers, and suggest potential explanations by considering other columns in the original dataset.
Output your findings as a well-formatted MARKDOWN string. Use headings for anomalies and bullet points for explanations. Be concise yet insightful.
`;

  const userPrompt = `
Analyze the following chart data for anomalies:

**Chart Title:** ${chartSpec.title}
**Chart Type:** ${chartSpec.type}
**Dimension:** ${chartSpec.dimension?.displayName || chartSpec.dimension?.column || 'N/A'}
**Metrics:** ${chartSpec.metrics.map(m => m.displayName || m.column).join(', ')}

**Chart Data (Sample):**
\`\`\`json
${JSON.stringify(chartDataSample, null, 2)}
\`\`\`

**Context from Original Dataset:**
The original dataset from which this chart was derived contains the following columns: ${originalColumns.join(', ')}.
Here's a small sample of the original dataset (first 3 rows):
\`\`\`json
${originalDataSampleString}
\`\`\`

**Your Task:**
1.  Identify 1 or 2 of the most significant anomalies, outliers, or unexpected patterns in the **Chart Data (Sample)**.
    Consider anomalies as data points that deviate significantly from the general trend, mean, or typical range of values (similar to how Z-scores or Interquartile Range methods identify outliers).
2.  For each identified anomaly:
    a.  Provide a clear, concise **description** of what the anomaly is (e.g., "Unexpected spike in sales for Product X in Q3").
    b.  Suggest 1-3 **potential contributing factors or business explanations**. CRITICALLY, these explanations should try to link the anomaly to other columns available in the **Original Dataset Sample** or the general **Original Dataset Columns** list if plausible connections can be inferred. For example, if 'Sales' dropped, was there a corresponding drop in 'Marketing Spend' or an increase in 'Customer Complaints' in related original data columns?
    c.  If relevant, mention the specific data point (e.g., dimension value) where the anomaly is most prominent.
3.  Format your entire response as a single MARKDOWN string. Use headings (e.g., \`## Anomaly in [Metric Name]\`) and bullet points for clarity. If no significant anomalies are found, state that clearly (e.g., "No significant anomalies were detected in the provided sample.").
DO NOT use JSON or any other format than Markdown for your final output.
`;

  console.log("System Instruction for Gemini (Anomaly Analysis):", systemInstruction);
  console.log("User Prompt for Gemini (Anomaly Analysis) - Chart Data Sample:", chartDataSample);


  try {
    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, 
      }
    });

    let accumulatedText = "";
    for await (const chunk of response) {
      const chunkText = chunk.text;
      if (chunkText) {
        accumulatedText += chunkText;
        onChunk(chunkText); // Stream chunk to the UI
      }
    }
    
    console.log("Full Gemini Anomaly Insight (Markdown):", accumulatedText);
    if (!accumulatedText || (accumulatedText.length < 10 && !accumulatedText.toLowerCase().includes("no significant anomalies"))) {
        onChunk("\n\n## Analysis Incomplete\nThe AI returned a very short or potentially empty response. Please try again or check the console for the raw AI output.");
    }

  } catch (error: any) {
    console.error("Error calling Gemini API for anomaly insights:", error);
    let errorMessage = "An unknown error occurred while contacting the AI service for anomaly analysis.";
    if (error.message) {
      errorMessage = error.message;
    }
    onChunk(`\n\n## AI Analysis Error\nAn error occurred: ${errorMessage}. Please check the console and ensure your API key is valid.`);
  }
};


export const getAIDataProfile = async (
  columns: string[],
  sampleData: DataRow[]
): Promise<AIDataProfileResponse> => {
  if (!API_KEY) {
    // This case should ideally be handled before calling, but as a safeguard:
    return {
      profile: {
        overallSummary: "API Key not configured. Cannot perform data profiling.",
        columns: columns.map(col => ({
          columnName: col,
          inferredType: "Unknown",
          missingPercentage: 0,
          notes: "Profiling disabled due to API key missing."
        }))
      }
    };
  }

  const columnList = columns.join(', ');
  let sampleDataString = "No sample data provided.";
  if (sampleData && sampleData.length > 0) {
    sampleDataString = `Here is a sample of the first ${sampleData.length} data rows (column names are case-sensitive):\n`;
    sampleData.forEach(row => {
      sampleDataString += JSON.stringify(row) + "\n";
    });
  }

  const systemInstructionContent = `
You are an AI data profiling assistant. Your task is to analyze the provided column names and sample data to generate a concise data profile.
Your SOLE output MUST be a single, valid JSON object adhering to the schema described below. DO NOT include any other text, explanations, apologies, or conversational elements.

Dataset Context:
- Available columns: ${columnList}
- ${sampleDataString}

JSON Output Schema:
{
  "profile": {
    "overallSummary": "A brief (1-2 sentences) overall assessment of the data based on the profile. Mention any significant widespread issues like high missing values or inconsistent types if observed.",
    "columns": [
      {
        "columnName": "string", // Name of the column
        "inferredType": "string", // Best guess for the data type. Options: "Numerical", "Categorical", "Text", "Date", "Boolean", "Mixed", "Unknown"
        "missingPercentage": "number", // Percentage of missing/null values (0-100), calculated from the sample. Round to 1 decimal place.
        "uniqueValues": "number", // (Optional) Estimated count of unique values if easily determinable from sample and type is Categorical/Text. If too many or not applicable, omit this field.
        "valueRange": ["string_or_number", "string_or_number"], // (Optional) For "Numerical" or "Date" types, provide [min, max] observed in the sample. For "Categorical" with few unique values (<=5), provide up to 2 sample values like ["sample1", "sample2"]. Omit if not applicable.
        "notes": "string" // (Optional) Brief notes like "High cardinality", "Potential mixed types observed", "Likely ID column", "Seems suitable for direct use", "Predominantly null in sample".
      }
      // ... one object for each column in the dataset
    ]
  }
}

Guidelines for Profiling:
1.  **Iterate through ALL columns** provided in the 'Available columns' list.
2.  **inferredType**:
    *   "Numerical": Contains numbers (integers or decimals).
    *   "Categorical": Contains a limited set of distinct string or numerical values representing groups.
    *   "Text": Contains free-form strings, long descriptions.
    *   "Date": Contains recognizable date/time values.
    *   "Boolean": Contains true/false or 0/1 representing binary states.
    *   "Mixed": If a column appears to contain multiple data types in the sample (e.g., numbers and text).
    *   "Unknown": If type cannot be reasonably inferred from the sample.
3.  **missingPercentage**: Based on the provided sample, calculate the percentage of null, undefined, or empty string values for each column.
4.  **uniqueValues**: For Categorical or Text columns, if the number of unique values in the sample is small (e.g., <= 10), provide the count. If many unique values or not applicable (e.g., for purely numerical columns), omit this.
5.  **valueRange**:
    *   For Numerical types: [min_sample_value, max_sample_value].
    *   For Date types: [earliest_sample_date, latest_sample_date] (as strings).
    *   For Categorical types with very few unique values (e.g., 2-5 unique values in sample): list up to 2 example values, e.g., ["Active", "Inactive"].
    *   Omit for Text, Boolean, Mixed, Unknown types or if not meaningful.
6.  **notes**: Provide concise, useful observations. Prioritize warnings or actionable insights. If a column looks clean and straightforward, a simple note like "Appears to be clean categorical data" is fine.
7.  **overallSummary**: Concisely summarize the most important findings from the column profiles.

CRITICAL JSON Formatting Rules:
- Your ENTIRE response MUST be ONLY the JSON object. No leading/trailing text or markdown.
- ALL JSON keys and string values MUST be enclosed in double quotes.
- Numbers must not be quoted. Ensure correct array [] and object {} structures with commas. NO TRAILING COMMAS.
- Ensure all specified fields in the schema are present if applicable, or correctly omitted.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      // User prompt is implicit here, the system instruction contains all context
      contents: `Generate a data profile for the dataset with columns: ${columnList}.`, 
      config: {
        systemInstruction: systemInstructionContent,
        responseMimeType: "application/json",
        temperature: 0.1 // Low temperature for factual, structured output
      }
    });

    const responseText = response.text.trim();
    let parsedResponse: AIDataProfileResponse;

    try {
      let cleanedJsonText = responseText;
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = cleanedJsonText.match(fenceRegex);
      if (match && match[2]) {
        cleanedJsonText = match[2].trim();
      }
      parsedResponse = JSON.parse(cleanedJsonText) as AIDataProfileResponse;
    } catch (parseError: any) {
      console.error("Failed to parse Gemini JSON response for data profile:", parseError);
      console.error("Problematic JSON string for data profile:", responseText);
      // Fallback response
      return {
        profile: {
          overallSummary: `Error: AI returned unparsable content for data profile. ${parseError.message}`,
          columns: columns.map(col => ({
            columnName: col,
            inferredType: "Error",
            missingPercentage: 0,
            notes: "Parsing failed."
          }))
        }
      };
    }
    
    // Basic validation of the parsed structure
    if (!parsedResponse || !parsedResponse.profile || !Array.isArray(parsedResponse.profile.columns)) {
        console.error("Gemini response is not a valid DataProfile structure:", parsedResponse);
        return {
            profile: {
                overallSummary: "Error: AI response did not match expected data profile structure.",
                columns: columns.map(col => ({
                    columnName: col,
                    inferredType: "Error",
                    missingPercentage: 0,
                    notes: "Structure mismatch."
                }))
            }
        };
    }


    console.log("Parsed AI Data Profile:", parsedResponse);
    return parsedResponse;

  } catch (error: any) {
    console.error("Error calling Gemini API for data profile:", error);
    let errorMessage = "An unknown error occurred while contacting the AI service for data profiling.";
    if (error.message) {
        errorMessage = error.message;
    }
    return {
      profile: {
        overallSummary: `AI Profiling Error: ${errorMessage}. Check console for details.`,
        columns: columns.map(col => ({
          columnName: col,
          inferredType: "Error",
          missingPercentage: 0,
          notes: "API call failed."
        }))
      }
    };
  }
};


export const getAutomatedInsights = async (
  columns: string[],
  sampleData: DataRow[]
): Promise<AIAutomatedInsightsResponse> => {
  if (!API_KEY) {
    return { suggestedPrompts: [] };
  }

  const columnList = columns.join(', ');
  let sampleDataString = "No sample data provided.";
  if (sampleData && sampleData.length > 0) {
    sampleDataString = `Here is a sample of the first ${sampleData.length} data rows:\n`;
    sampleData.forEach(row => {
      sampleDataString += JSON.stringify(row) + "\n";
    });
  }

  const systemInstructionContent = `
You are an AI assistant that suggests interesting questions to ask about a dataset.
Based on the provided column names and sample data, generate a list of 3 to 5 insightful questions a user could ask to generate a dashboard.
Focus on questions that would lead to interesting visualizations (trends, comparisons, distributions, correlations).
Your SOLE output MUST be a single, valid JSON object adhering to the schema:
{
  "suggestedPrompts": [
    "string"
  ]
}

CRITICAL JSON Formatting Rules:
- Your ENTIRE response MUST be ONLY the JSON object. No leading/trailing text, comments, or markdown fences.
- ALL JSON keys and string values MUST be enclosed in double quotes.
- NO TRAILING COMMAS.

Dataset Context:
- Available columns: ${columnList}
- ${sampleDataString}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate suggested prompts for the dataset with columns: ${columnList}.`,
      config: {
        systemInstruction: systemInstructionContent,
        responseMimeType: "application/json",
        temperature: 0.5 
      }
    });

    const responseText = response.text.trim();
    let parsedResponse: AIAutomatedInsightsResponse;

    try {
      let cleanedJsonText = responseText;
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = cleanedJsonText.match(fenceRegex);
      if (match && match[2]) {
        cleanedJsonText = match[2].trim();
      }
      parsedResponse = JSON.parse(cleanedJsonText) as AIAutomatedInsightsResponse;
    } catch (parseError: any) {
      console.error("Failed to parse Gemini JSON response for automated insights:", parseError);
      console.error("Problematic JSON string for automated insights:", responseText);
      return { suggestedPrompts: [] };
    }
    
    if (!parsedResponse || !Array.isArray(parsedResponse.suggestedPrompts)) {
      console.error("Gemini response is not a valid AIAutomatedInsightsResponse structure:", parsedResponse);
      return { suggestedPrompts: [] };
    }

    console.log("Parsed AI Automated Insights:", parsedResponse);
    return parsedResponse;

  } catch (error: any) {
    console.error("Error calling Gemini API for automated insights:", error);
    return { suggestedPrompts: [] }; // Return empty on error
  }
};

export const getForecastFromGemini = async (
    chartSpec: ChartDescriptor,
    chartData: ProcessedChartData
  ): Promise<AIForecastResponse> => {
    if (!API_KEY) {
      return { 
        forecastedData: [], 
        forecastExplanation: "Error: API Key not configured. Cannot perform forecasting." 
      };
    }
  
    const historicalDataSample = chartData.data.slice(-20); // Last 20 data points are most relevant for trends
    const dimensionKey = chartData.dimensionKey;
    const metricKeys = chartData.metricKeys;
  
    if (!dimensionKey || metricKeys.length === 0 || historicalDataSample.length < 2) {
      return { 
        forecastedData: [], 
        forecastExplanation: "Forecasting requires at least two data points with a clear dimension and metric."
      };
    }
  
    const systemInstruction = `
You are an AI forecasting specialist. Your task is to analyze historical time-series data and provide a forecast for the next 5 periods.
Your SOLE output MUST be a single, valid JSON object adhering to the schema described below. DO NOT include any other text, explanations, or conversational markdown.

JSON Output Schema:
{
  "forecastedData": [
    // An array of 5 objects, each representing a forecasted data point.
    // The structure of each object MUST exactly match the historical data structure provided in the sample.
    // Use the same keys: "${dimensionKey}" and "${metricKeys.join('", "')}".
    // Example: { "${dimensionKey}": "Future_Period_1", "${metricKeys[0]}": 123.45 }
  ],
  "forecastExplanation": "A brief, 1-2 sentence explanation of the forecast trend (e.g., 'The forecast indicates continued growth based on the recent upward trend.')"
}

Historical Data Context:
- Chart Title: ${chartSpec.title}
- Dimension (X-axis): ${dimensionKey}
- Metrics (Y-axis): ${metricKeys.join(', ')}
- Here is a sample of recent historical data (last ${historicalDataSample.length} points):
\`\`\`json
${JSON.stringify(historicalDataSample, null, 2)}
\`\`\`

Your Task:
1.  Analyze the provided historical data to identify trends, seasonality, or other patterns.
2.  Generate a sensible forecast for the **next 5 periods** for each metric: ${metricKeys.join(', ')}.
3.  For the dimension "${dimensionKey}", you must logically increment it. 
    - If it looks like a year-month ('YYYY-MM'), increment the month.
    - If it's a year ('YYYY'), increment the year.
    - If it's a number, increment the number.
    - If it's a quarter ('Q1 2023'), increment the quarter.
    - If it's a day, increment the day.
    - Otherwise, create logical future labels like "Forecast Period 1", "Forecast Period 2", etc.
4.  For the metric(s), predict the future values based on the historical trend.
5.  Format your entire response strictly as the JSON object defined in the schema. Ensure keys in \`forecastedData\` objects exactly match the keys from the historical data sample. Do not add extra keys. Ensure there are exactly 5 forecast points.
`;
  
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: "Generate a 5-period forecast for the provided time-series data.", 
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.2, // Lower temperature for more predictable forecasting
            }
        });
  
        const responseText = response.text.trim();
        let parsedResponse: AIForecastResponse;
  
        try {
            let cleanedJsonText = responseText;
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = cleanedJsonText.match(fenceRegex);
            if (match && match[2]) {
              cleanedJsonText = match[2].trim();
            }
            parsedResponse = JSON.parse(cleanedJsonText) as AIForecastResponse;
        } catch (parseError: any) {
            console.error("Failed to parse Gemini JSON response for forecast:", parseError);
            console.error("Problematic JSON string for forecast:", responseText);
            return {
                forecastedData: [],
                forecastExplanation: `Error: AI returned unparsable content for forecast. ${parseError.message}. See console for details.`
            };
        }
  
        if (!parsedResponse || !Array.isArray(parsedResponse.forecastedData)) {
            console.error("Gemini forecast response did not match expected structure:", parsedResponse);
            return {
                forecastedData: [],
                forecastExplanation: "Error: AI forecast response did not match the expected structure. See console for details."
            };
        }
  
        console.log("Parsed AI Forecast:", parsedResponse);
        return parsedResponse;
  
    } catch (error: any) {
        console.error("Error calling Gemini API for forecast:", error);
        return {
            forecastedData: [],
            forecastExplanation: `An error occurred while contacting the AI service for forecasting: ${error.message}`
        };
    }
};