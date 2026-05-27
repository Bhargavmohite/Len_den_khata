import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const ShowSupplers = () => {
  const { refresh } = useLocalSearchParams();
  const [supplyList, setSupplyList] = useState<any[]>([]);
  const [isloading, setIsloading] = useState(false);
  const db = useSQLiteContext();

  const loadSupplier = async () => {
    try {
      setIsloading(true);
      const result = await db.getAllAsync("SELECT * FROM Supply");
      setSupplyList(result);
    } catch (error) {
      console.log("Database Error :", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    loadSupplier();
  }, [refresh]);

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
      data={supplyList}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item }) => (
        <View className='mx-4 my-2 p-4 bg-white rounded-2xl shadow-sm'>

          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-lg font-bold text-blue-600'>
              🧔 {String(item.supplyName ?? "")}
            </Text>
            <Text className='text-xs text-gray-400'>
              ID: {String(item.id ?? "")}
            </Text>

          </View>


          <Text className='text-gray-700 mb-1'>
            📞 {String(item.MBCountryCode ?? "")}{" "}
            {String(item.mobileNumber ?? "")}
          </Text>

          <Text className='text-gray-600 mb-3'>
            ✉️ {String(item.email ?? "")}
          </Text>







          <View className='flex-row justify-between bg-blue-50 p-3 rounded-xl'>
            <View>
              <Text className='text-xs text-blue-500 uppercase font-semibold'>
                Credit Limit
              </Text>
              <Text className='text-base font-bold text-blue-700'>
                ₹{String(item.creditLimit ?? "")}
              </Text>
            </View>

            <View className='items-end'>
              <Text className='text-xs text-gray-500 uppercase font-semibold'>
                Period
              </Text>
              <Text className='text-base font-bold text-gray-700'>
                {String(item.creditPeriod ?? "")} Days
              </Text>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <View className='items-center py-20'>
          <Text className='text-gray-400'>No Suppliers found</Text>
        </View>
      )}
    />
  );
};

export default ShowSupplers;
