import { storage } from "@/lib/storage";
import { Route, Vehicle } from "@/types/common";
import { FontAwesome } from "@expo/vector-icons";
import { LocationObject } from "expo-location";
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 單個列表項目的元件
const RouteItem = ({
  item,
  onDelete,
}: {
  item: Route;
  onDelete: (id: string) => void;
}) => {
  const calculateDistance = (locations: LocationObject[]) => {
    if (!locations || locations.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      // 兼容新舊兩種格式
      const p1 = locations[i];
      const p2 = locations[i + 1];

      const radlat1 = (Math.PI * p1.coords.latitude) / 180;
      const radlat2 = (Math.PI * p2.coords.latitude) / 180;
      const theta = p1.coords.longitude - p2.coords.longitude;
      const radtheta = (Math.PI * theta) / 180;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) dist = 1;
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      totalDistance += dist; // 英里
    }
    return (totalDistance * 1.609344).toFixed(2); // 轉換為公里
  };

  return (
    <View style={styles.itemOuterContainer}>
      <Link href={`/history/${item.id}`} asChild>
        <TouchableOpacity style={styles.itemContainer}>
          <View style={styles.itemIcon}>
            <FontAwesome
              name={
                item.vehicle === Vehicle.CorollaSport ? "car" : "motorcycle"
              }
              size={24}
            />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemDate}>
              {new Date(item.date).toLocaleDateString()}
              {new Date(item.date).toLocaleTimeString()}
            </Text>
            <Text style={styles.itemInfo}>
              {/* **BUG 修正**: 傳入 item.locations 並讀取 item.locations.length */}
              距離: {calculateDistance(item.locations)} 公里 | 紀錄點:
              {item.locations.length}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <FontAwesome name="trash-o" size={24} color="#E53935" />
      </TouchableOpacity>
    </View>
  );
};

export default function HistoryScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 讀取路線資料的函式
  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const storedRoutes = await storage.getHistory();
      setRoutes(storedRoutes.sort((a, b) => b.date - a.date));
    } catch {
      Alert.alert("讀取失敗", "無法從儲存空間讀取歷史紀錄。");
    } finally {
      setIsLoading(false);
    }
  };

  // 使用 useFocusEffect 確保每次進入畫面都重新載入資料
  useFocusEffect(
    useCallback(() => {
      loadRoutes();
    }, [])
  );

  // 處理刪除邏輯
  const handleDeleteRoute = (id: string) => {
    Alert.alert("刪除此筆紀錄？", "這個操作無法復原喔！", [
      { text: "取消", style: "cancel" },
      {
        text: "確定刪除",
        style: "destructive",
        onPress: async () => {
          await storage.deleteRoute(id);
          // 重新載入列表以更新畫面
          loadRoutes();
        },
      },
    ]);
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        renderItem={({ item }) => (
          <RouteItem item={item} onDelete={handleDeleteRoute} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>沒有任何歷史紀錄</Text>
            <Text style={styles.emptySubText}>
              快去「軌跡紀錄」頁面建立第一筆資料吧！
            </Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  itemOuterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContainer: {
    flex: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIcon: {
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemDate: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemInfo: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
});
