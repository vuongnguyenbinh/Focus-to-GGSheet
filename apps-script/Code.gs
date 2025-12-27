/**
 * Google Sheets Backend for Focus Extension
 *
 * Deployment Settings:
 * - Execute as: Me (your account)
 * - Who has access: Anyone
 *
 * After deployment, copy the web app URL and use it in the extension settings.
 *
 * @version 1.0.0
 * @author Focus Extension
 */

// ============================================
// CONFIGURATION - Change these values!
// ============================================

const CONFIG = {
  SECRET: 'CHANGE_THIS_SECRET_KEY_123', // IMPORTANT: Change this to a secure random string!
  ITEMS_SHEET: 'Items',
  PROMPTS_SHEET: 'Prompts',
  VERSION: '1.0.0',
};

// ============================================
// SHEET HEADERS - Used for auto-creation
// ============================================

const ITEMS_HEADERS = [
  'ID', 'Type', 'Title', 'Content', 'URL', 'Priority',
  'Deadline', 'Completed', 'Tags', 'Category', 'Project', 'UpdatedAt'
];

const PROMPTS_HEADERS = [
  'ID', 'Title', 'Description', 'Prompt', 'Type', 'Category',
  'Tags', 'Note', 'Approved', 'Favorite', 'Quality', 'TextDemo', 'URLDemo', 'UpdatedAt'
];

// ============================================
// REQUEST HANDLERS
// ============================================

/**
 * Handle GET requests
 * Actions: test, getItems, getPrompts
 * Optional: ?since=timestamp for delta sync
 */
function doGet(e) {
  try {
    validateSecret(e);

    const action = e.parameter.action;
    const since = e.parameter.since ? parseInt(e.parameter.since, 10) : null;

    let result;
    switch (action) {
      case 'test':
        result = {
          ok: true,
          version: CONFIG.VERSION,
          timestamp: new Date().toISOString(),
          sheets: {
            items: sheetExists(CONFIG.ITEMS_SHEET),
            prompts: sheetExists(CONFIG.PROMPTS_SHEET),
          },
        };
        break;

      case 'getItems':
        ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
        result = getSheetData(CONFIG.ITEMS_SHEET, since);
        break;

      case 'getPrompts':
        ensureSheet(CONFIG.PROMPTS_SHEET, PROMPTS_HEADERS);
        result = getSheetData(CONFIG.PROMPTS_SHEET, since);
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }

    return jsonResponse({ success: true, data: result });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

/**
 * Handle POST requests
 * Actions: createItem, updateItem, deleteItem, createPrompt, updatePrompt, deletePrompt, batch
 *
 * Note: Client sends data as application/x-www-form-urlencoded with 'payload' parameter
 * to avoid CORS preflight. Parse from e.parameter.payload.
 */
function doPost(e) {
  try {
    validateSecret(e);

    // Parse payload from form parameter (sent as x-www-form-urlencoded)
    // Fallback to postData.contents for backward compatibility
    let payloadStr;
    if (e.parameter && e.parameter.payload) {
      payloadStr = e.parameter.payload;
    } else if (e.postData && e.postData.contents) {
      payloadStr = e.postData.contents;
    } else {
      throw new Error('No payload received');
    }

    Logger.log('=== doPost DEBUG ===');
    Logger.log('Payload string: ' + payloadStr);

    const payload = JSON.parse(payloadStr);
    Logger.log('Parsed payload: ' + JSON.stringify(payload));
    Logger.log('Action: ' + payload.action);
    Logger.log('Data: ' + JSON.stringify(payload.data));
    const action = payload.action;

    let result;
    switch (action) {
      case 'createItem':
        ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
        result = createRow(CONFIG.ITEMS_SHEET, payload.data, ITEMS_HEADERS);
        break;

      case 'updateItem':
        ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
        result = updateRow(CONFIG.ITEMS_SHEET, payload.data, ITEMS_HEADERS);
        break;

      case 'deleteItem':
        result = deleteRow(CONFIG.ITEMS_SHEET, payload.id);
        break;

      case 'createPrompt':
        ensureSheet(CONFIG.PROMPTS_SHEET, PROMPTS_HEADERS);
        result = createRow(CONFIG.PROMPTS_SHEET, payload.data, PROMPTS_HEADERS);
        break;

      case 'updatePrompt':
        ensureSheet(CONFIG.PROMPTS_SHEET, PROMPTS_HEADERS);
        result = updateRow(CONFIG.PROMPTS_SHEET, payload.data, PROMPTS_HEADERS);
        break;

      case 'deletePrompt':
        result = deleteRow(CONFIG.PROMPTS_SHEET, payload.id);
        break;

      case 'batch':
        result = processBatch(payload.operations);
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }

    Logger.log('Result: ' + JSON.stringify(result));
    Logger.log('=== doPost END ===');
    return jsonResponse({ success: true, data: result });
  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return jsonResponse({ success: false, error: error.message });
  }
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Validate the secret key from request
 */
function validateSecret(e) {
  const secret = e?.parameter?.secret;
  if (!secret || secret !== CONFIG.SECRET) {
    throw new Error('Unauthorized: Invalid or missing secret');
  }
}

// ============================================
// SHEET UTILITIES
// ============================================

/**
 * Check if a sheet exists
 */
function sheetExists(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName) !== null;
}

/**
 * Ensure sheet exists with proper headers, create if not
 */
function ensureSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    // Create new sheet
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  return sheet;
}

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  return sheet;
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all data from sheet, optionally filtered by UpdatedAt timestamp
 * @param {string} sheetName - Name of the sheet
 * @param {number|null} sinceTimestamp - Unix timestamp in milliseconds, filter rows updated after this
 * @returns {Array<Object>} Array of row objects
 */
function getSheetData(sheetName, sinceTimestamp) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();

  // Return empty array if only headers or empty
  if (data.length < 2) return [];

  const headers = data[0];
  const updatedAtIndex = headers.indexOf('UpdatedAt');
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows (no ID)
    if (!row[0]) continue;

    // Filter by timestamp if provided (delta sync)
    if (sinceTimestamp && updatedAtIndex >= 0) {
      const rowTimeStr = row[updatedAtIndex];
      if (rowTimeStr) {
        const rowTime = new Date(rowTimeStr).getTime();
        if (!isNaN(rowTime) && rowTime <= sinceTimestamp) {
          continue;
        }
      }
    }

    // Convert row to object
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] !== undefined ? row[idx] : '';
    });
    obj._rowIndex = i + 1; // 1-based row number for reference
    rows.push(obj);
  }

  return rows;
}

