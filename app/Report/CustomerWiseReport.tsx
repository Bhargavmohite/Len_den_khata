import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

type Row = {
  id: number;
  customerName: string;
  sales: number;
  received: number;
  balance: number;
};

const CustomerWiseReport = () => {
  const db = useSQLiteContext();
  const [data, setData] = useState<Row[]>([]);

  // 🔹 Load Customer-wise Report
  useEffect(() => {
    const loadReport = async () => {
      try {
        const result = await db.getAllAsync<Row>(`
          SELECT 
            C.id,
            C.customerName,
            COALESCE(S.totalSales, 0) as sales,
            COALESCE(M.totalReceived, 0) as received,
            (COALESCE(S.totalSales, 0) - COALESCE(M.totalReceived, 0)) as balance
          FROM Customer C
          LEFT JOIN (
            SELECT customerId, SUM(amount) as totalSales
            FROM Sales
            GROUP BY customerId
          ) S ON C.id = S.customerId
          LEFT JOIN (
            SELECT customerId, SUM(amount) as totalReceived
            FROM MoneyReceived
            GROUP BY customerId
          ) M ON C.id = M.customerId
          ORDER BY C.customerName
        `);

        setData(result || []);
      } catch (err) {
        console.error("Customer Report Error:", err);
      }
    };

    loadReport();
  }, []);

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      {/* 📊 Table */}
      <View className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
        {/* Header */}
        <View className='flex-row items-center bg-gray-200 p-3'>
          <Text className='w-15 font-bold text-gray-700'>Customer</Text>
          <Text className='w-24 text-right font-bold text-gray-700 relative right-3'>
            Sales
          </Text>
          <Text className='w-24 text-right font-bold text-gray-700 relative right-3'>
            Received
          </Text>
          <Text className='w-24 text-right font-bold text-gray-700 relative right-3'>
            Balance
          </Text>
        </View>

        {/* Rows */}
        <ScrollView>
          {data.length > 0 ? (
            data.map((item) => (
              <View
                 key={item.id}
                 className='flex-row p-3 border-t border-gray-100 items-center gap-2'
               >
                 <Text
                   className='flex-1 text-gray-800'
                   numberOfLines={1}
                   ellipsizeMode='tail'
                 >
                   {item.customerName}
                 </Text>
 
                 <Text className='flex-1 text-right text-blue-600 font-semibold'>
                   ₹{item.sales}
                 </Text>
 
                 <Text className='flex-1 text-right text-green-600 font-semibold'>
                   ₹{item.received}
                 </Text>
 
                 <Text className='flex-1 text-right text-red-600 font-bold'>
                   ₹{item.balance}
                 </Text>
               </View>
 
            ))
          ) : (
            <View className='items-center py-10'>
              <Text className='text-gray-400'>No data found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default CustomerWiseReport;
