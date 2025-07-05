import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, CheckIcon } from "react-native-heroicons/solid";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import Constants from "../utils/Constants";

const AccountTabScreen = () => {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [updatedValue, setUpdatedValue] = useState("");
  const Navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleUpdate = async (field) => {
    if (!userData) return;
    try {
      const userDocRef = doc(db, "users", userData.phone);
      const newData = { ...userData, [field]: updatedValue };

      if (field === "phone") {
        await setDoc(doc(db, "users", updatedValue), newData);
        await deleteDoc(userDocRef);
      } else {
        await updateDoc(userDocRef, { [field]: updatedValue });
      }

      setUserData(newData);
      setEditingField(null);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1"
    >
      <View className="m-5">
        {loading ? (
          <ActivityIndicator size="large" color="#C70039" />
        ) : (
          <>
            <Text className="text-3xl mt-4 mb-2 font-bold font-serif text-maroon">
              {userData ? userData.name : "User"}
            </Text>
            <View className="flex-row items-center p-1">
              <Text className="text-lg font-bold">User ID: </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text className="text-orange rounded-xl px-2 py-1 bg-white text-lg font-bold underline">View</Text>
              </TouchableOpacity>
              <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/50">
                  <View className="bg-white p-5 rounded-lg border-2 border-orange">
                    <Text className="text-lg">{userData ? userData.userId : "N/A"}</Text>
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
          </>
        )}
      </View>
      <View className="py-2">
        <TouchableOpacity onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
          <View className="p-3 mx-4 mb-3 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <UserIcon size={20} color="orange" />
              <Text className="font-semibold text-xl ml-5">Account Details</Text>
            </View>
            {isDropdownOpen ? <ChevronUpIcon size={20} color="black" /> : <ChevronDownIcon size={20} color="black" />}
          </View>
        </TouchableOpacity>
        {isDropdownOpen && userData && (
          <View className="p-3 mx-4 bg-white border border-gray rounded-md mb-5">
            {["email", "phone", "address"].map((field) => (
              <View key={field} className="flex-row items-center mb-2">
                {editingField === field ? (
                  <TextInput
                    className="border border-gray p-1 flex-1"
                    value={updatedValue}
                    onChangeText={setUpdatedValue}
                    autoFocus
                  />
                ) : (
                  <Text className="font-semibold flex-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}: {userData[field]}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (editingField === field) {
                      handleUpdate(field);
                    } else {
                      setEditingField(field);
                      setUpdatedValue(userData[field]);
                    }
                  }}
                  className="ml-2"
                >
                  {editingField === field ? (
                    <CheckIcon size={20} color="green" />
                  ) : (
                    <PencilIcon size={20} color="orange" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity>
          <View className="p-3 mx-4 mb-3 flex-row">
            <MaterialIcons name="settings" size={20} color="orange" />
            <Text className="font-semibold text-xl ml-5">Settings</Text>
          </View>
        </TouchableOpacity>

        {userData?.role === Constants.ROLE_SUPER_ADMIN && (
          <TouchableOpacity onPress={() => Navigation.navigate("ChefList")}>
            <View className="p-3 mx-4 mb-3 flex-row">
              <MaterialCommunityIcons name="chef-hat" size={20} color="orange" />
              <Text className="font-semibold text-xl ml-5">Chef List</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => Navigation.navigate("UserRegister")}>
          <View className="p-3 mx-4 mb-3 flex-row">
            <MaterialIcons name="power-settings-new" size={20} color="orange" />
            <Text className="font-semibold text-xl ml-5">Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AccountTabScreen;
