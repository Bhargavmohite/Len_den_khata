import { Picker } from "@react-native-picker/picker";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const SupplierLedgerReport = () => {
  const db = useSQLiteContext();

  const [rows, setRows] = useState<any[]>([]);
  const [supplyList, setSupplyList] = useState<
    { id: number; supplyName: string }[]
  >([]);

  const [form, setForm] = useState<{ supplyId?: number }>({});
  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 Search Filter
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;

    return rows.filter((item) =>
      String(item.InvoiceNo || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, rows]);

  // 📦 Load Supplier List
  useEffect(() => {
    const loadSupplies = async () => {
      try {
        const result = await db.getAllAsync<{
          id: number;
          supplyName: string;
        }>("SELECT id, supplyName FROM Supply ORDER BY supplyName");

        setSupplyList(result);
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };

    loadSupplies();
  }, []);

  // 📊 Load Ledger Data (by supplier)
  const loadData = async (supplierId: number) => {
    try {
      const raw = await db.getAllAsync(
        `
        SELECT 
          invoiceDate as date,
          InvoiceNo,
          amount as purchase,
          0 as paid
        FROM Purchase
        WHERE supplyId = ?

        UNION ALL

        SELECT 
          invoiceDate as date,
          InvoiceNo,
          0 as purchase,
          amount as paid
        FROM MoneyPaid
        WHERE supplyId = ?

        ORDER BY date ASC
        `,
        [supplierId, supplierId],
      );

      let balance = 0;

      const finalData = raw.map((item: any) => {
        balance += item.purchase;
        balance -= item.paid;

        return {
          ...item,
          balance,
        };
      });

      setRows(finalData);
    } catch (error) {
      console.error("Error loading ledger:", error);
    }
  };

  // 🔁 Reload when supplier changes
  useEffect(() => {
    if (form.supplyId) {
      setRows([]); // clear old data
      loadData(form.supplyId);
    }
  }, [form.supplyId]);

  return (
    <>
      {/* Supplier Picker */}
      <View className='p-4'>
        <Text className='text-base font-medium mt-4 pb-2'>Choose Supplier</Text>

        <View className='rounded-lg border border-[#dbe0e6] px-2'>
          <Picker
            selectedValue={form.supplyId}
            onValueChange={(v) => setForm((prev) => ({ ...prev, supplyId: v }))}
          >
            <Picker.Item label='Select Supplier' value={undefined} />
            {supplyList.map((s) => (
              <Picker.Item key={s.id} label={s.supplyName} value={s.id} />
            ))}
          </Picker>
        </View>

        {/* 🔍 Search Input */}
        <TextInput
          placeholder='Search Invoice...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          className='border mt-3 p-2 rounded'
        />
      </View>

      {/* Table */}
      <ScrollView className='flex-1 bg-white p-4'>
        {/* Header */}
        <View className='flex-row border bg-gray-200'>
          <Text className='flex-1 p-2 border-r  text-xs font-bold'>Date</Text>
          <Text className='flex-1 p-2 border-r text-xs font-bold'>Invoice</Text>
          <Text className='flex-1 p-2 border-r text-xs font-bold'>Pur</Text>
          <Text className='flex-1 p-2 border-r text-xs font-bold'>Paid</Text>
          <Text className='flex-1 p-2 text-xs font-bold'>Balance</Text>
        </View>

        {/* Rows */}
        {filteredRows.map((item, index) => (
          <View key={index} className='flex-row border-b'>
            <Text
              className='flex-1 p-2 border-r border-l text-xs'
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {item.date.split("-").reverse().join("/")}
            </Text>
            <Text className='flex-1 p-2 border-r text-xs font-bold'>
              {item.InvoiceNo}
            </Text>
            <Text className='flex-1 p-2 border-r text-xs'>{item.purchase}</Text>
            <Text className='flex-1 p-2 border-r text-xs'>{item.paid}</Text>
            <Text className='flex-1 p-2 border-r text-xs'>{item.balance}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default SupplierLedgerReport;
