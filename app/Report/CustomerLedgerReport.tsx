import { Picker } from "@react-native-picker/picker";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View, TextInput } from "react-native";

const CustomerLedgerReport = () => {
  const db = useSQLiteContext();

  const [rows, setRows] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<
    { id: number; customerName: string }[]
  >([]);

  const [form, setForm] = useState<{ customerId?: number }>({});
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

  // 📦 Load Customers
  useEffect(() => {
    const loadCustomers = async () => {
      const result = await db.getAllAsync(
        "SELECT id, customerName FROM Customer ORDER BY customerName",
      );
      setCustomerList(result);
    };

    loadCustomers();
  }, []);

  // 📊 Load Ledger (Filtered by customer)
  const loadData = async (customerId: number) => {
    const raw = await db.getAllAsync(
      `
      SELECT 
        invoiceDate as date,
        InvoiceNo,
        amount as sales,
        0 as received
      FROM Sales
      WHERE customerId = ?

      UNION ALL

      SELECT 
        invoiceDate as date,
        InvoiceNo,
        0 as sales,
        amount as received
      FROM MoneyReceived
      WHERE customerId = ?

      ORDER BY date ASC
      `,
      [customerId, customerId],
    );

    let balance = 0;

    const finalData = raw.map((item: any) => {
      balance += item.sales;
      balance -= item.received;

      return {
        ...item,
        balance,
      };
    });

    setRows(finalData);
  };

  // 🔁 Reload when customer changes
  useEffect(() => {
    if (form.customerId) {
      setRows([]);
      loadData(form.customerId);
    }
  }, [form.customerId]);

  // 📅 Format Date → 27-03-2026
  const formatDate = (date: string) => {
    if (!date) return "";
    return date.split("-").reverse().join("-");
  };

  return (
    <>
      {/* Customer Picker */}
      <View className='p-4'>
        <Text className='text-base font-medium pb-2'>Choose Customer</Text>

        <Picker
          selectedValue={form.customerId}
          onValueChange={(v) => setForm((prev) => ({ ...prev, customerId: v }))}
        >
          <Picker.Item label='Select Customer' value={undefined} />
          {customerList.map((c) => (
            <Picker.Item key={c.id} label={c.customerName} value={c.id} />
          ))}
        </Picker>

        {/* Search */}
        <TextInput
          placeholder='Search Invoice...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          className='border mt-3 p-2 rounded'
        />
      </View>

      {/* Table */}
      <ScrollView className='flex-1 bg-white p-6'>
        {/* Header */}
        <View className='flex-row border bg-gray-200'>
          <Text className='flex-1 p-2 text-xs border-r font-bold'>Date</Text>
          <Text className='flex-1 p-2 text-xs border-r font-bold'>Inv</Text>
          <Text className='flex-1 p-2 text-xs border-r font-bold'>Sales</Text>
          <Text className='flex-1 p-2 text-xs border-r font-bold'>Recei</Text>
          <Text className='flex-1 p-2 text-xs font-bold'>Balance</Text>
        </View>

        {/* Rows */}
        {filteredRows.map((item, index) => (
          <View key={index} className='flex-row border-b'>
            <Text
              className='flex-1 p-2   border-r border-l text-xs'
              numberOfLines={1}
            >
              {formatDate(item.date)}
            </Text>

            <Text className='flex-1 p-2 border-r text-xs' numberOfLines={1}>
              {item.InvoiceNo}
            </Text>

            <Text className='flex-1 p-2  border-r text-xs'>{item.sales}</Text>

            <Text className='flex-1 p-2 border-r text-xs'>{item.received}</Text>

            <Text className='flex-1 p-2 border-r text-xs'>{item.balance}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default CustomerLedgerReport;
