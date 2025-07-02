import { LocationObject } from "expo-location";

// 定義車款的 Enum
export enum Vehicle {
  CorollaSport = "Toyota Corolla Sport",
  CygnusX = "Yamaha Cygnus-X",
}

// 定義單筆路線的資料結構
export type Route = {
  id: string;
  date: number; // 使用時間戳 (timestamp) 儲存，方便排序
  locations: LocationObject[];
  vehicle: Vehicle; // 使用 Enum 型別
};
