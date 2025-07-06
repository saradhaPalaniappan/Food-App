import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { ShoppingCartIcon, XMarkIcon } from "react-native-heroicons/solid";
import { observer } from "mobx-react-lite";
import cartStore from "../stores/CartStore";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import moment from "moment";

import { useEffect } from "react";

const Basket = observer(() => {
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState({}); // { "kitchenName:dishName": kitchenQuantity }

  // Fetch latest kitchenQuantity for all cart items when cart changes or modal opens
  useEffect(() => {
    async function fetchAllQuantities() {
      const today = new Date().toLocaleString("en-US", { weekday: "long" });
      let qMap = {};
      for (const item of cartStore.cart) {
        // use orderType like in KitchenFoodDisplay.js
        const currentHour = new Date().getHours();
        let ordType = "";
        if (currentHour >= 6 && currentHour < 12) ordType = "breakfast";
        else if (currentHour >= 12 && currentHour < 17) ordType = "lunch";
        else if (currentHour >= 17 && currentHour < 23) ordType = "dinner";

        try {
          const scheduleRef = doc(db, `kitchens/${item.kitchenName}/weeklySchedule`, today);
          const scheduleSnap = await getDoc(scheduleRef);
          if (scheduleSnap.exists()) {
            const scheduleData = scheduleSnap.data();
            const mealArray = scheduleData[ordType];
            if (Array.isArray(mealArray)) {
              const foundDish = mealArray.find(
                d => d.dishName && d.dishName.toLowerCase() === item.dishName.toLowerCase()
              );
              if (foundDish) {
                const quantity = Number(foundDish.quantity) || 0;
                const sold = Number(foundDish.sold) || 0;
                qMap[`${item.kitchenName}:${item.dishName}`] = Math.max(quantity - sold, 0);
              }
            }
          }
        } catch (e) {
          // fallback
          qMap[`${item.kitchenName}:${item.dishName}`] = null;
        }
      }
      setQuantities(qMap);
    }
    if (open) fetchAllQuantities();
  }, [cartStore.cart, open]);

  function handleOpen() {
    setOpen(!open);
  }

  function handleCounter(kitchenName, dishName, price, value) {
    const currentQuantity = cartStore.getQuantity(kitchenName, dishName);
    const newQuantity = currentQuantity + value;

    if (newQuantity <= 0) {
      cartStore.removeFromCart(kitchenName, dishName);
    } else {
      cartStore.addToCart({
        orderId: cartStore.orderId,
        category: cartStore.cart.find(item => item.dishName === dishName)?.category || "",
        kitchenName,
        dishName,
        price,
        quantity: value
      });
    }
  }

  async function handleOrder() {
    if (cartStore.cart.length === 0) return;

    try {
      const userUID = auth.currentUser?.uid;
      if (!userUID) {
        console.error("User not authenticated");
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", userUID));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("User document not found");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userPhoneNumber = userDoc.id;
      const userDocRef = doc(usersRef, userPhoneNumber);

      const orderId = moment().format("YYYYMMDDHHmmss");
      const orderRef = doc(collection(userDocRef, "orders"), orderId);

      const orderDetails = {
        category: [...new Set(cartStore.cart.map((item) => item.category))][0],
        totalQuantity: cartStore.cart.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cartStore.cart.reduce((total, item) => total + item.quantity * item.price, 0),
      };

      const kitchenOrders = {};

      cartStore.cart.forEach((item) => {
        if (!kitchenOrders[item.kitchenName]) {
          kitchenOrders[item.kitchenName] = {
            items: [],
            totalKitchenPrice: 0,
            totalQuantity: 0, // Track total quantity for this kitchen
            status: "Yet to Accept",
          };
        }
        kitchenOrders[item.kitchenName].items.push({
          dishName: item.dishName,
          quantity: item.quantity,
          price: item.price
        });
        kitchenOrders[item.kitchenName].totalQuantity += item.quantity;
        kitchenOrders[item.kitchenName].totalKitchenPrice += item.quantity * item.price;
      });

      Object.keys(kitchenOrders).forEach((kitchenName) => {
        orderDetails[kitchenName] = kitchenOrders[kitchenName];
      });

      await setDoc(orderRef, orderDetails);
      console.log("Order placed successfully in user's collection");

      // Store order in each kitchen's document
      const kitchensRef = collection(db, "kitchens");
      const userName = userDoc.data().name;
      const phoneNumber = userDoc.data().phone;

      for (const [kitchenName, order] of Object.entries(kitchenOrders)) {
        const kitchenDocRef = doc(kitchensRef, kitchenName);
        const kitchenOrderRef = doc(collection(kitchenDocRef, "orders"), orderId);

        const kitchenOrderDetails = {
          category: orderDetails.category,
          totalQuantity: order.totalQuantity,
          totalPrice: order.totalKitchenPrice,
          status: "Yet to Accept",
          items: order.items,
          orderBy: userName,
          userNumber: phoneNumber // Add user's name
        };

        await setDoc(kitchenOrderRef, kitchenOrderDetails);
        console.log(`Order added to ${kitchenName} collection`);
      }

      cartStore.clearCart();
      handleOpen();
      Alert.alert("Order Placed!", "Your order has been successfully placed."); // Show alert after order is placed
    } catch (error) {
      console.error("Error placing order:", error);
    }
  }

  const groupedByKitchen = cartStore.cart.reduce((acc, item) => {
    if (!acc[item.kitchenName]) {
      acc[item.kitchenName] = [];
    }
    acc[item.kitchenName].push(item);
    return acc;
  }, {});

  return (
    <>
      <View className="absolute bg-nonveg right-2 top-[70%] p-3 rounded-full shadow-lg shadow-black">
        <TouchableOpacity onPress={handleOpen}>
          <ShoppingCartIcon size={20} color="#FEFDED" />
          <Text className="absolute -right-4 -top-4 py-0.5 px-2 bg-veg rounded-full font-semibold text-primary">
            {cartStore.totalItems}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={open}>
        <View className="bg-primary mx-10 mt-40 rounded-xl p-2 h-[55%] shadow-lg shadow-black">
          <View className="m-5 flex-row items-center justify-between">
            <Text className="text-3xl font-bold font-serif text-maroon">Your Plate</Text>
            <TouchableOpacity onPress={handleOpen}>
              <XMarkIcon size={20} color="#C70039" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView className="mx-5 mb-4">
            {Object.entries(groupedByKitchen).sort().map(([kitchenName, items]) => (
              <View key={kitchenName} className="mb-4">
                <Text className="text-lg font-bold text-maroon">{kitchenName}</Text>
                <View className="p-1 mb-2 border-b-2 border-nonveg"></View>
                {items.map((item, index) => (
                  <View key={index} className="flex-row justify-between items-center">
                    <Text className="my-1 font-semibold">
                      {item.dishName} x {item.quantity}
                    </Text>
                    <Text className="text-maroon font-bold">₹ {item.quantity * item.price}</Text>
                    <View className="flex-row items-center">
                      <TouchableOpacity onPress={() => handleCounter(item.kitchenName, item.dishName, item.price, -1)}>
                        <Text className="bg-secondary rounded-full h-8 w-8 text-center text-lg font-bold">-</Text>
                      </TouchableOpacity>
                      <Text className="text-lg mx-2">{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleCounter(item.kitchenName, item.dishName, item.price, 1)}
                        disabled={
                          quantities[`${item.kitchenName}:${item.dishName}`] !== undefined &&
                          item.quantity >= quantities[`${item.kitchenName}:${item.dishName}`]
                        }
                      >
                        <Text className="bg-secondary rounded-full h-8 w-8 text-center text-lg font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <View className="flex-row justify-between border-t-2 border-nonveg items-center mt-2 mb-4">
            <Text className="text-lg mt-2 mx-2 font-bold text-green">Total Items:</Text>
            <Text className="mx-6 font-bold">{cartStore.totalItems}</Text>
          </View>

          <View className="p-4 bg-secondary rounded-lg shadow-lg shadow-black flex-row justify-between mx-10 mb-4">
            <TouchableOpacity onPress={handleOrder}>
              <View className="flex-row justify-between w-full">
                <Text className="text-lg font-bold">Proceed to Pay</Text>
                <Text className="text-lg font-bold">
                  ₹{cartStore.cart.reduce((total, item) => total + item.quantity * item.price, 0)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
});


export default Basket;