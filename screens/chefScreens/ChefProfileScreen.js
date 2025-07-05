import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { View, Text, Button, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { app, auth } from "../../firebaseConfig";
import {
  MinusIcon,
  PlusIcon,
  StarIcon,
} from "react-native-heroicons/solid";
import ProfileSubComponents from "../../components/chefComponents/ProfileSubComponents";
import FABNav from "../../components/chefComponents/FABNav";

const ChefProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const Navigation = useNavigation();
  const [ownerName, setOwnerName] = useState(null);
  const [kitchenName, setKitchenName] = useState(null);
  const [fssaiNumber, setfssaiNumber] = useState(null);
  const [address, setAddress] = useState(null);
  const [chefID, setChefID] = useState(null)
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = auth.currentUser; // Get authenticated user
        if (!user) {
          console.error("No user is logged in");
          return;
        }

        const db = getFirestore(app);
        const kitchensRef = collection(db, "kitchens");
        const q = query(kitchensRef, where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const kitchenData = querySnapshot.docs[0].data();
            setOwnerName(kitchenData.name);
            setKitchenName(kitchenData.kitchenName);
            setAddress(kitchenData.address);
            setChefID(kitchenData.userId)
            setfssaiNumber(kitchenData.fssaiNumber)
          } else {
            console.log("No kitchen found for this user!");
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching kitchen owner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-white flex-1"
    >
      <View className="m-5 flex-row justify-between border-b border-gray">
        <View className="flex-column">
          <View className="flex-row items-center p-1">
            <Text className="text-lg">Chef ID: </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-orange rounded-xl px-2 py-1 bg-yellow text-lg">View</Text>
            </TouchableOpacity>
            <Modal visible={modalVisible} transparent animationType="slide">
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white p-5 rounded-lg border-2 border-orange">
                  <Text className="text-lg">{chefID||"ChefID"}</Text>
                  <TouchableOpacity
                    className="mt-2 bg-yellow px-2 py-1 rounded-lg"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-orange bg-yellow text-center p-1">Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          <View>
            <Text className="text-xl">
              Name: {loading ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <Text className="text-yellow">{ownerName || "Owner"}</Text>
              )}
            </Text>
          </View>
        </View>
        <View className="items-center p-2 border-l border-l-gray pl-10">
          <Text>
            Orders: <Text className="text-yellow">1234</Text>
          </Text>
          <Text className="flex-row justify-center">
            Rating: {""}
            <Text className="text-yellow ">
              4.5
              <StarIcon name="star" color="orange" size={12} />
            </Text>
          </Text>
        </View>
      </View>

      <ProfileSubComponents
        title="FSSAI Number:"
        desc={fssaiNumber}
        field="fssaiNumber"
      />
      <ProfileSubComponents
        title="Kitchen Name:"
        desc={kitchenName}
        button="Edit"
        field="kitchenName"
      />
      <ProfileSubComponents
        title="Address:"
        desc={address}
        button="Edit"
        field="address"
      />
      <ProfileSubComponents
        title="Main Menu"
        desc="All the dishes you can make"
        button="View"
      />
      <ProfileSubComponents
        title="Weekly Menu"
        desc="Your weekly schedule"
        button="View"
      />
      <ProfileSubComponents
        title="Subscribers:"
        desc="View all your subscribers  "
        button="View"
      />
      <ProfileSubComponents
        title="Products:"
        desc="5"
        button="View"
      />
      <ProfileSubComponents
        title="Income:"
        desc="123456 Rs"
        button="View"
      />
      <FABNav />
    </View>
  );
};

export default ChefProfileScreen;