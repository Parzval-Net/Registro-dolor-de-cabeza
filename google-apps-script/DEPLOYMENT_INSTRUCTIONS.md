# Google Apps Script Deployment Instructions

## Files to upload to Google Apps Script:

1. **google-apps-script.html** - Upload as an HTML file
2. **Code.gs** - Upload as a .gs file

## Steps to deploy:

1. Go to https://script.google.com/
2. Create a new project
3. Delete the default Code.gs content
4. Upload the files from the 'google-apps-script' folder:
   - Upload 'google-apps-script.html' as an HTML file
   - Upload 'Code.gs' as a .gs file
5. Save the project
6. Deploy as a web app:
   - Click "Deploy" > "New deployment"
   - Choose "Web app" as the type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
7. Copy the web app URL and use it to access your MigraCare app

## Testing:

1. Open the web app URL in your browser
2. The app should load and be fully functional
3. Data will be stored in a Google Sheet automatically created by the script

## Notes:

- The app uses Google Sheets as the backend database
- All data is stored in a sheet named 'MigraCare_Data'
- The app works offline with localStorage fallback
- PWA features are included for mobile installation
