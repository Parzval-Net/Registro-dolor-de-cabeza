/**
 * MigraCare - Google Apps Script Backend
 * This file contains the server-side logic for the MigraCare application
 */

// Global variables
const SHEET_NAME = 'MigraCare_Data';
const HEADERS = ['id', 'date', 'time', 'intensity', 'duration', 'symptoms', 'triggers', 'medications', 'notes', 'sleep_hours', 'stress_level', 'created_at'];

/**
 * Initialize the spreadsheet and create headers if they don't exist
 */
function initializeSpreadsheet() {
  const sheet = getOrCreateSheet();
  
  // Check if headers exist
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const existingHeaders = range.getValues()[0];
  
  if (existingHeaders[0] !== HEADERS[0]) {
    // Headers don't exist, create them
    range.setValues([HEADERS]);
    range.setFontWeight('bold');
    range.setBackground('#f0f0f0');
  }
  
  return sheet;
}

/**
 * Get or create the data sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  return sheet;
}

/**
 * Handle GET requests - serve the main HTML page
 */
function doGet() {
  const htmlTemplate = HtmlService.createTemplateFromFile('google-apps-script.html');
  return htmlTemplate.evaluate()
    .setTitle('MigraCare - Diario de Migrañas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle POST requests - API endpoints
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  try {
    switch (action) {
      case 'save_entry':
        return ContentService.createTextOutput(JSON.stringify(saveEntry(data.entry)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'get_entries':
        return ContentService.createTextOutput(JSON.stringify(getEntries()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'update_entry':
        return ContentService.createTextOutput(JSON.stringify(updateEntry(data.entry)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'delete_entry':
        return ContentService.createTextOutput(JSON.stringify(deleteEntry(data.id)))
          .setMimeType(ContentService.MimeType.JSON);
      
      default:
        throw new Error('Unknown action: ' + action);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save a new headache entry
 */
function saveEntry(entry) {
  const sheet = initializeSpreadsheet();
  const row = [
    entry.id || Utilities.getUuid(),
    entry.date,
    entry.time,
    entry.intensity,
    entry.duration,
    JSON.stringify(entry.symptoms || []),
    JSON.stringify(entry.triggers || []),
    JSON.stringify(entry.medications || []),
    entry.notes || '',
    entry.sleep_hours || '',
    entry.stress_level || '',
    new Date().toISOString()
  ];
  
  sheet.appendRow(row);
  
  return {
    success: true,
    id: row[0],
    message: 'Entry saved successfully'
  };
}

/**
 * Get all headache entries
 */
function getEntries() {
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  // Skip header row
  const entries = data.slice(1).map(row => ({
    id: row[0],
    date: row[1],
    time: row[2],
    intensity: row[3],
    duration: row[4],
    symptoms: JSON.parse(row[5] || '[]'),
    triggers: JSON.parse(row[6] || '[]'),
    medications: JSON.parse(row[7] || '[]'),
    notes: row[8] || '',
    sleep_hours: row[9] || '',
    stress_level: row[10] || '',
    created_at: row[11]
  }));
  
  return entries;
}

/**
 * Update an existing headache entry
 */
function updateEntry(entry) {
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  // Find the row with the matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === entry.id) {
      const row = i + 1; // Convert to 1-based index
      const updateData = [
        entry.id,
        entry.date,
        entry.time,
        entry.intensity,
        entry.duration,
        JSON.stringify(entry.symptoms || []),
        JSON.stringify(entry.triggers || []),
        JSON.stringify(entry.medications || []),
        entry.notes || '',
        entry.sleep_hours || '',
        entry.stress_level || '',
        entry.created_at || new Date().toISOString()
      ];
      
      sheet.getRange(row, 1, 1, updateData.length).setValues([updateData]);
      
      return {
        success: true,
        message: 'Entry updated successfully'
      };
    }
  }
  
  throw new Error('Entry not found');
}

/**
 * Delete a headache entry
 */
function deleteEntry(id) {
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  // Find the row with the matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const row = i + 1; // Convert to 1-based index
      sheet.deleteRow(row);
      
      return {
        success: true,
        message: 'Entry deleted successfully'
      };
    }
  }
  
  throw new Error('Entry not found');
}

/**
 * Test function to verify the setup
 */
function testSetup() {
  const sheet = initializeSpreadsheet();
  console.log('Spreadsheet initialized successfully');
  console.log('Sheet name:', sheet.getName());
  console.log('Headers:', HEADERS);
  
  return {
    success: true,
    message: 'Setup completed successfully',
    sheetName: sheet.getName()
  };
}
