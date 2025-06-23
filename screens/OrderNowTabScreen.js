import { View, TextInput, Text, TouchableOpacity } from "react-native";
import React from "react";

import TopSection from "../components/TopSection";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import BfTabScreen from "./subTabScreens/BfTabScreen";
import LunchTabScreen from "./subTabScreens/LunchTabScreen";
import DinnerTabScreen from "./subTabScreens/DinnerTabScreen";
import SearchBar from "../components/SearchBar";

const Tab = createMaterialTopTabNavigator();

const OrderNowTabScreen = () => {
  return (
    <View className="flex-1 bg-primary">
      <SearchBar placeholder="Search food..." />
      <Text className="text-orange p-1 text-center text-xl mx-1 mt-2 mb-2">This app connects users to home-cooked meals prepared by local chefs. It offers healthy, preservative-free food that's both affordable and nutritious. All kitchens are approved through strict verification, with periodic inspections and surprise inspections to ensure hygiene and quality. The platform supports small-scale cooks, promotes community well-being, and provides an economical-traditional alternative to commercial dining, all with a strong focus on safety and health.</Text>
      <View>
        <TopSection />
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "transparent",
            borderRadius: 10,
            elevation: 0,
          },
          tabBarActiveTintColor: "#FF7400",
          tabBarInactiveTintColor: "gray",
          tabBarIndicatorStyle: { backgroundColor: "#FF7400" },
          tabBarPressColor: "transparent",
          tabBarPressOpacity: 0,
          tabBarLabelStyle: { fontWeight: 900 },
        }}
      >
        <Tab.Screen name="BreakFast" component={BfTabScreen} />
        <Tab.Screen name="Lunch" component={LunchTabScreen} />
        <Tab.Screen name="Dinner" component={DinnerTabScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default OrderNowTabScreen;