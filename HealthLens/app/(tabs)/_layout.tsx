import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="Diagnose" options={{ headerShown: false }} />
      <Tabs.Screen name="History" options={{ headerShown: false }} />
      <Tabs.Screen name="Profile" options={{ headerShown: false }} />
      <Tabs.Screen
        name="(settings)"
        options={{
          headerShown: false,
          href: null, // This hides it from tabs
        }}
      />
    </Tabs>
  );
}
