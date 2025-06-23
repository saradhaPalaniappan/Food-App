import { View, TextInput, Modal, Pressable, ScrollView, TouchableOpacity, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon } from 'react-native-heroicons/solid';
import Basket from './Basket';
import KitchenFoodDisplay from './KitchenFoodDisplay';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import moment from 'moment';

const SearchFood = ({ visible, onClose, placeholder }) => {
    const [searchText, setSearchText] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [matchedKitchens, setMatchedKitchens] = useState([]);

    const getCurrentCategory = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'breakfast';
        if (hour >= 12 && hour < 17) return 'lunch';
        if (hour >= 17 && hour < 23) return 'dinner';
        return null;
    };

    const today = moment().format('dddd'); // e.g., "Saturday"

    const handleSubmit = async () => {
        setSubmitted(true);
        const querySnapshot = await getDocs(collection(db, 'kitchens'));
        const validKitchens = [];

        for (const kitchenDoc of querySnapshot.docs) {

            const kname = kitchenDoc.data().kitchenName;

            const menuRef = collection(db, 'kitchens', kname, 'menu');
            const menuSnap = await getDocs(menuRef);

            let matchedDish = null;
            menuSnap.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.name?.trim().toLowerCase() === searchText.trim().toLowerCase()) {
                    matchedDish = docSnap.id;
                }
            });

            if (matchedDish) {

                const scheduleRef = doc(db, 'kitchens', kname, 'weeklySchedule', today);

                const scheduleSnap = await getDoc(scheduleRef);

                if (scheduleSnap.exists()) {

                    const category = getCurrentCategory();
                    const meals = scheduleSnap.data()[category];

                    const existsInSchedule = meals?.some(
                        (dish) => dish.dishName?.trim().toLowerCase() === searchText.trim().toLowerCase()
                    );

                    if (existsInSchedule) {
                        validKitchens.push({ kname, name: matchedDish, category });
                    }
                }
            }
        }

        setMatchedKitchens(validKitchens);
    };

    useEffect(() => {
        if (!visible) {
            setSearchText('');
            setSubmitted(false);
            setMatchedKitchens([]);
        }
    }, [visible]);

    const renderSearchInput = () => (
        <View className="flex-row bg-primary rounded-xl p-3 shadow-lg shadow-maroon items-center">
            <MagnifyingGlassIcon size={30} color="#FF7400" />
            <TextInput
                autoFocus
                value={searchText}
                onChangeText={(text) => {
                    setSearchText(text);
                    setSubmitted(false);
                    setMatchedKitchens([]);
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
                    {renderSearchInput()}
                    {submitted && matchedKitchens.length === 0 && (
                        <Text className="text-black mt-6 text-center font-semibold">No kitchens found for this dish right now.</Text>
                    )}
                    {matchedKitchens.map((item, index) => (
                        <KitchenFoodDisplay key={index} kname={item.kname} name={item.name} category={item.category} />
                    ))}
                    <View className="mt-5 mb-20">
                        <Basket />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default SearchFood;