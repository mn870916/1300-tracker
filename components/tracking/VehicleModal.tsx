import { Button } from "@/components/Buttons";
import { Vehicle } from "@/types/common";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface VehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export default function VehicleModal({ visible, onClose, onSelectVehicle }: VehicleModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>請選擇本次使用的車款</Text>
          <View style={styles.vehicleOption}>
            <Button
              title={Vehicle.CorollaSport}
              onPress={() => onSelectVehicle(Vehicle.CorollaSport)}
              variant="secondary"
              imageSource={require("@/assets/images/corolla-sport.png")}
            />
          </View>
          <View style={styles.vehicleOption}>
            <Button
              title={Vehicle.CygnusX}
              onPress={() => onSelectVehicle(Vehicle.CygnusX)}
              variant="secondary"
              imageSource={require("@/assets/images/cygnusx.png")}
            />
          </View>

          <Button
            title="取消"
            onPress={onClose}
            variant="ghost"
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  vehicleOption: {
    alignItems: "center",
    marginBottom: 15,
  },
});
