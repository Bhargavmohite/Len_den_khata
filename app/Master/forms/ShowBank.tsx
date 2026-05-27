import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

type Bank = {
  id: number;
  bankName: string;
  OpeningBalance: number;
};

const ShowBank = ({ refreshList }: { refreshList: any }) => {
  const [banklists, setbankLists] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);

  const db = useSQLiteContext();

  const loadbank = async () => {
    try {
      setLoading(true);

      const result = await db.getAllAsync<Bank>("SELECT * FROM Bank");
      setbankLists(result);
    } catch (error) {
      console.log("Failed to load bank");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadbank();
  }, [refreshList]);

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <FlatList
      className='p-2 shadow-lm'
      data={banklists}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item }) => (
        <View className='bg-white rounded-2xl p-5 mx-4 my-2 shadow-md border border-gray-100 mt-3'>
          <Text className='text-lg font-semibold text-gray-800 mb-3'>
            {String(item.bankName ?? "")}
          </Text>

          <View className='flex-row justify-between items-center'>
            <Text className='text-sm text-gray-500'>
              Opening Balance : ₹ {String(item.OpeningBalance ?? "")}
            </Text>
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <View className='items-center py-20'>
          <Text className='text-gray-400'>No banks found</Text>
        </View>
      )}
    />
  );
};

export default ShowBank;
