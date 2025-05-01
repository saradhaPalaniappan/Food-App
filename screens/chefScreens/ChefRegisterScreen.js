import { View, Text, TextInput, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Checkbox, IconButton } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import Constants from "../../utils/Constants";

const ChefRegisterScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isSignUp, setIsSignUp] = useState(false);
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kitchenName, setKitchenName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleAuth = async () => {
    if (isSignUp && (!name || !phone || !kitchenName || !address || !email || !password)) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "kitchens", kitchenName), {
          name,
          phone,
          kitchenName,
          address,
          email,
          userId: user.uid,
          role: Constants.ROLE_FOOD_VENDOR
        });
        Alert.alert("Success", "Registration Successful!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", "Login Successful!");
      }
      setEmail('')
      setPassword('')
      setName('')
      setPhone('')
      setKitchenName('')
      setAddress('')
      navigation.navigate("ChefLandingScreen");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} 
      className={`bg-white flex-1 items-center ${isSignUp ? "" : "mt-20"}`}>
        <View className="border border-yellow p-10 rounded-xl m-4 mt-10 w-80">
          <Text className="font-bold text-3xl text-orange absolute -top-6 left-10 bg-white">
            Chef {isSignUp ? "Register" : "Login"}
          </Text>
          <ScrollView className="flex-grow-0" showsVerticalScrollIndicator={false}>
            {isSignUp && (
              <>
                <View className="mt-4">
                  <Text className="text-lg ml-2">Owner Name</Text>
                  <TextInput placeholder="Enter your name" className="border border-orange p-2 rounded-lg" value={name} onChangeText={setName} />
                </View>
                <View className="mt-4">
                  <Text className="text-lg ml-2">Phone Number</Text>
                  <TextInput placeholder="Enter your phone number" className="border border-orange p-2 rounded-lg" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                </View>
                <View className="mt-4">
                  <Text className="text-lg ml-2">Kitchen Name</Text>
                  <TextInput placeholder="Enter your kitchen name" className="border border-orange p-2 rounded-lg" value={kitchenName} onChangeText={setKitchenName} />
                </View>
                <View className="mt-4">
                  <Text className="text-lg ml-2">Address</Text>
                  <TextInput placeholder="Enter your address" className="border border-orange p-2 rounded-lg" value={address} onChangeText={setAddress} />
                </View>
              </>
            )}
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
            {isSignUp && (
              <View className="flex-row items-center mt-4">
                <Checkbox status={checked ? "checked" : "unchecked"} onPress={() => setChecked(!checked)} color="orange" uncheckedColor="#FF7400" />
                <Text className="text-yellow">I agree to the terms and conditions.</Text>
              </View>
            )}
            <TouchableOpacity disabled={isSignUp && !checked} onPress={handleAuth}>
              <Text className={isSignUp && !checked ? "border-yellow bg-gray border p-4 rounded-xl text-[gray] text-center" : "bg-yellow p-4 border mt-3 border-orange rounded-xl text-center text-white"}>
                {isSignUp ? "Register" : "Login"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <Text className="mt-2 font-semibold text-lg">
          {isSignUp ? "Already have a Kitchen? " : "Don't have a Kitchen? "}
          <Text className="text-orange underline" onPress={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Login" : "Register"}
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ChefRegisterScreen;