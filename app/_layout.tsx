import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
// import { LocationProvider } from '../context/LocationContext'; // 稍後會建立並取消註解

// 在 Root Layout 載入之前，防止啟動畫面 (Splash Screen) 自動隱藏
// 這樣可以確保字體和其他資源都載入完成後才顯示主畫面
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 載入自定義字體 (若有)
  const [fontsLoaded, error] = useFonts({
    // 'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // 如果字體載入發生錯誤，就拋出錯誤
    if (error) throw error;

    // 當字體載入完成後，隱藏啟動畫面
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // 如果字體還沒載入完成，就先不渲染任何東西
  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    // 在這裡包裹全域的 Context Provider
    // <LocationProvider>
    <RootLayoutNav />
    // </LocationProvider>
  );
}

function RootLayoutNav() {
  return (
    // Stack 導航器，管理 App 的所有畫面堆疊
    <Stack>
      {/* 主要的 Tab 導覽畫面。
        設定 headerShown: false 是因為我們會在 (tabs)/_layout.tsx 中
        自行定義 Tab 的標題和樣式，這裡就不需要再顯示一次。
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 設定畫面的路由。
        presentation: 'modal' 會讓這個頁面從底部彈出，
        就像 iOS 原生的設定頁面一樣。
      */}
      <Stack.Screen
        name="history/[id]"
        options={{
          title: "歷史紀錄詳情",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
