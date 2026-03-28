import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

type MoneyReceivedItem = {
  id: number;
  InvoiceNo: string;
  invoiceDate: string;
  amount: number;
  narration?: string;
  customerName?: string;
};

const showMoneyReceived = () => {
  const { refreshList } = useLocalSearchParams();
  const db = useSQLiteContext();
  const [sales, setSales] = useState<MoneyReceivedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSalesDetails = async () => {
    try {
      const result = await db.getAllAsync(`
                SELECT 
                  S.id,
                  S.InvoiceNo,
                  S.invoiceDate,
                  S.amount,
                  S.narration,
                  C.customerName
                  FROM MoneyReceived S
                  LEFT JOIN Customer C ON S.customerId = C.id
                  ORDER BY S.invoiceDate DESC
              `);
      setSales(result);
    } catch (error) {
      console.error("listing error in sales", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesDetails();
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
      className='p-2'
      data={sales}
      keyExtractor={(item, index) =>
        item?.id ? item.id.toString() : index.toString()
      }
      contentContainerStyle={{ paddingBottom: 30 }}
      renderItem={({ item }) => {
        if (!item) return null;

        return (
          <View className='mx-4 my-2 p-4 bg-white rounded-2xl shadow-sm'>
            {/* Header */}
            <View className='flex-row justify-between items-center mb-2'>
              <Text className='text-lg font-bold text-green-600'>
                🧾 {item.InvoiceNo || "N/A"}
              </Text>
              <Text className='text-xs text-gray-400'>
                {item.invoiceDate || "N/A"}
              </Text>
            </View>

            {/* Customer */}
            <Text className='text-gray-800 font-semibold mb-1'>
              🧔 {item.customerName || "Unknown Customer"}
            </Text>

            {/* Narration */}
            <Text className='text-gray-600 mb-3'>
              📝 {item.narration || "No narration"}
            </Text>

            {/* Amount */}
            <View className='bg-green-50 p-3 rounded-xl'>
              <Text className='text-xs text-green-600 uppercase font-semibold'>
                Amount
              </Text>
              <Text className='text-base font-bold text-green-700'>
                ₹{item.amount ?? 0}
              </Text>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={() => (
        <View className='items-center py-20'>
          <Text className='text-gray-400'>No Money Received found</Text>
        </View>
      )}
    />
  );
};

export default showMoneyReceived;
