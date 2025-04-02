@echo off
echo === SynthedXYZ Cleanup Script ===
echo This script will remove GooeyMenu components and fix script loading issues
echo.

set PROJECT_ROOT=E:\projects\synthedxyz

echo === Step 1: Removing GooeyMenu related files ===
if exist "%PROJECT_ROOT%\src\components\disabled\GooeyMenu.astro" (
    echo Removing GooeyMenu.astro from disabled directory...
    del "%PROJECT_ROOT%\src\components\disabled\GooeyMenu.astro"
)

if exist "%PROJECT_ROOT%\public\js\gooey-menu.js" (
    echo Removing gooey-menu.js...
    del "%PROJECT_ROOT%\public\js\gooey-menu.js"
)

if exist "%PROJECT_ROOT%\public\css\gooey-menu.css" (
    echo Removing gooey-menu.css...
    del "%PROJECT_ROOT%\public\css\gooey-menu.css"
)

if exist "%PROJECT_ROOT%\public\css\gooey-menu-textures.css" (
    echo Removing gooey-menu-textures.css...
    del "%PROJECT_ROOT%\public\css\gooey-menu-textures.css"
)

echo.
echo === Step 2: Fixing CORS issues by replacing localhost:3001 URLs ===

echo Creating backup directory...
if not exist "%PROJECT_ROOT%\backups" mkdir "%PROJECT_ROOT%\backups"

echo Making backup of AmorphousPrism.astro...
copy "%PROJECT_ROOT%\src\components\AmorphousPrism.astro" "%PROJECT_ROOT%\backups\AmorphousPrism.astro.bak"

echo Updating script URLs in AmorphousPrism.astro...
powershell -Command "(Get-Content '%PROJECT_ROOT%\src\components\AmorphousPrism.astro') -replace 'http://localhost:3001/instrumented/public/js/', '/js/' -replace 'http://localhost:3001/instrumented/src/scripts/', '/scripts/' | Set-Content '%PROJECT_ROOT%\src\components\AmorphousPrism.astro'"

echo Making backup of MainLayout.astro...
copy "%PROJECT_ROOT%\src\layouts\MainLayout.astro" "%PROJECT_ROOT%\backups\MainLayout.astro.bak"

echo Updating script URLs in MainLayout.astro...
powershell -Command "(Get-Content '%PROJECT_ROOT%\src\layouts\MainLayout.astro') -replace 'http://localhost:3001/instrumented/public/js/', '/js/' | Set-Content '%PROJECT_ROOT%\src\layouts\MainLayout.astro'"

echo.
echo === Step 3: Ensuring Three.js is properly loaded ===

echo Checking if Three.js is included...
powershell -Command "if ((Get-Content '%PROJECT_ROOT%\src\layouts\MainLayout.astro') -notmatch 'three.js') { Add-Content -Path '%PROJECT_ROOT%\src\layouts\MainLayout.astro' -Value '<!-- Add Three.js -->`n<script is:inline src=\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js\"></script>' }"

echo.
echo === Step 4: Remove debug-related elements ===

echo Making backup of HeroSection.astro...
copy "%PROJECT_ROOT%\src\components\HeroSection.astro" "%PROJECT_ROOT%\backups\HeroSection.astro.bak"

echo Removing remaining 'gooey-container' class from HeroSection.astro...
powershell -Command "(Get-Content '%PROJECT_ROOT%\src\components\HeroSection.astro') -replace 'gooey-container', '' | Set-Content '%PROJECT_ROOT%\src\components\HeroSection.astro'"

echo.
echo === Step 5: Copy debug removal scripts to js directory ===

echo Ensuring js directory exists...
if not exist "%PROJECT_ROOT%\public\js" mkdir "%PROJECT_ROOT%\public\js"

echo Creating/updating remove-debug-ui.js...
powershell -Command "(Get-Content '%PROJECT_ROOT%\public\js\remove-debug-ui.js') -or '' | Set-Content '%PROJECT_ROOT%\public\js\remove-debug-ui.js'"

echo.
echo === Summary of changes ===
echo 1. Removed GooeyMenu related files
echo 2. Fixed CORS issues by replacing localhost:3001 references with relative paths
echo 3. Ensured Three.js is properly loaded in the layout
echo 4. Removed gooey-container class references
echo 5. Made backups of all modified files in the backups directory
echo.
echo Script completed successfully!
echo.
echo NOTE: You may need to rebuild/restart your development server for changes to take effect.
echo You should test the site again to verify the issues are resolved.
echo.
pause