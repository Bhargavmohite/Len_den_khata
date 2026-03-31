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

type Customer = {
  id: number;
  customerName: string;
  MBCountryCode: string;
  mobileNumber: string;
  email: string;
  creditLimit: string;
  creditPeriod: string;
};

const CustomerMaster = () => {
  const db = useSQLiteContext();

  const [form, setForm] = useState({
    customerName: "",
    MBCountryCode: "+91",
    mobileNumber: "",
    email: "",
    creditLimit: "",
    creditPeriod: "",
  });

  const [customerLists, setCustomerLists] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  //   const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [refreshList, setRefreshList] = useState(false);

  // ✅ Load Customers
  const loadCustomers = async () => {
    try {
      const result = await db.getAllAsync<Customer>("SELECT * FROM Customer");
      setCustomerLists(result);
    } catch (error) {
      console.log("Failed to load customers");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [refreshList]);

  // ✅ Submit
  const handleSubmit = async () => {
    try {
      if (
        !form.customerName ||
        !form.mobileNumber ||
        !form.email ||
        !form.creditLimit ||
        !form.creditPeriod
      ) {
        Alert.alert("All fields required");
        return;
      }

      // Email validation
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        Alert.alert("Invalid email");
        return;
      }

      // Duplicate name check
      const exists = await db.getFirstAsync<Customer>(
        `SELECT * FROM Customer WHERE LOWER(TRIM(customerName)) = ?`,
        [form.customerName.trim().toLowerCase()],
      );

      if (exists) {
        Alert.alert("Customer already exists");
        return;
      }

      await db.runAsync(
        `INSERT INTO Customer 
        (customerName, MBCountryCode, mobileNumber, email, creditLimit, creditPeriod) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          form.customerName.trim(),
          form.MBCountryCode,
          form.mobileNumber,
          form.email,
          Number(form.creditLimit),
          Number(form.creditPeriod),
        ],
      );

      Alert.alert("Success", "Customer added successfully");

      setForm({
        customerName: "",
        MBCountryCode: "+91",
        mobileNumber: "",
        email: "",
        creditLimit: "",
        creditPeriod: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log("Insert Error:", error);
    }
  };

  // ✅ Update
  const handleUpdate = async () => {
    if (selectedCustomerId === null) {
      Alert.alert("Select customer first");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE Customer 
         SET customerName=?, MBCountryCode=?, mobileNumber=?, email=?, creditLimit=?, creditPeriod=? 
         WHERE id=?`,
        [
          form.customerName,
          form.MBCountryCode,
          form.mobileNumber,
          form.email,
          Number(form.creditLimit),
          Number(form.creditPeriod),
          selectedCustomerId,
        ],
      );

      Alert.alert("Updated successfully");

      setIsModalVisible1(false);

      setRefreshList((prev) => !prev);

      setForm({
        customerName: "",
        MBCountryCode: "+91",
        mobileNumber: "",
        email: "",
        creditLimit: "",
        creditPeriod: "",
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Update failed");
    }
  };

  return (
    <ScrollView className='flex-1 px-4 py-4'>
      <View className='p-4'>
        {/* FORM */}
        <View className='bg-white p-5 rounded-xl gap-2'>
          <Text>Customer Name</Text>
          <TextInput
            value={form.customerName}
            placeholder='Customer Name'
            onChangeText={(t) => setForm({ ...form, customerName: t })}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          />

          <Text>Mobile</Text>
          <View className='flex-row gap-2'>
            <TextInput
              value={form.MBCountryCode}
              placeholder='code'
              onChangeText={(t) => setForm({ ...form, MBCountryCode: t })}
              className='w-16 h-14 rounded-lg border border-[#dbe0e6] bg-white text-center'
            />
            <TextInput
              value={form.mobileNumber}
              placeholder='Mobile number'
              keyboardType='phone-pad'
              onChangeText={(t) =>
                setForm({
                  ...form,
                  mobileNumber: t.replace(/\D/g, "").slice(0, 10),
                })
              }
              className='flex-1 h-14 rounded-lg border border-[#dbe0e6] bg-white px-4'
            />
          </View>

          <Text>Email</Text>
          <TextInput
            value={form.email}
            placeholder='Email'
            onChangeText={(t) => setForm({ ...form, email: t })}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          />

          <Text>Credit Limit</Text>
          <TextInput
            value={form.creditLimit}
            placeholder='Credit Limit'
            keyboardType='numeric'
            onChangeText={(t) => setForm({ ...form, creditLimit: t })}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          />

          <Text>Credit Period</Text>
          <TextInput
            value={form.creditPeriod}
            placeholder='Credit period'
            keyboardType='numeric'
            onChangeText={(t) => setForm({ ...form, creditPeriod: t })}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
          />
        </View>

        {/* BUTTONS */}
        <View className='flex-row justify-center gap-4 mt-4'>
          <Button title='Submit' onPress={handleSubmit} />
          <Button title='Modify' onPress={() => setIsModalVisible1(true)} />
        </View>

        {/* MODAL */}
        <View>
          <Modal
            visible={isModalVisible1}
            transparent
            animationType='fade'
            onRequestClose={() => setIsModalVisible1(false)}
          >
            <View className='flex-1 justify-center items-center bg-black/40'>
              <View className='w-[90%] rounded-xl bg-white p-5 dark:bg-gray-800'>
                <Text className='text-lg font-semibold text-black dark:text-white mb-4'>
                  Modify Customer
                </Text>

                {/* Customer Name Dropdown */}
                <Text className='mb-2 text-black dark:text-white'>
                  Customer Name
                </Text>

                <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                  <Picker
                    selectedValue={selectedCustomerId}
                    onValueChange={(id) => {
                      if (!id) return;

                      const customer = customerLists.find(
                        (c) => Number(c.id) === Number(id),
                      );

                      if (!customer) return;

                      setSelectedCustomerId(Number(id));
                      setForm({
                        customerName: customer.customerName,
                        MBCountryCode: customer.MBCountryCode || "+91",
                        mobileNumber: String(customer.mobileNumber),
                        email: customer.email,
                        creditLimit: String(customer.creditLimit),
                        creditPeriod: String(customer.creditPeriod),
                      });
                    }}
                  >
                    <Picker.Item label='Select Customer' value={null} />
                    {customerLists.map((customer) => (
                      <Picker.Item
                        key={customer.id}
                        label={customer.customerName}
                        value={customer.id}
                      />
                    ))}
                  </Picker>
                </View>

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
                  onChangeText={(text) =>
                    setForm({ ...form, creditLimit: text })
                  }
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

        {/* NAVIGATION */}
        <View className='mt-6 items-centerflex items-center bg-white dark:bg-gray-800/50 rounded-xl p-4 w-[85%] relative left-8 top-[2rem]'>
          <Link
            href={{
              pathname: "/Master/forms/showCustomers",
              params: {
                refresh: refreshList ? "1" : "0",
              },
            }}
            asChild
          >
            <Text>Show Customers</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default CustomerMaster;
