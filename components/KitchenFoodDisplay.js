import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import cartStore from '../stores/CartStore';

const KitchenFoodDisplay = observer((props) => {
  const { kitchen } = props;
  const [orderType, setOrderType] = useState("");
  const [kitchenQuantity, setKitchenQuantity] = useState(null); // quantity from schedule
  const [dishDetails, setDishDetails] = useState({ price: "-", type: "-", description: "-" });

  useEffect(() => {
    const fetchDishDetailsAndQuantity = async () => {
      try {
        const currentHour = new Date().getHours();
        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        // Determine orderType based on hour
        let ordType = "";
        if (currentHour >= 6 && currentHour < 12) {
          ordType = "Breakfast";
        } else if (currentHour >= 12 && currentHour < 17) {
          ordType = "Lunch";
        } else if (currentHour >= 17 && currentHour < 23) {
          ordType = "Dinner";
        }
        setOrderType(ordType);

        // Fetch dish details
        const dishRef = doc(db, "kitchens", props.kname, "menu", props.name);
        const dishSnap = await getDoc(dishRef);

        if (dishSnap.exists()) {
          setDishDetails(dishSnap.data());
          // Fetch kitchen's schedule to get quantity for current orderType
          if (kitchen && kitchen.id && ordType) {
            const kitchenId = kitchen.id;
            const scheduleRef = doc(db, `kitchens/${kitchenId}/weeklySchedule`, today);
            const scheduleSnap = await getDoc(scheduleRef);
            if (scheduleSnap.exists()) {
              const scheduleData = scheduleSnap.data();
              const mealArray = scheduleData[ordType.toLowerCase()];
              if (Array.isArray(mealArray)) {
                const foundDish = mealArray.find(
                  d =>
                    d.dishName &&
                    d.dishName.toLowerCase() === props.name.toLowerCase()
                );
                if (foundDish) {
                  const quantity = Number(foundDish.quantity) || 0;
                  const sold = Number(foundDish.sold) || 0;
                  setKitchenQuantity(Math.max(quantity - sold, 0));
                } else {
                  setKitchenQuantity(0);
                }
              } else {
                setKitchenQuantity(0);
              }
            } else {
              setKitchenQuantity(0);
            }
          }
        } else {
          console.warn("Dish document not found");
        }
      } catch (error) {
        console.error("Error fetching dish details:", error);
      }
    };

    fetchDishDetailsAndQuantity();
    // Depend on kname, name, kitchen
  }, [props.kname, props.name, kitchen]);

  // ✅ Hide non-veg dishes if Veg Only is enabled
  if (cartStore.isVegOnly && dishDetails.type?.toLowerCase() !== "veg") {
    return null;
  }

  const handleCounter = (value) => {
    const currentQuantity = cartStore.getQuantity(props.kname, props.name);
    const newQuantity = currentQuantity + value;

    if (newQuantity <= 0) {
      cartStore.removeFromCart(props.kname, props.name);
    } else {
      cartStore.addToCart({
        orderId: cartStore.orderId,
        category: props.category,
        kitchenName: props.kname,
        dishName: props.name,
        price: dishDetails.price,
        quantity: value,
      });
    }
  };

  const images = {
    chapathi: require("../assets/foodDisplay/chapathi.jpg"),
    curdrice: require("../assets/foodDisplay/curdrice.jpg"),
    dosa: require("../assets/foodDisplay/dosa.jpg"),
    idly: require("../assets/foodDisplay/idly.jpg"),
    parotta: require("../assets/foodDisplay/parota.webp"),
    pongal: require("../assets/foodDisplay/pongal.jpg"),
    poori: require("../assets/foodDisplay/poori.jpg"),
    sambarrice: require("../assets/foodDisplay/sambarrice.jpg"),
  };

  const imageKey = props.name.toLowerCase().replace(/\s+/g, "");
  const imageSource = images[imageKey];

  return (
    <View className="bg-veg h-32 mx-4 mt-4 mb-1 rounded-lg overflow-hidden flex-row shadow-md shadow-maroon">
      <View>
        <Image source={imageSource} className="w-28 h-32" />
        <View className="absolute flex-row bottom-0 items-center justify-center bg-[#fffbdc9e] w-full p-1">
          <TouchableOpacity onPress={() => handleCounter(-1)} disabled={cartStore.getQuantity(props.kname, props.name) === 0}>
            <Text className="bg-secondary rounded-full h-8 w-8 text-center text-lg font-bold">-</Text>
          </TouchableOpacity>
          <Text className="text-xl mx-2 text-center">{cartStore.getQuantity(props.kname, props.name)}</Text>
          <TouchableOpacity
            onPress={() => handleCounter(1)}
            disabled = { (kitchenQuantity == null || kitchen == "") ||
              (kitchenQuantity !== null && kitchenQuantity > 0 &&
                cartStore.getQuantity(props.kname, props.name) >= kitchenQuantity)
            }>
            <Text className="bg-secondary rounded-full h-8 w-8 text-center text-lg font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="ml-3">
        <Text className="font-bold text-xl border-b-2 border-dashed border-primary w-60 p-1">
          {props.kname}
        </Text>
        <View className="flex-row mt-1">
          <View>
            <Text className="text-lg">{props.name}</Text>
          </View>
          <View className="ml-5">
            <Text className={`text-lg font-bold ${dishDetails.type.toLowerCase() === "veg" ? "text-green" : "text-maroon"}`}>
              {dishDetails.type === "veg" ? "Veg" : "Non-Veg"}
            </Text>
          </View>
        </View>
        <View className="p-1">
          <Text className="font-bold mb-1">₹ {dishDetails.price}</Text>
          <Text className="text-white font-semibold text-sm mb-1">{dishDetails.description}</Text>
        </View>
      </View>
    </View>
  );
});

export default KitchenFoodDisplay;