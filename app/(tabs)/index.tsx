import { Button } from "@/components/Buttons";
import TrackingControls from "@/components/tracking/TrackingControls";
import VehicleModal from "@/components/tracking/VehicleModal";
import { saveRoute } from "@/lib/storage";
import { Vehicle } from "@/types/common";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";

export default function TrackingScreen() {
  const [initialRegion, setInitialRegion] = useState<Region | undefined>(
    undefined
  );
  const [isTracking, setIsTracking] = useState(false);
  // **BUG 修正**: 狀態型別改為 Location.LocationObject[]
  const [routeCoordinates, setRouteCoordinates] = useState<
    Location.LocationObject[]
  >([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleModalVisible, setVehicleModalVisible] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("權限不足", "需要位置權限才能使用此功能");
        return;
      }
      let backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== "granted") {
        Alert.alert(
          "背景權限不足",
          "為了在App縮小後仍能紀錄軌跡，建議允許背景位置權限。"
        );
      }
      let location = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setInitialRegion(region);
      mapRef.current?.animateToRegion(region, 1000);
    })();
  }, []);

  const promptForVehicle = () => {
    setVehicleModalVisible(true);
  };

  const handleStartTracking = async (vehicle: Vehicle) => {
    setVehicleModalVisible(false);
    setSelectedVehicle(vehicle);
    setRouteCoordinates([]);
    setIsTracking(true);
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (location) => {
          setRouteCoordinates((prevCoords) => [...prevCoords, location]);
          mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );
    } catch (error) {
      console.error(error);
      Alert.alert("錯誤", "無法開始紀錄位置");
      setIsTracking(false);
    }
  };

  const handlePauseTracking = () => {
    locationSubscription.current?.remove();
    setIsTracking(false);
  };

  const handleStopTracking = () => {
    handlePauseTracking();
    if (routeCoordinates.length > 1 && selectedVehicle) {
      saveRoute(routeCoordinates, selectedVehicle)
        .then(() =>
          Alert.alert(
            "紀錄完成",
            `您使用 ${selectedVehicle} 的軌跡已成功儲存！`
          )
        )
        .catch((err) => {
          console.error(err);
          Alert.alert("儲存失敗", "抱歉，儲存軌跡時發生錯誤。");
        });
    } else {
      Alert.alert("紀錄未儲存", "您的軌跡太短或未選擇車輛，因此未進行儲存。");
    }
  };

  return (
    <View style={styles.container}>
      <VehicleModal
        visible={isVehicleModalVisible}
        onClose={() => setVehicleModalVisible(false)}
        onSelectVehicle={handleStartTracking}
      />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Polyline
          coordinates={routeCoordinates.map((loc) => loc.coords)}
          strokeColor="#0000FF"
          strokeWidth={6}
        />
      </MapView>
      <View style={styles.controlsContainer}>
        <TrackingControls
          isTracking={isTracking}
          onStart={promptForVehicle}
          onPause={handlePauseTracking}
          onStop={handleStopTracking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
