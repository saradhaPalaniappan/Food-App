import { SafeAreaProvider } from "react-native-safe-area-context";
import * as React from "react";
import { Provider } from 'mobx-react';
import { cartStore } from './stores/CartStore';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "./screens/LandingScreen";
import Kitchen from "./screens/Kitchen";
import KitchenFoodScreen from "./screens/KitchenFoodScreen";
import KitchenDetailsScreen from "./screens/KitchenDetailsScreen";
import PrebookKitchen from "./screens/PrebookKitchen";
import LoginSelectScreen from "./screens/LoginSelectScreen";
import UserRegisterScreen from "./screens/UserRegisterScreen";
import ChefLandingScreen from "./screens/chefScreens/ChefLandingScreen";
import ChefRegisterScreen from "./screens/chefScreens/ChefRegisterScreen";
import ChefProfileScreen from "./screens/chefScreens/ChefProfileScreen";
import ChefOrderRequestScreen from "./screens/chefScreens/ChefOrderRequestScreen";
import ChefOrdersScreen from "./screens/chefScreens/ChefOrdersScreen";
import ChefRemaindersScreen from "./screens/chefScreens/ChefRemaindersScreen";
import DeliveryPartnerRegisterScreen from "./screens/deliveryPartnerScreens/DeliveryPartnerRegisterScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider cartStore={cartStore}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="SelectScreen"
              component={LoginSelectScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="UserRegister"
              component={UserRegisterScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="LandingScreen"
              component={LandingScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="Kitchen"
              component={Kitchen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="KitchenFood"
              component={KitchenFoodScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="KitchenDetails"
              component={KitchenDetailsScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="PrebookKitchenDetails"
              component={PrebookKitchen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="ChefLandingScreen"
              component={ChefLandingScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="ChefRegister"
              component={ChefRegisterScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen name="ChefProfile" component={ChefProfileScreen} />
            <Stack.Screen
              name="OrderRequest"
              component={ChefOrderRequestScreen}
            />
            <Stack.Screen name="ChefOrders" component={ChefOrdersScreen} />
            <Stack.Screen name="Reminders" component={ChefRemaindersScreen} />
            <Stack.Screen
              name="DeliveryPartnerRegister"
              component={DeliveryPartnerRegisterScreen}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="AdminLogin"
              component={AdminLoginScreen}
              options={{ title: "Welcome" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}