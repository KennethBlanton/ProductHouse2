// frontend/src/lib/deviceManagement.ts
import { v4 as uuidv4 } from 'uuid';

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  operatingSystem: string;
  lastActive: string;
  ipAddress?: string;
}

export class DeviceManager {
  private static DEVICE_STORAGE_KEY = 'claude_device_tracking';

  /**
   * Get current device information
   * @returns DeviceInfo object
   */
  static getCurrentDevice(): DeviceInfo {
    // Generate or retrieve device ID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('device_id', deviceId);
    }

    // Detect device type and browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    const deviceType = this.detectDeviceType(userAgent);
    const browser = this.detectBrowser(userAgent);
    const operatingSystem = this.detectOS(userAgent);

    return {
      id: deviceId,
      name: this.generateDeviceName(deviceType, operatingSystem, browser),
      type: deviceType,
      browser,
      operatingSystem,
      lastActive: new Date().toISOString(),
    };
  }

  /**
   * Track device login
   * @param userId User identifier
   */
  static trackDeviceLogin(userId: string): void {
    const device = this.getCurrentDevice();
    
    // Retrieve existing devices
    const devicesJson = localStorage.getItem(`${this.DEVICE_STORAGE_KEY}_${userId}`);
    const devices: DeviceInfo[] = devicesJson ? JSON.parse(devicesJson) : [];

    // Check if device already exists
    const existingDeviceIndex = devices.findIndex(d => d.id === device.id);
    
    if (existingDeviceIndex !== -1) {
      // Update existing device
      devices[existingDeviceIndex] = device;
    } else {
      // Add new device, limit to 5 most recent devices
      devices.unshift(device);
      if (devices.length > 5) {
        devices.pop();
      }
    }

    // Save updated devices
    localStorage.setItem(`${this.DEVICE_STORAGE_KEY}_${userId}`, JSON.stringify(devices));
  }

  /**
   * Get list of tracked devices for a user
   * @param userId User identifier
   * @returns Array of DeviceInfo
   */
  static getTrackedDevices(userId: string): DeviceInfo[] {
    const devicesJson = localStorage.getItem(`${this.DEVICE_STORAGE_KEY}_${userId}`);
    return devicesJson ? JSON.parse(devicesJson) : [];
  }

  /**
   * Remove a specific device
   * @param userId User identifier
   * @param deviceId Device to remove
   */
  static removeDevice(userId: string, deviceId: string): void {
    const devices = this.getTrackedDevices(userId);
    const updatedDevices = devices.filter(device => device.id !== deviceId);
    
    localStorage.setItem(`${this.DEVICE_STORAGE_KEY}_${userId}`, JSON.stringify(updatedDevices));
  }

  /**
   * Detect device type based on user agent
   * @param userAgent User agent string
   */
  private static detectDeviceType(userAgent: string): DeviceInfo['type'] {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  /**
   * Detect browser from user agent
   * @param userAgent User agent string
   */
  private static detectBrowser(userAgent: string): string {
    if (userAgent.includes('chrome')) return 'Chrome';
    if (userAgent.includes('firefox')) return 'Firefox';
    if (userAgent.includes('safari')) return 'Safari';
    if (userAgent.includes('opera')) return 'Opera';
    if (userAgent.includes('msie') || userAgent.includes('trident')) return 'Internet Explorer';
    return 'Unknown';
  }

  /**
   * Detect operating system from user agent
   * @param userAgent User agent string
   */
  private static detectOS(userAgent: string): string {
    if (userAgent.includes('win')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
    if (userAgent.includes('android')) return 'Android';
    return 'Unknown';
  }

  /**
   * Generate a human-readable device name
   * @param type Device type
   * @param os Operating system
   * @param browser Browser name
   */
  private static generateDeviceName(type: string, os: string, browser: string): string {
    return `${browser} on ${os} (${type})`;
  }
}