/**
 * Create a new row in the sheet
 * @param {string} sheetName - Name of the sheet
 * @param {Object} data - Data object with column values
 * @param {Array<string>} defaultHeaders - Default headers if sheet needs creation
 * @returns {Object} Result with id and rowIndex
 */
function createRow(sheetName, data, defaultHeaders) {
  Logger.log('[createRow] START - sheetName: ' + sheetName);
  Logger.log('[createRow] data keys: ' + Object.keys(data).join(', '));
  Logger.log('[createRow] data.ID: ' + data.ID);

  const sheet = getSheet(sheetName);
  Logger.log('[createRow] Sheet found: ' + sheet.getName());

  // Get headers - handle empty sheet case
  let headers;
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  Logger.log('[createRow] lastCol: ' + lastCol + ', lastRow: ' + lastRow);

  if (lastCol === 0) {
    // Sheet is empty, add headers first
    Logger.log('[createRow] Sheet empty, adding headers');
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    headers = defaultHeaders;
  } else {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    Logger.log('[createRow] Existing headers: ' + headers.join(', '));
  }

  // Map data to row array based on headers
  const newRow = headers.map(header => {
    if (header === 'UpdatedAt' && !data[header]) {
      return new Date().toISOString();
    }
    return data[header] !== undefined ? data[header] : '';
  });

  Logger.log('[createRow] newRow: ' + JSON.stringify(newRow));

  sheet.appendRow(newRow);

  const finalLastRow = sheet.getLastRow();
  Logger.log('[createRow] Row appended, new lastRow: ' + finalLastRow);

  return {
    id: data.ID,
    rowIndex: finalLastRow,
    created: true,
  };
}

/**
 * Update an existing row by ID, or create if not found
 * @param {string} sheetName - Name of the sheet
 * @param {Object} data - Data object with ID and column values
 * @param {Array<string>} defaultHeaders - Default headers if sheet needs creation
 * @returns {Object} Result with id, rowIndex, and updated flag
 */
