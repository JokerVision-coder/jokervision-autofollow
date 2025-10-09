/**
 * Device-specific utility functions for JokerVision Mobile App
 */

import { Platform, Dimensions, PermissionsAndroid, Alert, Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

export const DEVICE_INFO = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  screenWidth: width,
  screenHeight: height,
  isTablet: width > 768,
  isSmallScreen: width < 375,
};

export const checkPermissions = async (permission) => {
  if (DEVICE_INFO.isAndroid) {
    try {
      const granted = await PermissionsAndroid.check(permission);
      return granted;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }
  return true; // iOS handles permissions differently
};

export const requestPermission = async (permission, rationale) => {
  if (DEVICE_INFO.isAndroid) {
    try {
      const granted = await PermissionsAndroid.request(permission, rationale);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }
  return true; // iOS handles permissions through Info.plist
};

export const requestMicrophonePermission = async () => {
  if (DEVICE_INFO.isAndroid) {
    return await requestPermission(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'JokerVision needs access to your microphone for Voice AI features.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
  }
  return true;
};

export const requestPhonePermission = async () => {
  if (DEVICE_INFO.isAndroid) {
    return await requestPermission(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: 'Phone Permission',
        message: 'JokerVision needs permission to make phone calls to leads.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
  }
  return true;
};

export const requestContactsPermission = async () => {
  if (DEVICE_INFO.isAndroid) {
    return await requestPermission(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts Permission',
        message: 'JokerVision needs access to contacts for lead management.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
  }
  return true;
};

export const makePhoneCall = (phoneNumber) => {
  const url = `tel:${phoneNumber}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    })
    .catch((error) => {
      console.error('Phone call error:', error);
      Alert.alert('Error', 'Failed to make phone call');
    });
};

export const sendSMS = (phoneNumber, message = '') => {
  const url = Platform.select({
    ios: `sms:${phoneNumber}&body=${encodeURIComponent(message)}`,
    android: `sms:${phoneNumber}?body=${encodeURIComponent(message)}`,
  });

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'SMS is not supported on this device');
      }
    })
    .catch((error) => {
      console.error('SMS error:', error);
      Alert.alert('Error', 'Failed to send SMS');
    });
};

export const openEmail = (email, subject = '', body = '') => {
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Email is not supported on this device');
      }
    })
    .catch((error) => {
      console.error('Email error:', error);
      Alert.alert('Error', 'Failed to open email');
    });
};

export const openMaps = (address) => {
  const encodedAddress = encodeURIComponent(address);
  const url = Platform.select({
    ios: `maps:?q=${encodedAddress}`,
    android: `geo:0,0?q=${encodedAddress}`,
  });

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        const webUrl = `https://maps.google.com/?q=${encodedAddress}`;
        return Linking.openURL(webUrl);
      }
    })
    .catch((error) => {
      console.error('Maps error:', error);
      Alert.alert('Error', 'Failed to open maps');
    });
};

export const openWebsite = (url) => {
  // Ensure URL has protocol
  let formattedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    formattedUrl = `https://${url}`;
  }

  Linking.canOpenURL(formattedUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(formattedUrl);
      } else {
        Alert.alert('Error', 'Cannot open website');
      }
    })
    .catch((error) => {
      console.error('Website open error:', error);
      Alert.alert('Error', 'Failed to open website');
    });
};

export const vibrate = (pattern = [100, 200, 100]) => {
  try {
    if (DEVICE_INFO.isAndroid) {
      const { Vibration } = require('react-native');
      Vibration.vibrate(pattern);
    } else {
      // iOS uses different vibration API
      const { Vibration } = require('react-native');
      Vibration.vibrate();
    }
  } catch (error) {
    console.error('Vibration error:', error);
  }
};

export const hapticFeedback = (type = 'light') => {
  try {
    if (DEVICE_INFO.isIOS) {
      const { HapticFeedback } = require('react-native-haptic-feedback');
      HapticFeedback.trigger(type);
    } else {
      // Android fallback to vibration
      vibrate([50]);
    }
  } catch (error) {
    console.error('Haptic feedback error:', error);
    // Fallback to simple vibration
    vibrate([50]);
  }
};

export const copyToClipboard = async (text) => {
  try {
    const { Clipboard } = require('@react-native-clipboard/clipboard');
    await Clipboard.setString(text);
    return true;
  } catch (error) {
    console.error('Clipboard error:', error);
    return false;
  }
};

export const getClipboardContent = async () => {
  try {
    const { Clipboard } = require('@react-native-clipboard/clipboard');
    const content = await Clipboard.getString();
    return content;
  } catch (error) {
    console.error('Clipboard read error:', error);
    return '';
  }
};

export const getDeviceId = () => {
  try {
    const { getUniqueId } = require('react-native-device-info');
    return getUniqueId();
  } catch (error) {
    console.error('Device ID error:', error);
    return 'unknown_device';
  }
};

export const getAppVersion = () => {
  try {
    const { getVersion } = require('react-native-device-info');
    return getVersion();
  } catch (error) {
    console.error('App version error:', error);
    return '1.0.0';
  }
};

export const getBuildNumber = () => {
  try {
    const { getBuildNumber } = require('react-native-device-info');
    return getBuildNumber();
  } catch (error) {
    console.error('Build number error:', error);
    return '1';
  }
};

export const isNetworkConnected = async () => {
  try {
    const { NetInfo } = require('@react-native-netinfo/netinfo');
    const state = await NetInfo.fetch();
    return state.isConnected;
  } catch (error) {
    console.error('Network check error:', error);
    return true; // Assume connected if can't check
  }
};

export const getNetworkType = async () => {
  try {
    const { NetInfo } = require('@react-native-netinfo/netinfo');
    const state = await NetInfo.fetch();
    return state.type;
  } catch (error) {
    console.error('Network type error:', error);
    return 'unknown';
  }
};

export const showActionSheet = (options, callback) => {
  Alert.alert(
    options.title || 'Select an option',
    options.message || '',
    options.buttons || [],
    { cancelable: options.cancelable !== false }
  );
};