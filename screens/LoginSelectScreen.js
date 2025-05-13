import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const LoginSelectScreen = () => {
  const Navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="items-center justify-center bg-veg flex-1"
    >
      <TouchableOpacity onPress={() => Navigation.navigate("UserRegister")}>
        <Text className="bg-primary w-60 p-2 rounded-lg text-center mb-10 text-lg">
          Want to eat
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Navigation.navigate("ChefRegister")}>
        <Text className="bg-primary w-60 p-2 rounded-lg text-center mb-10 text-lg">
          Become a chef
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Navigation.navigate("DeliveryPartnerRegister")}>
        <Text className="bg-primary w-60 p-2 rounded-lg text-center text-lg mb-2">
          Want to Deliver
        </Text>
      </TouchableOpacity>
      <Text className="mt-2 font-semibold text-lg text-white">
        {"Admin" + " "  } 
        <Text className="text-white underline" onPress={() => Navigation.navigate("AdminLogin")}>
          Login
        </Text>
      </Text>
    </View>
    
  );
};

export default LoginSelectScreen;

