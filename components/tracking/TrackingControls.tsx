import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../Buttons";
import {
  startLocationTracking,
  stopLocationTracking,
} from "../../lib/location";

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
  const handleStart = async () => {
    await startLocationTracking();
    onStart();
  };

  const handleStop = async () => {
    await stopLocationTracking();
    onStop();
  };

  return (
    <View style={styles.container}>
      {isTracking ? (
        <View style={styles.buttonRow}>
          <Button
            title="暫停"
            onPress={onPause}
            icon="pause"
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="停止"
            onPress={handleStop}
            icon="stop"
            variant="destructive"
            style={styles.button}
          />
        </View>
      ) : (
        <Button
          title="開始紀錄"
          onPress={handleStart}
          icon="play"
          variant="primary"
        />
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
    flex: 1,
    marginHorizontal: 10,
  },
});
