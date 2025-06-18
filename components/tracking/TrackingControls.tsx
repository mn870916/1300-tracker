import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TrackingControlsProps = {
  isTracking: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
};

export default function TrackingControls({
  isTracking,
  onStart,
  onPause,
  onStop,
}: TrackingControlsProps) {
  return (
    <View style={styles.container}>
      {isTracking ? (
        // 如果正在追蹤，顯示暫停和停止按鈕
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={onPause}
          >
            <FontAwesome name="pause" size={24} color="white" />
            <Text style={styles.buttonText}>暫停</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={onStop}
          >
            <FontAwesome name="stop" size={24} color="white" />
            <Text style={styles.buttonText}>停止</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 如果未在追蹤，顯示開始按鈕
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={onStart}
        >
          <FontAwesome name="play" size={24} color="white" />
          <Text style={styles.buttonText}>開始紀錄</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  startButton: {
    backgroundColor: "#34b1eb", // 假設是藍色
    paddingHorizontal: 30,
  },
  pauseButton: {
    backgroundColor: "#FFA500", // 橘色
  },
  stopButton: {
    backgroundColor: "#DC143C", // 紅色
  },
});
