import { getAllRoutes } from "@/lib/storage";
import { Route, Vehicle } from "@/types/common";
import { FontAwesome } from "@expo/vector-icons";
import type { LocationObject } from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps"; // 匯入 Marker

const { width, height } = Dimensions.get("window");

const DRAWER_PEEK_HEIGHT = 80;
const DRAWER_FULL_HEIGHT = 220;

// 車款對應圖片的字典
const vehicleImages = {
  [Vehicle.CorollaSport]: require("@/assets/images/corolla-sport.png"),
  [Vehicle.CygnusX]: require("@/assets/images/cygnusx.png"),
};

// Haversine 公式計算兩點間距離 (回傳公尺)
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180,
    φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180,
    Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 計算整條路線的統計數據
const calculateRouteStats = (locations: LocationObject[]) => {
  if (locations.length < 2) return { distance: 0, duration: 0, avgSpeed: 0 };
  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    totalDistance += getDistance(
      locations[i].coords.latitude,
      locations[i].coords.longitude,
      locations[i + 1].coords.latitude,
      locations[i + 1].coords.longitude
    );
  }
  const startTime = locations[0].timestamp,
    endTime = locations[locations.length - 1].timestamp;
  const totalDurationSeconds = (endTime - startTime) / 1000;
  const distanceKm = totalDistance / 1000,
    durationHours = totalDurationSeconds > 0 ? totalDurationSeconds / 3600 : 0;
  const avgSpeed = durationHours > 0 ? distanceKm / durationHours : 0;
  return {
    distance: distanceKm,
    duration: totalDurationSeconds,
    avgSpeed: avgSpeed,
  };
};

// 計算能涵蓋所有座標點的地圖視野
const calculateRegion = (locations: LocationObject[]): Region | undefined => {
  if (locations.length === 0) return undefined;
  let minLat = locations[0].coords.latitude,
    maxLat = locations[0].coords.latitude,
    minLng = locations[0].coords.longitude,
    maxLng = locations[0].coords.longitude;
  locations.forEach(({ coords }) => {
    minLat = Math.min(minLat, coords.latitude);
    maxLat = Math.max(maxLat, coords.latitude);
    minLng = Math.min(minLng, coords.longitude);
    maxLng = Math.max(maxLng, coords.longitude);
  });
  const midLat = (minLat + maxLat) / 2,
    midLng = (minLng + maxLng) / 2;
  const deltaLat = (maxLat - minLat) * 1.3,
    deltaLng = (maxLng - minLng) * (width / height) * 1.3;
  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: Math.max(deltaLat, 0.01),
    longitudeDelta: Math.max(deltaLng, 0.01),
  };
};

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: 0, y: pan.y._value });
      },
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        if (gesture.dy < -50) {
          Animated.spring(pan.y, {
            toValue: -DRAWER_FULL_HEIGHT,
            useNativeDriver: false,
          }).start();
        } else if (gesture.dy > 50) {
          Animated.spring(pan.y, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const translateY = pan.y.interpolate({
    inputRange: [-DRAWER_FULL_HEIGHT, 0],
    outputRange: [-DRAWER_FULL_HEIGHT, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const loadRoute = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      try {
        const allRoutes = await getAllRoutes();
        const foundRoute = allRoutes.find((r) => r.id === id);
        setRoute(foundRoute || null);
      } catch (error) {
        console.error("讀取單筆路線失敗", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoute();
  }, [id]);

  if (isLoading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (!route)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>找不到這筆歷史紀錄</Text>
      </View>
    );

  const initialRegion = calculateRegion(route.locations);
  const stats = calculateRouteStats(route.locations);
  const startPoint =
    route.locations.length > 0 ? route.locations[0].coords : null;
  const endPoint =
    route.locations.length > 1
      ? route.locations[route.locations.length - 1].coords
      : null;

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Polyline
          coordinates={route.locations.map((loc) => loc.coords)}
          strokeColor="#DC143C"
          strokeWidth={4}
        />

        {/* 起點標示 */}
        {startPoint && (
          <Marker coordinate={startPoint} title="起點" anchor={{ x: 0, y: 0 }}>
            <View style={[styles.markerCircle, styles.startMarker]} />
          </Marker>
        )}

        {/* 終點標示 */}
        {endPoint && (
          <Marker coordinate={endPoint} title="終點" anchor={{ x: 0, y: 0 }}>
            <View style={[styles.markerCircle, styles.endMarker]} />
          </Marker>
        )}
      </MapView>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>
        <View style={styles.drawerHeader}>
          <Image
            source={vehicleImages[route.vehicle]}
            style={styles.vehicleImage}
          />
          <Text style={styles.vehicleText}>{route.vehicle}</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome name="road" size={24} color="#333" />
            <Text style={styles.statValue}>{stats.distance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>公里</Text>
          </View>
          <View style={styles.statBox}>
            <FontAwesome name="tachometer" size={24} color="#333" />
            <Text style={styles.statValue}>{stats.avgSpeed.toFixed(1)}</Text>
            <Text style={styles.statLabel}>公里/小時</Text>
          </View>
          <View style={styles.statBox}>
            <FontAwesome name="clock-o" size={24} color="#333" />
            <Text style={styles.statValue}>
              {formatDuration(stats.duration)}
            </Text>
            <Text style={styles.statLabel}>總時間</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { ...StyleSheet.absoluteFillObject },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "red" },
  drawer: {
    position: "absolute",
    bottom: -DRAWER_FULL_HEIGHT + DRAWER_PEEK_HEIGHT,
    left: 0,
    right: 0,
    height: DRAWER_FULL_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  dragHandleContainer: { alignItems: "center", paddingVertical: 10 },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  vehicleImage: {
    width: 80,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
    resizeMode: "contain",
  },
  vehicleText: { fontSize: 18, fontWeight: "bold" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 5,
  },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#000", marginTop: 5 },
  statLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  markerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderColor: "white",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  startMarker: {
    backgroundColor: "#4CAF50",
  },
  endMarker: {
    backgroundColor: "#F44336",
  },
});
