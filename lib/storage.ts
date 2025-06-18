import { Route, Vehicle } from "@/types/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationObject } from "expo-location";

// 為了讓 uuid 在 React Native 中正常運作，需要匯入此套件
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const ROUTES_STORAGE_KEY = "@all_routes";

/**
 * 從本機儲存空間取得所有已儲存的路線
 * @returns Promise<Route[]> 路線陣列
 */
export const getAllRoutes = async (): Promise<Route[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("從儲存空間讀取路線失敗", e);
    return [];
  }
};

/**
 * 儲存一筆新的路線
 * @param newRouteLocations 新路線的座標點陣列
 * @param vehicle 使用的車款
 */
export const saveRoute = async (
  newRouteLocations: LocationObject[],
  vehicle: Vehicle
): Promise<void> => {
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
    const existingRoutes = await getAllRoutes();
    const updatedRoutes = [...existingRoutes, newRoute];
    const jsonValue = JSON.stringify(updatedRoutes);
    await AsyncStorage.setItem(ROUTES_STORAGE_KEY, jsonValue);
    console.log("路線儲存成功！");
  } catch (e) {
    console.error("儲存路線失敗", e);
  }
};

/**
 * 根據 ID 刪除一筆路線
 * @param routeId 要刪除的路線 ID
 */
export const deleteRoute = async (routeId: string): Promise<void> => {
  try {
    const existingRoutes = await getAllRoutes();
    const updatedRoutes = existingRoutes.filter(
      (route) => route.id !== routeId
    );
    const jsonValue = JSON.stringify(updatedRoutes);
    await AsyncStorage.setItem(ROUTES_STORAGE_KEY, jsonValue);
    console.log(`路線 ${routeId} 已刪除！`);
  } catch (e) {
    console.error("刪除路線失敗", e);
  }
};

/**
 * (開發用) 清除所有已儲存的路線
 */
export const clearAllRoutes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ROUTES_STORAGE_KEY);
    console.log("已清除所有路線！");
  } catch (e) {
    console.error("清除路線失敗", e);
  }
};
