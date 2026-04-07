import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";
import database from "./Database/exportDatabase";

export default function Index() {
  const router = useRouter();
  const nextpage = () => {
    router.push("/(user)");
  };

  return (
    <View className=' flex-1 items-center justify-center'>
      <Text className=''>Len den Khata Project </Text>
      <Button title='Login' onPress={nextpage} />
      <Button title='Get database' onPress={database} />
    </View>
  );
}
