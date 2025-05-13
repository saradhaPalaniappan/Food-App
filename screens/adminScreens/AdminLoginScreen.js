import { View, Text, TextInput, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { IconButton } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Constants from "../../utils/Constants";

const AdminLoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleAuth = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user document based on UID
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.role !== Constants.ROLE_BACKEND_USER || userData.role !== Constants.ROLE_SUPER_ADMIN) {
          await auth.signOut();
          Alert.alert("Error", "Access denied. Only BACKEND_USER or ADMIN can log in.");
          return;
        }
        Alert.alert("Success", "Login Successful!");
        navigation.navigate("LandingScreen");
      } else {
        await auth.signOut();
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className={`bg-white flex-1 items-center mt-20`}>
        <View className="border border-yellow p-10 rounded-xl m-4 mt-10 w-80">
          <Text className="font-bold text-3xl text-orange absolute -top-6 left-10 bg-white">
            Admin Login
          </Text>
          <ScrollView className="flex-grow-0" showsVerticalScrollIndicator={false}>
            <View className="mt-4">
              <Text className="text-lg ml-2">Email</Text>
              <TextInput placeholder="Enter your email" className="border border-orange p-2 rounded-lg" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>
            <View className="mt-4 relative">
              <Text className="text-lg ml-2">Password</Text>
              <TextInput 
                placeholder="Enter your password" 
                className="border border-orange p-2 rounded-lg pr-10" 
                secureTextEntry={secureText} 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity 
                onPress={() => setSecureText(!secureText)} 
                style={{ position: 'absolute', right: 1, top: '28%' }}
              >
                <IconButton icon={secureText ? "eye-off" : "eye"} color="orange" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleAuth}>
              <Text className="bg-yellow p-4 border mt-3 border-orange rounded-xl text-center text-white">
                Login
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminLoginScreen;