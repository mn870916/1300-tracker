import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

// 為了讓程式碼更乾淨，我們可以建立一個輔助元件來處理圖示的顯示
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 設定標籤列的通用樣式
        tabBarActiveTintColor: "gray", // 假設您在 Colors.ts 中定義了這個顏色
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
        },
        // 隱藏每個 Tab 畫面的頂部標題，因為我們可能想在各自頁面中自訂
        headerShown: true,
      }}
    >
      {/* 第一個 Tab: 軌跡紀錄主畫面 */}
      <Tabs.Screen
        name="index" // 對應到 app/(tabs)/index.tsx 檔案
        options={{
          title: "軌跡紀錄", // Tab 上顯示的標題
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map-marker" color={color} />
          ),
        }}
      />
      {/* 第二個 Tab: 歷史紀錄列表 */}
      <Tabs.Screen
        name="history" // 對應到 app/(tabs)/history.tsx 檔案
        options={{
          title: "歷史紀錄",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="history" color={color} />
          ),
        }}
      />
      {/* 第三個 Tab: 設定 */}
      {/* <Tabs.Screen
        name="settings" // 對應到 app/(tabs)/settings.tsx 檔案
        options={{
          title: "設定",
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
