import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Supplier = {
  id: number;
  supplyName: string;
  MBCountryCode: string;
  mobileNumber: string;
  email: string;
  creditLimit: string;
  creditPeriod: string;
};

const SupplyMaster = () => {
  const db = useSQLiteContext();

  const [form, setForm] = useState({
    supplyName: "",
    MBCountryCode: "+91",
    mobileNumber: "",
    email: "",
    creditLimit: "",
    creditPeriod: "",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [supplierLists, setSupplierLists] = useState<Supplier[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [refreshList, setRefreshList] = useState(false);

  // ✅ Load suppliers
  const loadSupplies = async () => {
    try {
      const result = await db.getAllAsync<Supplier>("SELECT * FROM Supply");
      setSupplierLists(result);
    } catch (error) {
      console.log("Failed to load Suppliers", error);
    }
  };

  useEffect(() => {
    loadSupplies();
  }, [refreshList]);

  // ✅ Submit
  const handleSubmit = async () => {
    if (
      !form.supplyName ||
      !form.mobileNumber ||
      !form.email ||
      !form.creditLimit ||
      !form.creditPeriod
    ) {
      Alert.alert("All fields required");
      return;
    }

    try {
      const existing = await db.getFirstAsync<Supplier>(
        `SELECT * FROM Supply WHERE LOWER(supplyName) = ?`,
        [form.supplyName.toLowerCase()],
      );

      if (existing) {
        Alert.alert("Supplier already exists");
        return;
      }

      await db.runAsync(
        `INSERT INTO Supply 
        (supplyName, MBCountryCode, mobileNumber, email, creditLimit, creditPeriod)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          form.supplyName,
          form.MBCountryCode,
          form.mobileNumber,
          form.email,
          form.creditLimit,
          form.creditPeriod,
        ],
      );

      Alert.alert("Success", "Supplier added");

      setForm({
        supplyName: "",
        MBCountryCode: "+91",
        mobileNumber: "",
        email: "",
        creditLimit: "",
        creditPeriod: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Update
  const handleUpdate = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Select supplier first");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE Supply SET 
          supplyName=?, 
          MBCountryCode=?, 
          mobileNumber=?, 
          email=?, 
          creditLimit=?, 
          creditPeriod=? 
        WHERE id=?`,
        [
          form.supplyName,
          form.MBCountryCode,
          form.mobileNumber,
          form.email,
          form.creditLimit,
          form.creditPeriod,
          selectedCustomerId,
        ],
      );

      Alert.alert("Updated successfully");
      setIsModalVisible(false);
      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView className='flex-1 px-4 py-4'>
      <View className='bg-white p-4 rounded-xl gap-2'>
        {/* Supplier Name */}
        <Text>Supplier Name</Text>
        <TextInput
          className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          placeholder='Supplier Name'
          value={form.supplyName}
          onChangeText={(text) => setForm({ ...form, supplyName: text })}
        />

        {/* Mobile */}
        <Text>Mobile</Text>
        <View className='flex-row gap-2 mb-3'>
          <TextInput
            className='w-16 h-14 rounded-lg border border-[#dbe0e6] bg-white text-center'
            value={form.MBCountryCode}
            onChangeText={(t) => setForm({ ...form, MBCountryCode: t })}
          />
          <TextInput
            className='flex-1 h-14 rounded-lg border border-[#dbe0e6] bg-white px-4'
            placeholder='Mobile Number'
            keyboardType='phone-pad'
            value={form.mobileNumber}
            onChangeText={(t) =>
              setForm({
                ...form,
                mobileNumber: t.replace(/\D/g, "").slice(0, 10),
              })
            }
          />
        </View>

        {/* Email */}
        <Text>Email</Text>
        <TextInput
          className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          placeholder='Enter your Email'
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
        />

        {/* Credit */}
        <Text>Credit Limit</Text>
        <TextInput
          className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          placeholder='Credit Limit'
          value={form.creditLimit}
          onChangeText={(t) => setForm({ ...form, creditLimit: t })}
        />

        <Text>Credit Period</Text>
        <TextInput
          className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          placeholder='Credit Period'
          value={form.creditPeriod}
          onChangeText={(t) => setForm({ ...form, creditPeriod: t })}
        />
      </View>
      {/* Buttons */}
      <View className='flex-row gap-3 justify-center mt-4'>
        <Button title='Submit' onPress={handleSubmit} />

        <Button
          title='Modify'
          onPress={() => {
            loadSupplies();
            setIsModalVisible(true);
          }}
        />
      </View>

      {/* Modal */}
      {/* Modify MOdal */}
      <View>
        <Modal
          visible={isModalVisible}
          transparent
          animationType='fade'
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className='flex-1 justify-center items-center bg-black/40'>
            <View className='w-[90%] rounded-xl bg-white p-5 dark:bg-gray-800'>
              <Text className='text-lg font-semibold text-black dark:text-white mb-4'>
                Modify Supplier
              </Text>

              {/* Customer Name Dropdown */}
              <Text className='mb-2 text-black dark:text-white'>
                Supplier Name
              </Text>

              <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                <Picker
                  selectedValue={selectedCustomerId}
                  onValueChange={(id) => {
                    if (!id) return;

                    const customer = supplierLists.find(
                      (c) => Number(c.id) === Number(id),
                    );

                    if (!customer) return;

                    setSelectedCustomerId(Number(id));
                    setForm({
                      supplyName: String(customer.supplyName),
                      MBCountryCode: customer.MBCountryCode || "+91",
                      mobileNumber: String(customer.mobileNumber),
                      email: customer.email,
                      creditLimit: String(customer.creditLimit),
                      creditPeriod: String(customer.creditPeriod),
                    });
                  }}
                >
                  <Picker.Item label='Select Customer' value={null} />
                  {supplierLists.map((customer) => (
                    <Picker.Item
                      key={customer.id}
                      label={customer.supplyName}
                      value={customer.id}
                    />
                  ))}
                </Picker>
              </View>

              <Text className='mb-2 text-black dark:text-white'>
                Edited Forms
              </Text>
              {/* Email */}
              <TextInput
                placeholder='Email'
                keyboardType='email-address'
                className='h-14 mb-3 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                value={form.supplyName}
                onChangeText={(text) => setForm({ ...form, supplyName: text })}
              />

              {/* Mobile Number */}
              <View className='flex-row gap-2'>
                <TextInput
                  className='w-16 h-12 border rounded-lg text-center'
                  value={form.MBCountryCode}
                  onChangeText={(t) => setForm({ ...form, MBCountryCode: t })}
                />

                <TextInput
                  className='flex-1 h-12 border rounded-lg px-4'
                  keyboardType='phone-pad'
                  value={form.mobileNumber}
                  onChangeText={(t) =>
                    setForm({
                      ...form,
                      mobileNumber: t.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                />
              </View>

              {/* Email */}
              <TextInput
                placeholder='Email'
                keyboardType='email-address'
                className='h-14 mb-3 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
              />

              {/* Credit Limit */}
              <TextInput
                placeholder='Credit Limit'
                keyboardType='numeric'
                className='h-14 mb-3 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                value={form.creditLimit}
                onChangeText={(text) => setForm({ ...form, creditLimit: text })}
              />

              {/* Credit Period */}
              <TextInput
                placeholder='Credit Period (Days)'
                keyboardType='numeric'
                className='h-14 mb-4 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                value={form.creditPeriod}
                onChangeText={(text) =>
                  setForm({ ...form, creditPeriod: text })
                }
              />

              <View className='flex-row justify-between'>
                <Button title='Update' onPress={handleUpdate} />
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Navigate */}
      <View className='flex items-center bg-white dark:bg-gray-800/50 rounded-xl p-4 w-[85%] relative left-8 top-[2rem]'>
        <Link
          href={{
            pathname: "/Master/forms/showSupplers",
            params: { refresh: refreshList ? "1" : "0" },
          }}
        >
          <Text className='text-center mt-5'>Show Supplier</Text>
        </Link>
      </View>
    </ScrollView>
  );
};

export default SupplyMaster;
