import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import ShowBank from "./forms/ShowBank";

type banks = {
  bank: string;
};
const BankMaster = () => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({
    bankName: "",
    OpeningBalance: 0,
  });

  const [refreshList, setRefreshList] = useState(false);

  const handlesubmit = async () => {
    try {
      if (!form.bankName) {
        Alert.alert("Oops ", "All fields Required..");
        return;
      }
      const existsingCustomer = await db.getFirstAsync<banks>(
        `SELECT * FROM Bank WHERE Lower(bankName) = ?;`,
        [form.bankName.toLowerCase()],
      );

      if (existsingCustomer) {
        Alert.alert("Customer already exists, please Enter New name again");
        return;
      }

      await db.runAsync(
        `INSERT INTO Bank(bankName,OpeningBalance) VALUES(?,?)`,
        [form.bankName, form.OpeningBalance],
      );

      Alert.alert("Success", "Bank Name is Saved");

      setRefreshList((prevs) => !prevs);

      setForm({
        bankName: "",
        OpeningBalance: 0,
      });
    } catch (error) {
      console.log("Error :", error);
    }
  };

  return (
    <View className='p-4'>
      {/* Forms */}
      <View className='w-full max-w-md self-center space-y-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-8'>
        <View className='w-full'>
          <Text className='text-base font-medium pb-2 text-black dark:text-gray-300 mt-2'>
            Bank Name
          </Text>
          <TextInput
            placeholder='Enter Your Bank full name'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            placeholderTextColor='#617589'
            value={form.bankName}
            onChangeText={(text) => {
              setForm({ ...form, bankName: text });
            }}
          />
        </View>
        <View className='w-full'>
          <Text className='text-base font-medium pb-2 text-black dark:text-gray-300 mt-2'>
            Opening Balance
          </Text>
          <TextInput
            placeholder='Enter Opening Balance'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            placeholderTextColor='#617589'
            keyboardType='numeric'
            value={form.OpeningBalance.toString()}
            onChangeText={(text) => {
              setForm({
                ...form,
                OpeningBalance: text === "" ? 0 : Number(text),
              });
            }}
          />
        </View>
      </View>
      {/* Buttons */}
      <View className='p-5  flex-row justify-center '>
        <Button title='Submit' onPress={handlesubmit} />
      </View>

      <View>
        <ShowBank refreshList={refreshList} />
      </View>
    </View>
  );
};

export default BankMaster;
