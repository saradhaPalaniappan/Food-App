import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DataTable } from "react-native-paper";
import FABNav from "../../components/chefComponents/FABNav";
import { app, auth, db } from "../../firebaseConfig";
import TodaysMenu from "../../components/chefComponents/TodaysMenu";

const ChefLandingScreen = () => {
  const insets = useSafeAreaInsets();
  const [ownerName, setOwnerName] = useState(null);
  const [kitchenName, setKitchenName] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("No user is logged in");
          return;
        }

        const db = getFirestore(app);
        const kitchensRef = collection(db, "kitchens");
        const q = query(kitchensRef, where("userId", "==", user.uid));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const kitchenDoc = querySnapshot.docs[0]; // Get the kitchen document
          const kitchenData = kitchenDoc.data();
          setOwnerName(kitchenData.name);
          setKitchenName(kitchenData.kitchenName);

          // Fetch orders (just get the first available one)
          const ordersRef = collection(db, `kitchens/${kitchenDoc.id}/orders`);
          const orderSnapshot = await getDocs(ordersRef);

          let totalEarnings = 0;
          orderSnapshot.forEach((doc) => {
            const order = doc.data();
            if (order.status === "Accepted" && order.totalPrice) {
              totalEarnings += Number(order.totalPrice);
            }
          });
          setTotalEarnings(totalEarnings);

          let deliveredCount = 0;
          orderSnapshot.forEach((doc) => {
            const order = doc.data();
            if (order.status === "Accepted") {
              deliveredCount += 1;
            }
          });
          setDeliveredCount(deliveredCount);

          if (!orderSnapshot.empty) {
            const lastDoc = orderSnapshot.docs[orderSnapshot.docs.length - 1];
            setLatestOrder({ id: lastDoc.id, ...lastDoc.data() });
          }
        } else {
          console.log("No kitchen found for this user!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).trim();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-white flex-1"
    >
      <View className="flex-row justify-between m-4 px-5 border-b border-gray">
        <View className="p-4 pr-16 justify-center border-r border-gray">
          <Text className="text-3xl">Hello</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#FFA500" />
          ) : (
            <Text className="text-lg text-yellow font-semibold">
              {ownerName || "Owner"}
            </Text>
          )}
        </View>

        <View className="p-4 justify-center">
          <Text>
            Delivered: <Text className="text-orange font-semibold">{deliveredCount}</Text>
          </Text>
          <Text>
            Earned: <Text className="text-orange font-semibold">{totalEarnings}</Text>
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#FFA500" />
      ) : (
        <Text className="bg-gray p-2 text-center text-xl mx-4 mb-4">
          {kitchenName || "Kitchen"}
        </Text>
      )}
      <Text className="text-orange p-1 text-center text-xl mx-1 mb-2">Our food app is designed to empower home cooks, especially homemakers, by turning their passion for cooking into a source of extra income. It allows them to sell surplus or specially prepared meals directly from their kitchens to local customers. The app handles orders, payments, and customer communication, making the process simple and secure. Cooks can showcase their menus, set availability, and receive feedback to grow their reputation. This not only reduces food waste but also supports financial independence. Whether part-time or daily, the app creates a flexible platform for homemakers to earn while doing what they love—cooking delicious meals.</Text>
      <Text className="text-lg text-center mb-2">Today's Menu ({today})</Text>
      <TodaysMenu />

      {latestOrder && (
        <View className="bg-orange m-5 rounded-xl mb-10 overflow-hidden">
          <Text className="text-lg text-white text-center font-semibold border-b p-4 border-gray bg-yellow">
            On Going Order: {latestOrder.id}
          </Text>
          <View className="p-4 text-white flex-row justify-between">
            <View>
              <Text className="text-gray">
                To: <Text className="text-black">{latestOrder.orderBy}</Text>
              </Text>
              {latestOrder.items?.map((item, index) => (
                <Text key={index} className="text-gray">
                  Menu: <Text className="text-black">{item.dishName} x {item.quantity}</Text>
                </Text>
              ))}
              <Text className="text-gray">
                Meal: <Text className="text-black">{latestOrder.category.charAt(0).toUpperCase() + latestOrder.category.slice(1)}</Text>
              </Text>
            </View>
            <View>
              <Text className="text-gray">
                Number of Items <Text className="text-black">{latestOrder.totalQuantity}</Text>
              </Text>
              <Text className="text-gray">
                Amount Paid: <Text className="text-black">{latestOrder.totalPrice}</Text>
              </Text>
            </View>
          </View>
        </View>
      )}

      <FABNav />
    </View>
  );
};

export default ChefLandingScreen;