# 軌跡紀錄 App

這是一個使用 Expo (React Native) 開發的軌跡紀錄應用程式，旨在幫助使用者輕鬆記錄、儲存並回顧自己的移動路徑。

## ✨ 主要功能

- **📍 即時軌跡紀錄**:

  - 使用 `react-native-maps` 顯示地圖，並可選擇 Google Maps 作為圖資。
  - 透過 `expo-location` 精準獲取並監聽使用者位置。
  - 在地圖上以線條 (`Polyline`) 即時繪製當前移動路徑。

- **🚗 交通工具選擇**:

  - 在開始記錄前，會彈出視窗讓使用者選擇本次使用的交通工具 。

- **💾 歷史路線儲存**:

  - 使用 `@react-native-async-storage/async-storage` 將完成的路線儲存在裝置本機。
  - 每條路線都會附帶一個獨一無二的 ID (`uuid`)、日期及所選車款。

- **📜 歷史紀錄列表**:

- **🗺️ 路線詳情檢視**:

## 🛠️ 技術棧

- **框架**: Expo (React Native)
- **語言**: TypeScript
- **路由**: Expo Router
- **地圖**: `react-native-maps`
- **位置**: `expo-location`
- **本地儲存**: `@react-native-async-storage/async-storage`

## 📁 專案結構

.
├── app/ # Expo Router 路由與畫面
│ ├── (tabs)/ # Tab 導航群組
│ │ ├── \_layout.tsx # Tab 佈局
│ │ ├── index.tsx # 軌跡紀錄主畫面
│ │ └── history.tsx # 歷史列表畫面
│ └── history/
│ └── [id].tsx # 歷史詳情動態頁面
├── assets/ # 靜態資源 (圖片、字體)
├── components/ # 可重用 UI 元件
├── constants/ # 常數 (顏色等)
├── lib/ # 核心邏輯 (儲存、輔助函式)
├── App.js # App 進入點
└── package.json

## 🔮 未來規劃

- [ ] **分享功能**: 實現最後一個核心功能：將目前位置或歷史軌跡分享給朋友。
- [ ] **雲端同步**: 串接 Firebase/Supabase 等後端服務，讓使用者可以跨裝置同步歷史紀錄。
- [ ] **數據視覺化**: 在詳情頁加入更多圖表，如速度變化曲線圖。
- [ ] **設定頁面**: 完善設定頁面功能，如單位切換 (公里/英里)、地圖樣式選擇等。
