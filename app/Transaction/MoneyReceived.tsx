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

const MoneyReceived = () => {
  const db = useSQLiteContext();

  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: "",
    customerId: null as number | null,
    bankId: null as number | null,
    amount: "",
    narration: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerList, setCustomerList] = useState<
    { id: number; customerName: string }[]
  >([]);

  const [bankList, setBankList] = useState<{ id: number; bankName: string }[]>(
    [],
  );
  const [refreshList, setRefreshList] = useState(false);

  const [showModifyModal, setShowModifyModal] = useState(false);
  const [filterCustomerId, setFilterCustomerId] = useState<number | null>(null);
  const [invoiceList, setInvoiceList] = useState<
    { id: number; InvoiceNo: string }[]
  >([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );

  const onDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formatted = date.toISOString().split("T")[0];
      setForm({ ...form, invoiceDate: formatted });
    }
  };

  const handleSubmit = async () => {
    if (
      !form.invoiceNo ||
      !form.invoiceDate ||
      !form.customerId ||
      !form.amount
    ) {
      Alert.alert("Alert", "Please fill all required fields");
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO MoneyReceived (InvoiceNo, invoiceDate, customerId,bankId,amount, narration)
         VALUES (?, ?, ?, ?, ? ,?)`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.customerId,
          form.bankId,
          Number(form.amount),
          form.narration,
        ],
      );

      Alert.alert("Success", "Money Received added successfully");

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        customerId: null,
        bankId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log("SalesError :", error);
    }
  };

  const loadInvoicesByCustomer = async (customerId: number | null) => {
    if (!customerId) return;

    try {
      setFilterCustomerId(customerId);
      setSelectedInvoiceId(null);

      const result = await db.getAllAsync(
        "SELECT id, InvoiceNo FROM MoneyReceived WHERE customerId = ?",
        [customerId],
      );

      setInvoiceList(result as { id: number; InvoiceNo: string }[]);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const loadSalesDetails = async (salesId: number | null) => {
    if (!salesId) return;

    try {
      setSelectedInvoiceId(salesId);

      const result = await db.getFirstAsync<any>(
        "SELECT * FROM MoneyReceived WHERE id = ?",
        [salesId],
      );

      if (result) {
        setForm({
          invoiceNo: result.InvoiceNo,
          invoiceDate: result.invoiceDate,
          customerId: result.customerId,
          bankId: result.bankId,
          amount: String(result.amount),
          narration: result.narration || "",
        });
      }
    } catch (error) {
      console.error("Error loading sales details:", error);
    }
  };

  const handleUpdate = async () => {
    if (
      !form.invoiceNo ||
      !form.invoiceDate ||
      !form.customerId ||
      !form.amount ||
      !selectedInvoiceId
    ) {
      Alert.alert("Alert", "All fields are required");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE MoneyReceived
         SET InvoiceNo = ?, invoiceDate = ?, customerId = ?,bankId = ?, amount = ?, narration = ?
         WHERE id = ?`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.customerId,
          form.bankId,
          Number(form.amount),
          form.narration,
          selectedInvoiceId,
        ],
      );

      Alert.alert("Success", "Money Received updated successfully");

      setShowModifyModal(false);

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        customerId: null,
        bankId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log("The Error is :", error);
    }
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT id, customerName FROM Customer ORDER BY customerName",
        );
        setCustomerList(result as { id: number; customerName: string }[]);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };
    loadCustomers();

    const loadBanks = async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT id, bankName FROM Bank ORDER BY bankName",
        );
        setBankList(result as { id: number; bankName: string }[]);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };

    loadBanks();
  }, []);

  return (
    <ScrollView
      className='flex-1 px-4 py-4'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 220 }}
    >
      <View className='px-4 py-4'>
        {/* Form */}
        <View className='w-full max-w-md self-center space-y-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-8'>
          <Text className='text-base font-medium pb-2'>Invoice Number</Text>
          <TextInput
            placeholder='Enter Invoice Number'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            value={form.invoiceNo}
            onChangeText={(t) => setForm({ ...form, invoiceNo: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Invoice Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white flex-row items-center justify-between'
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
          <View className='rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'>
            <Picker
              selectedValue={form.customerId}
              onValueChange={(v) => setForm({ ...form, customerId: v })}
            >
              <Picker.Item label='Select Customer' value={undefined} />
              {customerList.map((c) => (
                <Picker.Item key={c.id} label={c.customerName} value={c.id} />
              ))}
            </Picker>
          </View>

          <Text className='text-base font-medium mt-4 pb-2'>Amount</Text>
          <TextInput
            placeholder='Enter Amount'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            keyboardType='numeric'
            value={form.amount}
            onChangeText={(t) => setForm({ ...form, amount: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Bank Name</Text>
          <View className='rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'>
            <Picker
              selectedValue={form.bankId}
              onValueChange={(v) => setForm({ ...form, bankId: v })}
            >
              <Picker.Item label='Select Bank Name' value={undefined} />
              {bankList.map((c) => (
                <Picker.Item key={c.id} label={c.bankName} value={c.id} />
              ))}
            </Picker>
          </View>

          <Text className='text-base font-medium mt-4 pb-2'>Narration</Text>
          <TextInput
            placeholder='Enter Narration'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white flex-row items-center justify-between'
            value={form.narration}
            onChangeText={(t) => setForm({ ...form, narration: t })}
          />
        </View>

        {/* Buttons */}
        <View className='flex-row justify-center gap-4'>
          <Button title='Submit' onPress={handleSubmit} />
          <Button title='Modify' onPress={() => setShowModifyModal(true)} />
        </View>

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

              {/* ===== SELECT CUSTOMER (FILTER) ===== */}
              <Text className='mb-2 text-black dark:text-white'>
                Customer Name
              </Text>

              <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                <Picker
                  selectedValue={filterCustomerId}
                  onValueChange={loadInvoicesByCustomer}
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

              {/* ===== SELECT INVOICE ===== */}
              {invoiceList.length > 0 && (
                <>
                  <Text className='mb-2 text-black dark:text-white'>
                    Invoice Number
                  </Text>

                  <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                    <Picker
                      selectedValue={selectedInvoiceId}
                      onValueChange={loadSalesDetails}
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
                <>
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
                      onValueChange={(v) => setForm({ ...form, customerId: v })}
                    >
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
                </>
              )}
            </View>
          </View>
        </Modal>

        <View className='flex items-center bg-white dark:bg-gray-800/50 rounded-xl p-4 w-[85%] relative left-8 top-[1px]'>
          <Link
            href={{
              pathname: "/Transaction/forms/showMoneyReceived",
              params: {
                refresh: refreshList ? "1" : "0",
              },
            }}
          >
            <Text className='text-base font-medium'>Show Customer</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default MoneyReceived;
