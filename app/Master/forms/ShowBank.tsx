import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

type Bank = {
  id: number;
  bankName: string;
  openingBalance: string; // keep consistent with DB column
};

const ShowBank = ({ refreshList }) => {
  const [banklists, setbankLists] = useState();

  const db = useSQLiteContext();

  const loadbank = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM Bank");
      setbankLists(result);
    } catch (error) {
      console.log("Failed to load bank");
    }
  };

  useEffect(() => {
    loadbank();
  }, [refreshList]);

  return (
    <FlatList
      className='p-2 shadow-lm'
      data={banklists}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item }) => (
        //  <View>
        //    <Text>Bank Name :{item.bankName} , Opening Balance : {item.openingBalance}</Text>
        //  </View>
        <View className='bg-white rounded-2xl p-5 mx-4 my-2 shadow-md border border-gray-100 mt-3'>
          {/* Bank Name */}
          <Text className='text-lg font-semibold text-gray-800 mb-3'>
            {item.bankName}
          </Text>

          {/* Opening Balance */}
          <View className='flex-row justify-between items-center'>
            <Text className='text-sm text-gray-500'>
              Opening Balance : ₹ {item.OpeningBalance}
            </Text>

            {/* <Text
              className={`text-base font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹ {item.openingBalance}
            </Text> */}
          </View>
        </View>
      )}
    />
  );
};

export default ShowBank;