function updateRow(sheetName, data, defaultHeaders) {
  const sheet = getSheet(sheetName);

  // Handle empty sheet - if no data, create with headers
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    // Sheet is empty, create row instead
    return createRow(sheetName, data, defaultHeaders);
  }

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf('ID');

  if (idIndex === -1) {
    throw new Error('ID column not found in sheet: ' + sheetName);
  }

  // Find row by ID
  let rowIndex = -1;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idIndex]) === String(data.ID)) {
      rowIndex = i + 1; // 1-based
      break;
    }
  }

  // Create if not found
  if (rowIndex === -1) {
    return createRow(sheetName, data, defaultHeaders);
  }

  // Update existing row
  const updatedRow = headers.map(header => {
    if (header === 'UpdatedAt') {
      return new Date().toISOString();
    }
    return data[header] !== undefined ? data[header] : '';
  });

  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);

  return {
    id: data.ID,
    rowIndex: rowIndex,
    updated: true,
  };
}

/**
 * Delete a row by ID
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - ID of the row to delete
 * @returns {Object} Result with id and deleted flag
 */
function deleteRow(sheetName, id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    return { id, deleted: false, reason: 'Sheet not found' };
  }

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf('ID');

  if (idIndex === -1) {
    return { id, deleted: false, reason: 'ID column not found' };
  }

  // Find and delete row
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { id, deleted: true };
    }
  }

  return { id, deleted: false, reason: 'Row not found' };
}

/**
 * Process multiple operations in batch
 * @param {Array<Object>} operations - Array of operation objects
 * @returns {Array<Object>} Results for each operation
 */
function processBatch(operations) {
  if (!Array.isArray(operations)) {
    throw new Error('Operations must be an array');
  }

  const results = [];

  for (const op of operations) {
    try {
      let result;

      switch (op.action) {
        case 'createItem':
          ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
          result = createRow(CONFIG.ITEMS_SHEET, op.data, ITEMS_HEADERS);
          break;
        case 'updateItem':
          ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
          result = updateRow(CONFIG.ITEMS_SHEET, op.data, ITEMS_HEADERS);
          break;
        case 'deleteItem':
          result = deleteRow(CONFIG.ITEMS_SHEET, op.id);
          break;
        case 'createPrompt':
          ensureSheet(CONFIG.PROMPTS_SHEET, PROMPTS_HEADERS);
          result = createRow(CONFIG.PROMPTS_SHEET, op.data, PROMPTS_HEADERS);
          break;
        case 'updatePrompt':
          ensureSheet(CONFIG.PROMPTS_SHEET, PROMPTS_HEADERS);
          result = updateRow(CONFIG.PROMPTS_SHEET, op.data, PROMPTS_HEADERS);
          break;
        case 'deletePrompt':
          result = deleteRow(CONFIG.PROMPTS_SHEET, op.id);
          break;
        default:
          throw new Error('Unknown batch action: ' + op.action);
      }

      results.push({ success: true, ...result });
    } catch (error) {
      results.push({ success: false, error: error.message, action: op.action });
    }
  }

  return results;
}

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Create JSON response with proper content type
 * @param {Object} data - Data to return as JSON
 * @returns {TextOutput} Apps Script text output
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// UTILITY FUNCTIONS (for manual testing)
// ============================================

/**
 * Initialize sheets with headers (run manually from Apps Script editor)
 */
function initializeSheets() {
  ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
  ensureSheet(CONFIG.PROMPTS_SHEET, PROMPTS_HEADERS);
  Logger.log('Sheets initialized successfully!');
}

/**
 * Test function (run manually from Apps Script editor)
 */
function testSetup() {
  Logger.log('=== Focus Extension Backend Test ===');
  Logger.log('Version: ' + CONFIG.VERSION);
  Logger.log('Items Sheet: ' + (sheetExists(CONFIG.ITEMS_SHEET) ? 'EXISTS' : 'NOT FOUND'));
  Logger.log('Prompts Sheet: ' + (sheetExists(CONFIG.PROMPTS_SHEET) ? 'EXISTS' : 'NOT FOUND'));
  Logger.log('Secret configured: ' + (CONFIG.SECRET !== 'CHANGE_THIS_SECRET_KEY_123' ? 'YES' : 'NO - PLEASE CHANGE!'));
  Logger.log('===================================');
}

// ============================================
// DEBUG & TEST FUNCTIONS
// ============================================

/**
 * Inspect sheet state - run this to see current sheet configuration
 */
function debugInspectSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('=== SHEET INSPECTION ===');
  Logger.log('Spreadsheet Name: ' + ss.getName());
  Logger.log('Spreadsheet ID: ' + ss.getId());

  const sheets = ss.getSheets();
  Logger.log('Total sheets: ' + sheets.length);

  sheets.forEach((sheet, idx) => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    Logger.log('');
    Logger.log('Sheet ' + (idx + 1) + ': "' + name + '"');
    Logger.log('  Last Row: ' + lastRow);
    Logger.log('  Last Column: ' + lastCol);

    if (lastCol > 0 && lastRow > 0) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      Logger.log('  Headers: ' + JSON.stringify(headers));

      if (lastRow > 1) {
        const firstDataRow = sheet.getRange(2, 1, 1, lastCol).getValues()[0];
        Logger.log('  First data row: ' + JSON.stringify(firstDataRow));
      }
    } else {
      Logger.log('  Sheet is empty!');
    }
  });

  Logger.log('========================');
}

