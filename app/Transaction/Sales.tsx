import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const Sales = () => {
  const db = useSQLiteContext();

  const [form, setForm] = useState<{
    invoiceNo: string;
    invoiceDate: string;
    customerId: number | null;
    amount: string;
    narration: string;
  }>({
    invoiceNo: "",
    invoiceDate: "",
    customerId: null,
    amount: "",
    narration: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [customerList, setCustomerList] = useState<
    { id: number; customerName: string }[]
  >([]);

  const [refreshList, setRefreshList] = useState(false);

  /* MODIFY STATES */
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [filterCustomerId, setFilterCustomerId] = useState<number | null>(null);

  const [invoiceList, setInvoiceList] = useState<
    { id: number; InvoiceNo: string }[]
  >([]);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formatted = date.toISOString().split("T")[0];
      setForm({ ...form, invoiceDate: formatted });
    }
  };

  const handleSubmit = async () => {
    try {
      if (
        !form.invoiceNo ||
        !form.invoiceDate ||
        !form.customerId ||
        !form.amount
      ) {
        Alert.alert("Alert", "Please fill all required fields");
        return;
      }

      await db.runAsync(
        `INSERT INTO Sales (InvoiceNo, invoiceDate, customerId, amount, narration)
         VALUES (?, ?, ?, ?, ?)`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.customerId,
          form.amount,
          form.narration,
        ],
      );

      Alert.alert("Success", "Sales added successfully");

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        customerId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log("SalesError :", error);
    }
  };

  /* LOAD INVOICES */
  const loadInvoicesByCustomer = async (customerId: number | null) => {
    if (customerId === null) return;

    setFilterCustomerId(customerId);
    setSelectedInvoiceId(null);
    setInvoiceList([]);

    const result = await db.getAllAsync(
      "SELECT id, InvoiceNo FROM Sales WHERE customerId = ?",
      [customerId],
    );

    setInvoiceList(result as any);
  };

  /* LOAD SALES DETAILS */
  const loadSalesDetails = async (SalesId: number | null) => {
    if (SalesId === null) return;

    setSelectedInvoiceId(SalesId);

    const result = (await db.getFirstAsync("SELECT * FROM Sales WHERE id = ?", [
      SalesId,
    ])) as any;

    if (result) {
      setForm({
        invoiceNo: result.InvoiceNo,
        invoiceDate: result.invoiceDate,
        customerId: result.customerId,
        amount: String(result.amount),
        narration: result.narration || "",
      });
    }
  };

  /* UPDATE */
  const handleUpdate = async () => {
    try {
      if (!selectedInvoiceId) {
        Alert.alert("Error", "No invoice selected");
        return;
      }

      if (
        !form.invoiceNo ||
        !form.invoiceDate ||
        !form.customerId ||
        !form.amount
      ) {
        Alert.alert("Alert", "All fields are required");
        return;
      }

      await db.runAsync(
        `UPDATE Sales 
         SET InvoiceNo = ?, invoiceDate = ?, customerId = ?, amount = ?, narration = ?
         WHERE id = ?`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.customerId,
          form.amount,
          form.narration,
          selectedInvoiceId,
        ],
      );

      Alert.alert("Success", "Sales updated successfully");

      setShowModifyModal(false);

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        customerId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log("Update Error :", error);
    }
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT id, customerName FROM Customer ORDER BY customerName",
        );
        setCustomerList(result as any);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };

    loadCustomers();
  }, []);

  return (
    <ScrollView
      className='flex-1 px-4 py-4'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 220 }}
    >
      <View className='px-4 py-4'>
        {/* Forms */}
        <View className='w-full max-w-md self-center space-y-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-8'>
          <Text className='text-base font-medium pb-2'>Invoice Number</Text>
          <TextInput
            placeholder='Enter Invoice Number'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] px-4'
            value={form.invoiceNo}
            onChangeText={(t) => setForm({ ...form, invoiceNo: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Invoice Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] px-4 flex-row items-center justify-between'
          >
            <Text>{form.invoiceDate || "Select Date"}</Text>
            <MaterialIcons name='calendar-today' size={22} />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode='date'
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
            />
          )}

          <Text className='text-base font-medium mt-4 pb-2'>Customer Name</Text>
          <View className='rounded-lg border border-[#dbe0e6]'>
            <Picker
              selectedValue={form.customerId}
              onValueChange={(v) =>
                setForm({ ...form, customerId: v !== null ? Number(v) : null })
              }
            >
              <Picker.Item label='Select Customer' value={null} />
              {customerList.map((c) => (
                <Picker.Item key={c.id} label={c.customerName} value={c.id} />
              ))}
            </Picker>
          </View>

          <Text className='text-base font-medium mt-4 pb-2'>Amount</Text>
          <TextInput
            placeholder='Enter Amount'
            keyboardType='numeric'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] px-4'
            value={form.amount}
            onChangeText={(t) => setForm({ ...form, amount: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Narration</Text>
          <TextInput
            placeholder='Enter Narration'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] px-4'
            value={form.narration}
            onChangeText={(t) => setForm({ ...form, narration: t })}
          />
        </View>
        {/* Buttons */}
        <View className='flex-row justify-center gap-4'>
          <Button title='Submit' onPress={handleSubmit} />
          <Button title='Modify' onPress={() => setShowModifyModal(true)} />
        </View>
        {/* modal */}
        <Modal
          visible={showModifyModal}
          transparent
          animationType='fade'
          onRequestClose={() => setShowModifyModal(false)}
        >
          <View className='flex-1 justify-center items-center bg-black/40'>
            <View className='w-[90%] rounded-xl bg-white p-5 dark:bg-gray-800'>
              <Text className='text-lg font-semibold text-black dark:text-white mb-4'>
                Modify Sales
              </Text>

              {/* ===== CUSTOMER SELECT ===== */}
              <Text className='mb-2 text-black dark:text-white'>
                Customer Name
              </Text>

              <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                <Picker
                  selectedValue={filterCustomerId}
                  onValueChange={(v) =>
                    loadInvoicesByCustomer(v !== null ? Number(v) : null)
                  }
                >
                  <Picker.Item label='Select Customer' value={null} />
                  {customerList.map((c) => (
                    <Picker.Item
                      key={c.id}
                      label={c.customerName}
                      value={c.id}
                    />
                  ))}
                </Picker>
              </View>

              {/* ===== INVOICE SELECT ===== */}
              {invoiceList.length > 0 && (
                <>
                  <Text className='mb-2 text-black dark:text-white'>
                    Invoice Number
                  </Text>

                  <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                    <Picker
                      selectedValue={selectedInvoiceId}
                      onValueChange={(v) =>
                        loadSalesDetails(v !== null ? Number(v) : null)
                      }
                    >
                      <Picker.Item label='Select Invoice' value={null} />
                      {invoiceList.map((i) => (
                        <Picker.Item
                          key={i.id}
                          label={i.InvoiceNo}
                          value={i.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              {/* ===== EDIT FORM ===== */}
              {selectedInvoiceId && (
                <View>
                  <Text className='text-lg font-semibold text-black dark:text-white mb-4'>
                    Edited Form
                  </Text>

                  <TextInput
                    placeholder='Invoice Number'
                    className='h-14 mb-3 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                    value={form.invoiceNo}
                    onChangeText={(t) => setForm({ ...form, invoiceNo: t })}
                  />

                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] px-4'
                  >
                    <Text className='text-black dark:text-white'>
                      {form.invoiceDate || "Select Invoice Date"}
                    </Text>
                  </Pressable>

                  <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6]'>
                    <Picker
                      selectedValue={form.customerId}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          customerId: v !== null ? Number(v) : null,
                        })
                      }
                    >
                      <Picker.Item label='Select Customer' value={null} />
                      {customerList.map((c) => (
                        <Picker.Item
                          key={c.id}
                          label={c.customerName}
                          value={c.id}
                        />
                      ))}
                    </Picker>
                  </View>

                  <TextInput
                    placeholder='Amount'
                    keyboardType='numeric'
                    className='h-14 mb-3 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                    value={form.amount}
                    onChangeText={(t) => setForm({ ...form, amount: t })}
                  />

                  <TextInput
                    placeholder='Narration'
                    className='h-14 mb-4 rounded-lg border border-[#dbe0e6] px-4 text-black dark:text-white'
                    value={form.narration}
                    onChangeText={(t) => setForm({ ...form, narration: t })}
                  />

                  {/* ===== ACTION BUTTONS ===== */}
                  <View className='flex-row justify-between'>
                    <Button title='Update' onPress={handleUpdate} />
                    <Button
                      title='Cancel'
                      onPress={() => setShowModifyModal(false)}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        <View className='flex items-center mt-4'>
          <Link
            href={{
              pathname: "/Transaction/forms/showSales",
              params: { refresh: refreshList ? "1" : "0" },
            }}
          >
            <Text>Show Customer</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default Sales;
