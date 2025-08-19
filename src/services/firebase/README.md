# Firebase Storage Integration

This implementation adds secure Firebase storage support to Tab Blaster 5K with weekly password expiry for enhanced security.

## 🔥 Features

- **Runtime Configuration**: Users enter their own Firebase credentials
- **Client-Side Encryption**: All data encrypted before sending to Firebase
- **Weekly Password Expiry**: Passwords expire every 7 days for security
- **Zero-Knowledge Architecture**: Extension never sees unencrypted Firebase data
- **Complete User Control**: Users own their Firebase project and data

## 🛡️ Security Model

### Multi-Layer Protection

1. **Firebase Authentication**: User's own Firebase project
2. **Client-Side Encryption**: AES-256-GCM with PBKDF2 key derivation
3. **Password Expiry**: Weekly re-authentication required
4. **Data Isolation**: Each user has unique encrypted data space

### Key Management

- Encryption keys derived from user password + device info
- 600,000 PBKDF2 iterations for strong key derivation
- Random salt per configuration for uniqueness
- Session-based key caching with automatic expiry

## 📁 Files Added

### Core Services

- `src/services/firebase/FirebaseStorageService.ts` - Main storage implementation
- `src/services/firebase/FirebaseConfigService.ts` - Configuration & encryption
- `src/services/firebase/FirebaseTypes.ts` - Type definitions

### UI Components

- `src/components/settings/FirebaseSetupForm.tsx` - Initial setup form
- `src/components/settings/FirebasePasswordPrompt.tsx` - Weekly password prompt
- `src/components/settings/FirebaseStatus.tsx` - Status & management
- `src/components/settings/EnhancedStorageSettings.tsx` - Complete settings UI

### Styling

- `src/styles/FirebaseComponents.css` - Firebase-specific styles

## 🔧 Integration

### 1. Update StorageFactory

Firebase is added as `StorageType.FIREBASE` with automatic fallback handling.

### 2. Enhanced Settings

The `EnhancedStorageSettings` component shows how to integrate Firebase into your existing storage options.

### 3. Password Flow

- Initial setup: User enters Firebase config + password
- Weekly expiry: User re-enters password to extend access
- Fallback: Automatic switch to local storage if user cancels

## 🚀 Usage Flow

### First-Time Setup

1. User selects "Firebase" in storage settings
2. Enters Firebase project configuration
3. Sets encryption password
4. Extension tests connection and saves encrypted config

### Weekly Re-Authentication

1. Password expires after 7 days
2. User prompted to re-enter password
3. Session extended for another week
4. Seamless access to Firebase data

### Security Features

- Connection test before saving configuration
- Invalid password lockout after 3 attempts
- Session management with automatic cleanup
- Complete configuration removal option

## 🔒 Security Benefits

1. **User Sovereignty**: Each user controls their own Firebase project
2. **Data Encryption**: Client-side encryption before cloud storage
3. **Key Security**: Strong key derivation with device-specific salts
4. **Access Control**: Regular password expiry prevents unauthorized access
5. **Zero Exposure**: No API keys or sensitive data in source code

## 📝 Implementation Notes

### Dependencies

- Firebase SDK (`firebase`) for Firestore operations
- Web Crypto API for encryption (built into browsers)
- Chrome Storage API for encrypted config storage

### Error Handling

- Graceful fallback to local storage on failures
- Clear error messages for user guidance
- Automatic retry logic for transient failures

### Performance

- Lazy loading of Firebase SDK
- Session-based key caching
- Efficient batch operations for data sync

This implementation provides enterprise-grade security while maintaining excellent user experience with minimal setup friction.
