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

interface MoneyPaidType {
  id: number;
  InvoiceNo: string;
  invoiceDate: string;
  supplyId: number;
  bankId: number;
  amount: number;
  narration?: string;
}

const money_paid = () => {
  const db = useSQLiteContext();

  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: "",
    supplyId: null as number | null,
    bankId: null as number | null,
    amount: "",
    narration: "",
  });

  const [supplyList, setSupplyList] = useState<
    { id: number; supplyName: string }[]
  >([]);

  const [bankList, setBankList] = useState<{ id: number; bankName: string }[]>(
    [],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshList, setRefreshList] = useState(false);

  const [showModifyModal, setShowModifyModal] = useState(false);
  const [filterSupplierId, setFilterSupplierId] = useState<number | null>(null);
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

  useEffect(() => {
    const loadSupplies = async () => {
      try {
        const result = await db.getAllAsync<{ id: number; supplyName: string }>(
          "SELECT id, supplyName FROM Supply ORDER BY supplyName",
        );
        setSupplyList(result);
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };
    loadSupplies();

    const loadsBanks = async () => {
      try {
        const result = await db.getAllAsync<{ id: number; bankName: string }>(
          "SELECT id, bankName FROM Bank ORDER BY bankName",
        );
        setBankList(result);
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };

    loadsBanks();
  }, []);

  const handleSubmit = async () => {
    if (
      !form.invoiceNo ||
      !form.invoiceDate ||
      !form.supplyId ||
      !form.bankId ||
      !form.amount
    ) {
      Alert.alert("Alert", "Please fill all required fields");
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO MoneyPaid 
         (InvoiceNo, invoiceDate, supplyId,bankId,amount, narration)
         VALUES (?, ?, ?, ?, ?,?)`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.supplyId,
          form.bankId,
          Number(form.amount),
          form.narration,
        ],
      );

      Alert.alert("Success", "Purchase added successfully");

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        supplyId: null,
        bankId: null,
        amount: "",
        narration: "",
      });
      setRefreshList((prev) => !prev);
    } catch (err) {
      console.error("Error inserting purchase:", err);
    }
  };

  const loadInvoicesBySupplier = async (supplierId: number | null) => {
    if (!supplierId) return;

    try {
      setFilterSupplierId(supplierId);
      setSelectedInvoiceId(null);

      const result = await db.getAllAsync<{ id: number; InvoiceNo: string }>(
        "SELECT id, InvoiceNo FROM MoneyPaid WHERE supplyId = ?",
        [supplierId],
      );

      setInvoiceList(result);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const loadPurchaseDetails = async (purchaseId: number | null) => {
    if (!purchaseId) return;

    try {
      setSelectedInvoiceId(purchaseId);

      const result = await db.getFirstAsync<MoneyPaidType>(
        "SELECT * FROM MoneyPaid WHERE id = ?",
        [purchaseId],
      );

      if (result) {
        setForm({
          invoiceNo: result.InvoiceNo,
          invoiceDate: result.invoiceDate,
          supplyId: result.supplyId,
          bankId: result.bankId,
          amount: String(result.amount),
          narration: result.narration || "",
        });
      }
    } catch (error) {
      console.error("Error loading purchase details:", error);
    }
  };

  const handleUpdate = async () => {
    if (
      !form.invoiceNo ||
      !form.invoiceDate ||
      !form.supplyId ||
      !form.amount ||
      !selectedInvoiceId
    ) {
      Alert.alert("Alert", "All fields are required");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE MoneyPaid 
         SET InvoiceNo = ?, invoiceDate = ?, supplyId = ?, bankId = ?,amount = ?, narration = ?
         WHERE id = ?`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.supplyId,
          form.bankId,
          Number(form.amount),
          form.narration,
          selectedInvoiceId,
        ],
      );

      Alert.alert("Success", "Money Paid updated successfully");

      setShowModifyModal(false);
      setForm({
        invoiceNo: "",
        invoiceDate: "",
        supplyId: null,
        bankId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (error) {
      console.log("The Error is :", error);
    }
  };

  return (
    <ScrollView
      className='flex-1 px-4 py-4'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 220 }}
    >
      <View className='px-4 py-4'>
        {/* Form */}
        <View className='w-full max-w-md self-center space-y-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-8'>
          <Text className='text-base font-medium pb-2'>Voucher Number</Text>
          <TextInput
            placeholder='Enter Invoice Number'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            value={form.invoiceNo}
            onChangeText={(t) => setForm({ ...form, invoiceNo: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Date</Text>
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

          <Text className='text-base font-medium mt-4 pb-2'>Supplier Name</Text>
          <View className='rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'>
            <Picker
              selectedValue={form.supplyId}
              onValueChange={(v) => setForm({ ...form, supplyId: v })}
            >
              <Picker.Item label='Select Supplier' value={undefined} />
              {supplyList.map((s) => (
                <Picker.Item key={s.id} label={s.supplyName} value={s.id} />
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
              {bankList.map((s) => (
                <Picker.Item key={s.id} label={s.bankName} value={s.id} />
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
        <View className='flex-row justify-center  gap-4'>
          <Button title='Submit' onPress={handleSubmit} />
          <Button title='Modify' onPress={() => setShowModifyModal(true)} />
        </View>
        {/* Modify Modal */}
        <View>
          <Modal
            visible={showModifyModal}
            transparent
            animationType='fade'
            onRequestClose={() => setShowModifyModal(false)}
          >
            <View className='flex-1 justify-center items-center bg-black/40'>
              <View className='w-[90%] rounded-xl bg-white p-5 dark:bg-gray-800'>
                <Text className='text-lg font-semibold text-black dark:text-white mb-4'>
                  Modify Purchase
                </Text>

                {/* ===== SELECT SUPPLIER (FILTER) ===== */}
                <Text className='mb-2 text-black dark:text-white'>
                  Supplier Name
                </Text>

                <View className='h-14 mb-3 justify-center rounded-lg border border-[#dbe0e6] dark:border-gray-600'>
                  <Picker
                    selectedValue={filterSupplierId}
                    onValueChange={loadInvoicesBySupplier}
                  >
                    <Picker.Item label='Select Supplier' value={null} />
                    {supplyList.map((s) => (
                      <Picker.Item
                        key={s.id}
                        label={s.supplyName}
                        value={s.id}
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
                        onValueChange={loadPurchaseDetails}
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
                        selectedValue={form.supplyId}
                        onValueChange={(v) => setForm({ ...form, supplyId: v })}
                      >
                        {supplyList.map((s) => (
                          <Picker.Item
                            key={s.id}
                            label={s.supplyName}
                            value={s.id}
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
        </View>
        <View className='flex items-center bg-white dark:bg-gray-800/50 rounded-xl p-4 w-[85%] relative left-8 top-[1px]'>
          <Link
            href={{
              pathname: "/Transaction/forms/showMoneyPaid",
              params: {
                refresh: refreshList ? "1" : "0",
              },
            }}
            asChild
          >
            <Text className='text-base font-medium'>Show Supplier</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default money_paid;
