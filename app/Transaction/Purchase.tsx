import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

interface Purchase {
  id: number;
  InvoiceNo: string;
  invoiceDate: string;
  supplyId: number;
  amount: number;
  narration?: string;
}

const Purchase = () => {
  const db = useSQLiteContext();

  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: "",
    supplyId: null as number | null,
    amount: "",
    narration: "",
  });

  const [supplyList, setSupplyList] = useState<
    { id: number; supplyName: string }[]
  >([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshList, setRefreshList] = useState(false);

  /* Separate Date Pickers */
  const [showDatePickerMain, setShowDatePickerMain] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  /* Modify States */
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [filterSupplierId, setFilterSupplierId] = useState<number | null>(null);
  const [invoiceList, setInvoiceList] = useState<
    { id: number; InvoiceNo: string }[]
  >([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );

  /* Date Change */
  const onDateChange = (_: any, date?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePickerMain(false);
      setShowDatePickerModal(false);
    }
    if (date) {
      setSelectedDate(date);
      const formatted = date.toISOString().split("T")[0];
      setForm({ ...form, invoiceDate: formatted });
    }
  };

  /* Load Suppliers */
  useEffect(() => {
    const loadSupplies = async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT id, supplyName FROM Supply ORDER BY supplyName",
        );
        setSupplyList(result);
      } catch (error) {
        console.error(error);
      }
    };
    loadSupplies();
  }, [db]);

  /* Submit */
  const handleSubmit = async () => {
    if (
      !form.invoiceNo ||
      !form.invoiceDate ||
      !form.supplyId ||
      !form.amount
    ) {
      Alert.alert("Alert", "Please fill all required fields");
      return;
    }

    if (isNaN(Number(form.amount))) {
      Alert.alert("Invalid Amount");
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO Purchase 
        (InvoiceNo, invoiceDate, supplyId, amount, narration)
        VALUES (?, ?, ?, ?, ?)`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.supplyId,
          Number(form.amount),
          form.narration,
        ],
      );

      Alert.alert("Success", "Purchase added");

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        supplyId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  /* Load Invoices */
  const loadInvoicesBySupplier = async (supplierId: number) => {
    setFilterSupplierId(supplierId);
    setSelectedInvoiceId(null);

    const result = await db.getAllAsync(
      "SELECT id, InvoiceNo FROM Purchase WHERE supplyId = ?",
      [supplierId],
    );

    setInvoiceList(result);
  };

  /* Load Purchase Details */
  const loadPurchaseDetails = async (id: number) => {
    setSelectedInvoiceId(id);

    const result = await db.getFirstAsync<Purchase>(
      "SELECT * FROM Purchase WHERE id = ?",
      [id],
    );

    if (result) {
      setForm({
        invoiceNo: result.InvoiceNo,
        invoiceDate: result.invoiceDate,
        supplyId: result.supplyId,
        amount: String(result.amount),
        narration: result.narration || "",
      });
    }
  };

  /* Update */
  const handleUpdate = async () => {
    if (!selectedInvoiceId) {
      Alert.alert("Error", "No invoice selected");
      return;
    }

    if (
      !form.invoiceNo ||
      !form.invoiceDate ||
      !form.supplyId ||
      !form.amount
    ) {
      Alert.alert("All fields required");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE Purchase SET 
        InvoiceNo=?, invoiceDate=?, supplyId=?, amount=?, narration=? 
        WHERE id=?`,
        [
          form.invoiceNo,
          form.invoiceDate,
          form.supplyId,
          Number(form.amount),
          form.narration,
          selectedInvoiceId,
        ],
      );

      Alert.alert("Updated successfully");

      setShowModifyModal(false);
      setFilterSupplierId(null);
      setInvoiceList([]);
      setSelectedInvoiceId(null);

      setForm({
        invoiceNo: "",
        invoiceDate: "",
        supplyId: null,
        amount: "",
        narration: "",
      });

      setRefreshList((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <ScrollView className='flex-1 px-4 py-4'>
      <View className='px-4 py-4'>
        {/* FORM */}
        <View className='w-full max-w-md self-center space-y-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-8'>
          <Text className='text-base font-medium pb-2'>Invoice Number</Text>
          <TextInput
            placeholder='Enter Invoice Number'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            value={form?.invoiceNo || ""}
            onChangeText={(t) => setForm({ ...form, invoiceNo: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Invoice Date</Text>
          <Pressable
            onPress={() => setShowDatePickerMain(true)}
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white flex-row items-center justify-between'
          >
            <Text>{form?.invoiceDate || "Select Date"}</Text>
            <MaterialIcons name='calendar-today' size={22} color='gray' />
          </Pressable>

          {showDatePickerMain && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode='date'
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowDatePickerMain(false); // FIX: prevent multiple triggers (Android)

                if (date) {
                  setSelectedDate(date);
                  setForm({
                    ...form,
                    invoiceDate: date.toISOString().split("T")[0], // YYYY-MM-DD
                  });
                }
              }}
            />
          )}

          <Text className='text-base font-medium mt-4 pb-2'>Supplier Name</Text>
          <View className='rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'>
            <Picker
              selectedValue={form?.supplyId || ""}
              onValueChange={(v) => setForm({ ...form, supplyId: v })}
            >
              <Picker.Item label='Select Supplier' value='' />
              {supplyList?.map((s) => (
                <Picker.Item key={s.id} label={s.supplyName} value={s.id} />
              ))}
            </Picker>
          </View>

          <Text className='text-base font-medium mt-4 pb-2'>Amount</Text>
          <TextInput
            placeholder='Enter Amount'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white'
            keyboardType='numeric'
            value={form?.amount || ""}
            onChangeText={(t) => setForm({ ...form, amount: t })}
          />

          <Text className='text-base font-medium mt-4 pb-2'>Narration</Text>
          <TextInput
            placeholder='Enter Narration'
            className='w-full h-14 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base text-black dark:text-white flex-row items-center justify-between'
            value={form?.narration || ""}
            onChangeText={(t) => setForm({ ...form, narration: t })}
          />
        </View>

        {/* BUTTONS */}
        <View className='flex-row justify-center gap-4'>
          <Button title='Submit' onPress={handleSubmit} />
          <Button title='Modify' onPress={() => setShowModifyModal(true)} />
        </View>

        {/* MODAL */}
        <Modal visible={showModifyModal} transparent>
          <View className='flex-1 justify-center items-center bg-black/40'>
            <View className='bg-white p-5 w-[90%] rounded-xl'>
              <Text>Supplier</Text>
              <Picker
                selectedValue={filterSupplierId}
                onValueChange={(v) => {
                  if (v !== null) loadInvoicesBySupplier(v);
                }}
              >
                <Picker.Item label='Select Supplier' value={null} />
                {supplyList.map((s) => (
                  <Picker.Item key={s.id} label={s.supplyName} value={s.id} />
                ))}
              </Picker>

              {invoiceList.length > 0 && (
                <Picker
                  selectedValue={selectedInvoiceId}
                  onValueChange={(v) => {
                    if (v !== null) loadPurchaseDetails(v);
                  }}
                >
                  <Picker.Item label='Select Invoice' value={null} />
                  {invoiceList.map((i) => (
                    <Picker.Item key={i.id} label={i.InvoiceNo} value={i.id} />
                  ))}
                </Picker>
              )}

              {selectedInvoiceId && (
                <>
                  <TextInput
                    value={form.invoiceNo}
                    onChangeText={(t) => setForm({ ...form, invoiceNo: t })}
                  />

                  <Pressable onPress={() => setShowDatePickerModal(true)}>
                    <Text>{form.invoiceDate}</Text>
                  </Pressable>

                  {showDatePickerModal && (
                    <DateTimePicker
                      value={selectedDate}
                      mode='date'
                      onChange={onDateChange}
                    />
                  )}

                  <TextInput
                    value={form.amount}
                    onChangeText={(t) => setForm({ ...form, amount: t })}
                  />

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

        {/* NAV */}
        <Link
          href={{
            pathname: "/Transaction/forms/showPurchase",
            params: { refresh: refreshList ? "1" : "0" },
          }}
        >
          <Text>Show Purchase</Text>
        </Link>
      </View>
    </ScrollView>
  );
};

export default Purchase;
