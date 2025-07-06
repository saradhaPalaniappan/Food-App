import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import KitchenFoodDisplay from "../components/KitchenFoodDisplay";
import Basket from "../components/Basket";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const KitchenFoodScreen = ({ route }) => {
  const insets = useSafeAreaInsets();

  const dishName = route?.params?.name || "";
  const category = (route?.params?.category || "").toLowerCase();

  const [availableKitchens, setAvailableKitchens] = useState([]);

  useEffect(() => {
    const fetchAvailableKitchens = async () => {
      try {
        if (!dishName || !category) {
          console.error("Missing dishName or category");
          return;
        }

        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        console.log(`Fetching kitchens offering "${dishName}" for "${category}" on "${today}"`);

        const kitchensSnapshot = await getDocs(collection(db, "kitchens"));
        let kitchensOfferingDish = [];

        for (const kitchenDoc of kitchensSnapshot.docs) {
          const kitchenId = kitchenDoc.id;
          const scheduleRef = doc(db, `kitchens/${kitchenId}/weeklySchedule`, today);
          const scheduleSnap = await getDoc(scheduleRef);

          if (!scheduleSnap.exists()) {
            console.log(`No schedule found for ${today} in Kitchen ${kitchenId}`);
            continue; // Skip to next kitchen
          }

          const scheduleData = scheduleSnap.data();
          console.log("Schedule Data for", kitchenId, ":", scheduleData);

          // Ensure category exists and contains an array
          const mealArray = scheduleData[category];
          if (!Array.isArray(mealArray)) {
            console.log(`No valid meal array found for ${category} in Kitchen ${kitchenId}`);
            continue;
          }

          // Check if any dish in the array matches the selected dish
          const dishFound = mealArray.some(
            (dish) => dish?.dishName?.toLowerCase() === dishName.toLowerCase() &&
              Number(dish?.quantity) > 0
          );

          if (dishFound) {
            kitchensOfferingDish.push({
              id: kitchenId,
              kitchenName: kitchenDoc.data().kitchenName || "Unknown Kitchen",
              ...kitchenDoc.data(),
            });
            console.log(`✔ Dish "${dishName}" found in Kitchen ${kitchenId}`);
          }
        }

        setAvailableKitchens(kitchensOfferingDish);
      } catch (error) {
        console.error("❌ Error fetching kitchens:", error);
      }
    };

    fetchAvailableKitchens();
  }, [dishName, category]);

  return (
    <View className="flex-1 bg-primary">
      <View
        className="bg-secondary"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View className="mx-4 mb-5">
          <View className="mx-4 flex-row mt-4 bg-primary rounded-xl p-4 shadow-lg shadow-maroon justify-center">
            <Text className="ml-3 font-semibold text-lg text-orange">
              {availableKitchens.length > 0
                ? `All kitchens serving ${dishName} for ${category.charAt(0).toUpperCase() + category.slice(1)}`
                : `No kitchens serving ${dishName} for ${category.charAt(0).toUpperCase() + category.slice(1)}`}
            </Text>
          </View>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {availableKitchens.length > 0 &&
          availableKitchens.map((kitchen) => (
            <KitchenFoodDisplay
              key={kitchen.id}
              name={dishName}
              kname={kitchen.kitchenName}
              category={category}
              kitchen={kitchen}
            />
          ))}
      </ScrollView>
      <Basket />
    </View>
  );
};

export default KitchenFoodScreen;