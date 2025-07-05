import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../firebaseConfig'; // adjust path if needed
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const ChefList = () => {
    const [kitchens, setKitchens] = useState([]);
    const [selectedKitchen, setSelectedKitchen] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Edit fields
    const [kitchenName, setKitchenName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('');
    const [fssaiNumber, setFssaiNumber] = useState('');

    useEffect(() => {
        fetchKitchens();
    }, []);

    const fetchKitchens = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'kitchens'));
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setKitchens(data);
        } catch (error) {
            console.error('Error fetching kitchens:', error);
        }
    };

    const handlePhoneChange = (text) => {
        if (!text.startsWith('+91')) {
            text = '+91' + text.replace(/^\+?91/, '');
        }
        setPhone(text);
    };

    const openEditModal = (kitchen) => {
        setSelectedKitchen(kitchen);
        setKitchenName(kitchen.kitchenName || '');
        setName(kitchen.name || '');
        setEmail(kitchen.email || '');
        setAddress(kitchen.address || '');
        setPhone(kitchen.phone || '');
        setStatus(kitchen.status || 'Active');
        setFssaiNumber(kitchen.fssaiNumber || '');
        setIsModalVisible(true);
    };

    const saveChanges = async () => {
        if (!selectedKitchen) return;

        if (!kitchenName || !email || !phone) {
            Alert.alert('Missing Fields', 'Please fill all required fields.');
            return;
        }

        try {
            const docRef = doc(db, 'kitchens', selectedKitchen.id);
            await updateDoc(docRef, {
                kitchenName,
                name,
                email,
                address,
                phone,
                status,
                fssaiNumber,
            });
            Alert.alert('Success', 'Kitchen updated successfully!');
            setIsModalVisible(false);
            fetchKitchens();
        } catch (error) {
            console.error('Error updating kitchen:', error);
            Alert.alert('Error', 'Something went wrong while saving.');
        }
    };

    return (
        <View className="flex-1 bg-gray-100 pt-6 mt-5">
            <ScrollView>
                <Text className="text-xl font-bold mb-4 mx-4 mt-5">Kitchen List</Text>

                {kitchens.map((kitchen) => (
                    <View
                        key={kitchen.id}
                        className="bg-white p-4 mx-4 mb-3 rounded-md shadow flex-row justify-between items-center"
                    >
                        <View>
                            <Text className="text-lg font-semibold">{kitchen.kitchenName}</Text>
                            <Text className="text-sm text-gray-600">{kitchen.email}</Text>
                            <Text
                                className={`text-sm mt-1 ${kitchen.status === 'Active'
                                    ? 'text-green-600'
                                    : kitchen.status === 'Inactive'
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                {kitchen.status}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => openEditModal(kitchen)}>
                            <MaterialIcons name="edit" size={24} color="orange" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40">
                    <View className="bg-white w-11/12 rounded-lg p-6 shadow-lg">
                        <Text className="text-lg font-bold mb-4">Edit Kitchen</Text>

                        {/* Kitchen Name */}
                        <Text className="mb-1">
                            Kitchen Name <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="border p-3 mb-3 rounded"
                            value={kitchenName}
                            onChangeText={setKitchenName}
                            placeholder="Enter kitchen name"
                        />

                        {/* Contact Person Name */}
                        <Text className="mb-1">Contact Person Name</Text>
                        <TextInput
                            className="border p-3 mb-3 rounded"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter contact person name"
                        />

                        {/* Email */}
                        <Text className="mb-1">
                            Email <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="border p-3 mb-3 rounded"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter email"
                            keyboardType="email-address"
                        />

                        {/* Address */}
                        <Text className="mb-1">Address</Text>
                        <TextInput
                            className="border p-3 mb-3 rounded h-24 text-top"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Enter address"
                            multiline
                        />

                        {/* Phone */}
                        <Text className="mb-1">
                            Phone Number <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="border p-3 mb-3 rounded"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            placeholder="e.g. +91XXXXXXXXXX"
                        />

                        {/* Status */}
                        <Text className="mb-1 text-base">Status</Text>
                        <View className="flex-row mb-4">
                            {['Active' , 'Disabled', 'Pending Approval'].map((s, i) => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setStatus(s)}
                                    style={{
                                        paddingVertical: 6,
                                        paddingHorizontal: 10,
                                        borderRadius: 6,
                                        backgroundColor: status === s ? 'orange' : '#e5e7eb',
                                        marginRight: i !== 2 ? 8 : 0,
                                    }}
                                >
                                    <Text style={{ color: status === s ? 'white' : 'black' }}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* FSSAI Number */}
                        <Text className="mb-1">FSSAI Number</Text>
                        <TextInput
                            className="border p-3 mb-4 rounded"
                            value={fssaiNumber}
                            onChangeText={setFssaiNumber}
                            placeholder="Enter FSSAI Number"
                        />

                        {/* Action Buttons */}
                        <View className="flex-row justify-end space-x-4">
                            <Pressable onPress={() => setIsModalVisible(false)}>
                                <Text style={{ color: 'red', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={saveChanges}>
                                <Text style={{ color: 'green', fontSize: 16, fontWeight: '600' }} className="px-3">
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ChefList;
