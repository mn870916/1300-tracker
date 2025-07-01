import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  disabled?: boolean;
  isLoading?: boolean;
  style?: object;
  imageSource?: ImageSourcePropType;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  isLoading = false,
  style,
  imageSource,
}: ButtonProps) {
  const containerStyle = [
    styles.button,
    styles[variant],
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textStyle = [styles.text, styles[`${variant}Text`]];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : Colors.light.tint}
        />
      ) : (
        <>
          {icon && (
            <FontAwesome
              name={icon}
              size={18}
              color={"white"}
              style={styles.icon}
            />
          )}
          {imageSource && (
            <Image source={imageSource} style={styles.vehicleImage} />
          )}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  icon: {
    marginRight: 8,
  },
  // Variants
  primary: {
    backgroundColor: Colors.light.tint,
  },
  primaryText: {
    color: "#fff",
  },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  secondaryText: {
    color: Colors.light.tint,
  },
  destructive: {
    backgroundColor: "#E53935",
  },
  destructiveText: {
    color: "#fff",
  },
  ghost: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  ghostText: {
    color: "#666",
  },
  disabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
    borderColor: "#ccc",
  },
  vehicleImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "contain",
  },
});
