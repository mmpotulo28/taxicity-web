import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#09090B" },
        headerTintColor: "#FFFFFF",
        tabBarStyle: { backgroundColor: "#09090B", borderTopColor: "#27272A" },
        tabBarActiveTintColor: "#FACC15",
        tabBarInactiveTintColor: "#A1A1AA"
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="requests" options={{ title: "Requests" }} />
      <Tabs.Screen name="status" options={{ title: "Status" }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
