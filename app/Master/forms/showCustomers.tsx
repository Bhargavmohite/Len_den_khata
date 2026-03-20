import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

// ✅ Proper type
type Customer = {
  id: number;
  customerName: string;
  MBCountryCode: string;
  mobileNumber: string;
  email: string;
  creditLimit: string;
  creditPeriod: string;
};
const showCustomers = () => {
  const { refreshList } = useLocalSearchParams();
  const db = useSQLiteContext();
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [isloading, setIsloading] = useState(true);

  const loadCustomerList = async () => {
    try {
      setIsloading(true);

      const result = await db.getAllAsync<Customer>(
        "SELECT * FROM Customer ORDER BY id DESC",
      );

      setCustomerList(result);
    } catch (e) {
      console.log("Database Error:", e);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    loadCustomerList();
  }, [refreshList]);

  if (isloading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <FlatList
      className='p-2 shadow-lm'
      data={customerList}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item }) => (
        <View className='mx-4 my-2 p-4 bg-white rounded-2xl shadow-sm'>
          {/* Header */}
          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-lg font-bold text-blue-600'>
              🧔 {item.customerName}
            </Text>
            <Text className='text-xs text-gray-400'>ID: {item.id}</Text>
          </View>

          {/* Mobile */}
          <Text className='text-gray-700 mb-1'>
            📞 {item.MBCountryCode} {item.mobileNumber}
          </Text>

          {/* Email */}
          <Text className='text-gray-600 mb-3'>✉️ {item.email}</Text>

          {/* Credit Info */}
          <View className='flex-row justify-between bg-blue-50 p-3 rounded-xl'>
            <View>
              <Text className='text-xs text-blue-500 uppercase font-semibold'>
                Credit Limit
              </Text>
              <Text className='text-base font-bold text-blue-700'>
                ₹{item.creditLimit}
              </Text>
            </View>

            <View className='items-end'>
              <Text className='text-xs text-gray-500 uppercase font-semibold'>
                Period
              </Text>
              <Text className='text-base font-bold text-gray-700'>
                {item.creditPeriod} Days
              </Text>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <View className='items-center py-20'>
          <Text className='text-gray-400'>No customers found</Text>
        </View>
      )}
    />
  );
};

export default showCustomers;
