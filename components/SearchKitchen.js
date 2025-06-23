import { View, TextInput, Modal, Pressable, ScrollView, TouchableOpacity, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon } from 'react-native-heroicons/solid';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import Basket from './Basket';
import KitchenFoodDisplay from './KitchenFoodDisplay';

const SearchKitchen = ({ visible, onClose, placeholder }) => {
  const [searchText, setSearchText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [kitchenDetails, setKitchenDetails] = useState(null);
  const [dishesByCategory, setDishesByCategory] = useState({ breakfast: [], lunch: [], dinner: [] });

  const today = moment().format('dddd');
  const currentHour = moment().hour();

  const categoryTimeMap = {
    breakfast: currentHour >= 6 && currentHour < 12,
    lunch: currentHour >= 12 && currentHour < 17,
    dinner: currentHour >= 17 && currentHour < 23,
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const kitchenRef = doc(db, 'kitchens', searchText);
      const kitchenSnap = await getDoc(kitchenRef);

      if (kitchenSnap.exists()) {

        setKitchenDetails(kitchenSnap.data());

        const scheduleRef = doc(db, 'kitchens', searchText, 'weeklySchedule', today);
        const scheduleSnap = await getDoc(scheduleRef);

        if (scheduleSnap.exists()) {

          const scheduleData = scheduleSnap.data();
          const newDishesByCategory = { breakfast: [], lunch: [], dinner: [] };

          for (const category of ['breakfast', 'lunch', 'dinner']) {
            if (!categoryTimeMap[category]) continue;

            const dishNames = scheduleData[category] || [];
            const detailedDishes = [];

            for (const item of dishNames) {
              const menuRef = doc(db, 'kitchens', searchText, 'menu', item.dishName);
              const menuSnap = await getDoc(menuRef);

              if (menuSnap.exists()) {
                detailedDishes.push({
                  ...menuSnap.data(),
                  name: item.dishName,
                  kname: searchText,
                  category,
                });
              }
            }

            newDishesByCategory[category] = detailedDishes;
          }

          setDishesByCategory(newDishesByCategory);
        } else {
          setDishesByCategory({ breakfast: [], lunch: [], dinner: [] });
        }
      } else {
        setKitchenDetails(null);
        setDishesByCategory({ breakfast: [], lunch: [], dinner: [] });
      }
    } catch (error) {
      console.error('Error fetching kitchen or menu:', error);
    }
  };

  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setSubmitted(false);
      setKitchenDetails(null);
      setDishesByCategory({ breakfast: [], lunch: [], dinner: [] });
    }
  }, [visible]);

  const renderDishList = (title, dishes) => (
    <View className="mb-6">
      <Text className="text-xl font-bold text-orange mb-2">{title}</Text>
      {dishes.length > 0 ? (
        dishes.map((dish, idx) => (
          <KitchenFoodDisplay
            key={`${title}-${idx}`}
            name={dish.name}
            kname={dish.kname}
            category={dish.category}
          />
        ))
      ) : (
        <Text className="text-gray-500 ml-2">No dishes available</Text>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-primary px-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center mb-5 mt-5">
            <Pressable onPress={onClose}>
              <XMarkIcon size={28} color="red" />
            </Pressable>
          </View>

          <View className="flex-row bg-primary rounded-xl p-3 shadow-lg shadow-maroon items-center">
            <MagnifyingGlassIcon size={30} color="#FF7400" />
            <TextInput
              autoFocus
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setSubmitted(false);
              }}
              placeholder={placeholder}
              className="ml-2 font-semibold text-lg flex-1 text-orange"
              placeholderTextColor="#FF7400"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleSubmit}>
                <CheckIcon size={26} color="green" />
              </TouchableOpacity>
            )}
          </View>

          {submitted && kitchenDetails && (
            <>
              <Text className="text-xl font-bold text-orange mt-6">Kitchen Details</Text>
              <Text className="text-base text-black font-semibold">Location: {kitchenDetails.address}</Text>
              <Text className="text-base text-black font-semibold mb-4">Phone: {kitchenDetails.phone}</Text>

              {categoryTimeMap.breakfast && renderDishList('Breakfast', dishesByCategory.breakfast)}
              {categoryTimeMap.lunch && renderDishList('Lunch', dishesByCategory.lunch)}
              {categoryTimeMap.dinner && renderDishList('Dinner', dishesByCategory.dinner)}
            </>
          )}

          {submitted && !kitchenDetails && (
            <Text className="text-black mt-6 text-center font-semibold">Kitchen not found.</Text>
          )}

          <View className="mt-5 mb-20">
            <Basket />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SearchKitchen;