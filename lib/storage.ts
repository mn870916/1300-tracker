import { Route, Vehicle } from "@/types/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationObject } from "expo-location";

// 為了讓 uuid 在 React Native 中正常運作，需要匯入此套件
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const ROUTES_STORAGE_KEY = "@all_routes";
const CURRENT_TRACKING_KEY = "@current_tracking";

type CurrentTracking = {
  vehicle: Vehicle;
  points: LocationObject[];
};

export const storage = {
  async getHistory(): Promise<Route[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("從儲存空間讀取路線失敗", e);
      return [];
    }
  },

  async saveRoute(
    newRouteLocations: LocationObject[],
    vehicle: Vehicle
  ): Promise<void> {
    if (newRouteLocations.length < 2) {
      console.log("路線太短，不進行儲存。");
      return;
    }

    const newRoute: Route = {
      id: uuidv4(),
      date: Date.now(),
      locations: newRouteLocations,
      vehicle: vehicle,
    };

    try {
      const existingRoutes = await this.getHistory();
      const updatedRoutes = [...existingRoutes, newRoute];
      const jsonValue = JSON.stringify(updatedRoutes);
      await AsyncStorage.setItem(ROUTES_STORAGE_KEY, jsonValue);
      console.log("路線儲存成功！");
    } catch (e) {
      console.error("儲存路線失敗", e);
    }
  },

  async deleteRoute(routeId: string): Promise<void> {
    try {
      const existingRoutes = await this.getHistory();
      const updatedRoutes = existingRoutes.filter(
        (route) => route.id !== routeId
      );
      const jsonValue = JSON.stringify(updatedRoutes);
      await AsyncStorage.setItem(ROUTES_STORAGE_KEY, jsonValue);
      console.log(`路線 ${routeId} 已刪除！`);
    } catch (e) {
      console.error("刪除路線失敗", e);
    }
  },

  async clearAllRoutes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ROUTES_STORAGE_KEY);
      console.log("已清除所有路線！");
    } catch (e) {
      console.error("清除路線失敗", e);
    }
  },

  async getCurrentTracking(): Promise<CurrentTracking | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(CURRENT_TRACKING_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("從儲存空間讀取當前軌跡失敗", e);
      return null;
    }
  },

  async saveCurrentTracking(
    trackingData: CurrentTracking | null
  ): Promise<void> {
    try {
      if (trackingData) {
        const jsonValue = JSON.stringify(trackingData);
        await AsyncStorage.setItem(CURRENT_TRACKING_KEY, jsonValue);
      } else {
        await AsyncStorage.removeItem(CURRENT_TRACKING_KEY);
      }
    } catch (e) {
      console.error("儲存當前軌跡失敗", e);
    }
  },
};