/**
 * Test creating a sample item - run this to test the createRow function
 */
function debugTestCreateItem() {
  Logger.log('=== TEST CREATE ITEM ===');

  const testData = {
    ID: 'test-' + Date.now(),
    Type: 'task',
    Title: 'Test Task from Apps Script',
    Content: 'This is a test task created manually',
    URL: '',
    Priority: 'medium',
    Deadline: '',
    Completed: 'FALSE',
    Tags: 'test,debug',
    Category: 'Test Category',
    Project: 'Test Project',
    UpdatedAt: new Date().toISOString()
  };

  Logger.log('Test data: ' + JSON.stringify(testData));

  try {
    ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
    Logger.log('Sheet ensured');

    const result = createRow(CONFIG.ITEMS_SHEET, testData, ITEMS_HEADERS);
    Logger.log('Result: ' + JSON.stringify(result));
    Logger.log('SUCCESS! Check the Items sheet for the new row.');
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }

  Logger.log('========================');
}

/**
 * Debug version of createRow with extensive logging
 */
function debugCreateRow(sheetName, data, defaultHeaders) {
  Logger.log('--- debugCreateRow START ---');
  Logger.log('sheetName: ' + sheetName);
  Logger.log('data: ' + JSON.stringify(data));
  Logger.log('defaultHeaders: ' + JSON.stringify(defaultHeaders));

  const sheet = getSheet(sheetName);
  Logger.log('Sheet found: ' + sheet.getName());

  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  Logger.log('lastCol: ' + lastCol + ', lastRow: ' + lastRow);

  let headers;
  if (lastCol === 0) {
    Logger.log('Sheet is empty, adding headers...');
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    headers = defaultHeaders;
    Logger.log('Headers added');
  } else {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    Logger.log('Existing headers: ' + JSON.stringify(headers));
  }

  // Map data to row
  const newRow = [];
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    let value;
    if (header === 'UpdatedAt' && !data[header]) {
      value = new Date().toISOString();
    } else {
      value = data[header] !== undefined ? data[header] : '';
    }
    newRow.push(value);
    Logger.log('  ' + header + ' = ' + value);
  }

  Logger.log('newRow: ' + JSON.stringify(newRow));
  Logger.log('newRow length: ' + newRow.length);

  // Append the row
  sheet.appendRow(newRow);
  const newLastRow = sheet.getLastRow();
  Logger.log('Row appended. New lastRow: ' + newLastRow);

  // Verify the row was written
  const verifyRow = sheet.getRange(newLastRow, 1, 1, headers.length).getValues()[0];
  Logger.log('Verify row content: ' + JSON.stringify(verifyRow));

  Logger.log('--- debugCreateRow END ---');

  return {
    id: data.ID,
    rowIndex: newLastRow,
    created: true,
  };
}

/**
 * Test using the debug version of createRow
 */
function debugTestCreateItemVerbose() {
  Logger.log('=== VERBOSE TEST CREATE ITEM ===');

  const testData = {
    ID: 'verbose-test-' + Date.now(),
    Type: 'note',
    Title: 'Verbose Test Note',
    Content: 'Testing with verbose logging',
    URL: '',
    Priority: '',
    Deadline: '',
    Completed: 'FALSE',
    Tags: '',
    Category: '',
    Project: '',
    UpdatedAt: ''
  };

  try {
    ensureSheet(CONFIG.ITEMS_SHEET, ITEMS_HEADERS);
    const result = debugCreateRow(CONFIG.ITEMS_SHEET, testData, ITEMS_HEADERS);
    Logger.log('Final Result: ' + JSON.stringify(result));
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }

  Logger.log('================================');
}

/**
 * Check if incoming data from extension matches expected format
 * Add this to doPost to log incoming requests
 */
function debugLogRequest(e) {
  Logger.log('=== INCOMING REQUEST ===');
  Logger.log('Parameter: ' + JSON.stringify(e.parameter));
  Logger.log('PostData contents: ' + (e.postData ? e.postData.contents : 'NO POST DATA'));
  Logger.log('========================');
}
