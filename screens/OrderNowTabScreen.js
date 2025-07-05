import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Modal, ScrollView } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from "react";
import React from "react";

import TopSection from "../components/TopSection";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import BfTabScreen from "./subTabScreens/BfTabScreen";
import LunchTabScreen from "./subTabScreens/LunchTabScreen";
import DinnerTabScreen from "./subTabScreens/DinnerTabScreen";
import SearchBar from "../components/SearchBar";

const Tab = createMaterialTopTabNavigator();

const OrderNowTabScreen = () => {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  return (
    <View className="flex-1 bg-primary">
      <SearchBar placeholder="Search food..." />

      {/* Info icon button top right */}
      <TouchableOpacity
        onPress={() => setShowDescriptionModal(true)}
        style={{ alignSelf: 'flex-end', marginRight: 26, marginTop: 6 }}
        accessibilityLabel="App Info"
      >
        <Ionicons name="information-circle-outline" size={28} color="#FFA500" />
      </TouchableOpacity>

      {/* Info Modal */}
      <Modal
        visible={showDescriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', margin: 32, borderRadius: 14, padding: 22, maxHeight: '80%' }}>
            <ScrollView>
              <Text className="text-orange text-lg mb-2 font-semibold text-center">Info</Text>
              <Text className="text-orange text-center text-base font-semibold">
                This app connects users to home-cooked meals prepared by local chefs. It offers healthy, preservative-free food that's both affordable and nutritious. All kitchens are approved through strict verification, with periodic inspections and surprise inspections to ensure hygiene and quality.
              </Text>
              <Text className="text-orange text-center text-xs mt-2">
                The platform supports small-scale cooks, promotes community well-being, and provides an economical-traditional alternative to commercial dining, all with a strong focus on safety and health.
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowDescriptionModal(false)}
              style={{ marginTop: 16, backgroundColor: '#FFA500', paddingVertical: 10, borderRadius: 8 }}
            >
              <Text className="text-white text-center text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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