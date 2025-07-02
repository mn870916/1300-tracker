import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { storage } from './storage';

export const LOCATION_TRACKING_TASK = 'location-tracking-task';

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log('Received new locations', locations);
    const currentTracking = await storage.getCurrentTracking();
    if (currentTracking) {
      const newPoints = [...(currentTracking.points || []), ...locations.map(loc => loc)];
      await storage.saveCurrentTracking({ ...currentTracking, points: newPoints });
    }
  }
});

export const startLocationTracking = async () => {
  await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    distanceInterval: 1,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: '1300 Tracker',
      notificationBody: 'Tracking your location...',
    },
  });
  console.log('Location tracking started');
};

export const stopLocationTracking = async () => {
  await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
  console.log('Location tracking stopped');
};
