import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

type Row = {
  id: number;
  supplierName: string;
  purchase: number;
  paid: number;
  balance: number;
};

const SupplierWiseReport = () => {
  const db = useSQLiteContext();
  const [data, setData] = useState<Row[]>([]);

  // 🔹 Load Supplier-wise Report
  useEffect(() => {
    const loadReport = async () => {
      try {
        const result = await db.getAllAsync<Row>(`
          SELECT 
            S.id,
            S.supplyName as supplierName,
            COALESCE(P.totalPurchase, 0) as purchase,
            COALESCE(M.totalPaid, 0) as paid,
            (COALESCE(P.totalPurchase, 0) - COALESCE(M.totalPaid, 0)) as balance
          FROM Supply S
          LEFT JOIN (
            SELECT supplyId, SUM(amount) as totalPurchase
            FROM Purchase
            GROUP BY supplyId
          ) P ON S.id = P.supplyId
          LEFT JOIN (
            SELECT supplyId, SUM(amount) as totalPaid
            FROM MoneyPaid
            GROUP BY supplyId
          ) M ON S.id = M.supplyId
          ORDER BY S.supplyName
        `);

        setData(result || []);
      } catch (err) {
        console.error("Report Error:", err);
      }
    };

    loadReport();
  }, []);

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      {/* 📊 Table */}
      <View className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
        {/* Header columns */}
        <View className='flex-row items-center bg-gray-200 p-3'>
          <Text className='w-15 font-bold text-gray-700'>Supplier</Text>
          <Text className='w-24 text-right font-bold text-gray-700 relative left-3'>
            Purchase
          </Text>
          <Text className='w-24 text-right font-bold text-gray-700 relative right-3'>
            Paid
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
                className='flex-row p-3 border-t border-gray-100 items-center'
              >
                <Text
                  className='flex-1 text-gray-800'
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {item.supplierName}
                </Text>

                <Text className='flex-1 text-right text-blue-600 font-semibold'>
                  ₹{item.purchase}
                </Text>

                <Text className='flex-1 text-right text-green-600 font-semibold'>
                  ₹{item.paid}
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

export default SupplierWiseReport;
