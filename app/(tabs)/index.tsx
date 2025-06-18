import TrackingControls from "@/components/tracking/TrackingControls";
import { saveRoute } from "@/lib/storage";
import { Vehicle } from "@/types/common";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const renderVehicleModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVehicleModalVisible}
      onRequestClose={() => setVehicleModalVisible(!isVehicleModalVisible)}
    >
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>請選擇本次使用的車款</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => handleStartTracking(Vehicle.CorollaSport)}
          >
            <Image
              source={require("@/assets/images/corolla-sport.png")}
              style={styles.vehicleImage}
            />
            <Text style={styles.modalButtonText}>{Vehicle.CorollaSport}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => handleStartTracking(Vehicle.CygnusX)}
          >
            <Image
              source={require("@/assets/images/cygnusx.png")}
              style={styles.vehicleImage}
            />
            <Text style={styles.modalButtonText}>{Vehicle.CygnusX}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={() => setVehicleModalVisible(false)}
          >
            <Text style={[styles.modalButtonText, { color: "white" }]}>
              取消
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderVehicleModal()}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Polyline
          // **BUG 修正**: 映射以取得座標
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
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: 250,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
  },
  modalButtonText: { fontSize: 16, fontWeight: "500", marginTop: 8 },
  vehicleImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: "contain",
  },
  cancelButton: {
    backgroundColor: "gray",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginTop: 20,
    width: 250,
    alignItems: "center",
  },
});
