# Deep Linking in VardaDienas

This app supports deep linking using the `vardadienas://` scheme.

## Available Deep Links

### Favourites Screen
- **URL**: `vardadienas://favourites`
- **With name parameter**: `vardadienas://favourites?name=John&day=15&month=Janvāris&daysBefore=0`
- **Description**: Navigates to the Favourites screen. If a name is provided, it will highlight that specific name.

### Home Screen
- **URL**: `vardadienas://home`
- **Description**: Navigates to the Home screen.

### Settings Screen
- **URL**: `vardadienas://settings`
- **Description**: Navigates to the Settings screen.

### Root Path
- **URL**: `vardadienas://`
- **Description**: Navigates to the Home screen (default).

## Testing Deep Links

### Method 1: In-App Testing (Recommended)
The app includes test buttons in the Settings screen under the "Debug" section:
- **Test Deep Link**: Tests a deep link to favourites with a test name
- **Test Notification Navigation**: Tests the notification navigation flow

### Method 2: Using the Test Functions

```typescript
import {testDeepLink, testNotificationNavigation} from "@/app/utils/notifications";

// Test a specific deep link
await testDeepLink("vardadienas://favourites?name=John");

// Test notification navigation (creates a test deep link)
await testNotificationNavigation("John");
```

### Method 3: Using External Tools

#### iOS Simulator (if app is installed)
```bash
# Make sure the app is running in the simulator first
xcrun simctl openurl booted "vardadienas://favourites?name=John"
```

#### Android Emulator (if app is installed)
```bash
# Make sure the app is running in the emulator first
adb shell am start -W -a android.intent.action.VIEW -d "vardadienas://favourites?name=John" com.vardadienas
```

#### Web Browser
You can also test by typing the URL in a web browser:
```
vardadienas://favourites?name=John
```

### Method 4: Using Safari (iOS)
1. Open Safari on your iOS device/simulator
2. Type: `vardadienas://favourites?name=John`
3. Press Enter
4. The app should open and navigate to the Favourites screen

## Troubleshooting

### Common Issues

1. **"Simulator device failed to open" error**
   - **Cause**: The app isn't installed or running in the simulator
   - **Solution**: Run `npx react-native run-ios` first to install and launch the app

2. **Deep link not working**
   - **Cause**: URI scheme not properly registered
   - **Solution**: Check that `CFBundleURLTypes` is in `ios/VardaDienas/Info.plist`

3. **Navigation not happening**
   - **Cause**: Navigation ref not ready or deep link handler not set up
   - **Solution**: Use the in-app test buttons to verify functionality

4. **Parameters not parsed**
   - **Cause**: URL encoding issues
   - **Solution**: Use `encodeURIComponent()` for parameters

### Verification Steps

1. **Check URI Scheme Registration**:
   ```bash
   # iOS
   grep -A 10 "CFBundleURLTypes" ios/VardaDienas/Info.plist
   
   # Android
   grep -A 10 "android:scheme" android/app/src/main/AndroidManifest.xml
   ```

2. **Test In-App First**:
   - Open the app
   - Go to Settings → Debug
   - Tap "Test Deep Link" or "Test Notification Navigation"

3. **Check Console Logs**:
   - Look for "Deep link received:" messages in the console
   - Verify the navigation is being triggered

## How It Works

1. **URI Scheme**: The app registers the `vardadienas://` scheme using `npx uri-scheme`
2. **Notification Integration**: When notifications are scheduled, they include a deep link in the data
3. **Deep Link Handling**: The app listens for deep link events and routes them to the appropriate screen
4. **Parameter Parsing**: URL parameters are parsed and passed to the navigation functions

## Implementation Details

- **Deep Link Setup**: `app/navigation/deepLinking.ts`
- **Navigation Service**: `app/navigation/navigationService.ts`
- **Notification Integration**: `app/utils/notifications.ts`
- **App Integration**: `App.tsx`
- **Test Functions**: Available in Settings screen under Debug section 