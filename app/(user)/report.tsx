import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const report = () => {
  const router = useRouter();
  const suppliers = () => {
    return router.navigate("/Report/SupplierWiseReport");
  };

  const customers = () => {
    return router.navigate("/Report/CustomerWiseReport");
  };
  return (
    <View className='px-4 py-4 gap-4 mt-2'>
      {/* Supplier wise Report */}
      <Pressable
        className='bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-sm'
        onPress={() => suppliers()}
      >
        <View className='flex-row items-center gap-4'>
          <View className='w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 items-center justify-center '>
            <FontAwesome name='file-pdf-o' size={32} color='#137fec' />
          </View>

          <View className='flex-1'>
            <Text className='text-base font-semibold text-black dark:text-white'>
              Supplier Wise Report
            </Text>
          </View>

          <AntDesign name='right' size={22} color='#137fec' />
        </View>
      </Pressable>

      {/* Customer wise Report */}
      <Pressable
        className='bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-sm'
        onPress={() => customers()}
      >
        <View className='flex-row items-center gap-4'>
          <View className='w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 items-center justify-center '>
            <FontAwesome name='file-pdf-o' size={32} color='#137fec' />
          </View>

          <View className='flex-1'>
            <Text className='text-base font-semibold text-black dark:text-white'>
              Customer Wise Report
            </Text>
          </View>

          <AntDesign name='right' size={22} color='#137fec' />
        </View>
      </Pressable>
    </View>
  );
};

export default report;
