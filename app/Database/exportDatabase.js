import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const exportDatabase = async () => {
  try {
    const dbName = "lenDenKhata.db"; // ✅ your DB name
    const dbUri = FileSystem.documentDirectory + "SQLite/" + dbName;

    console.log("DB Path:", dbUri);

    const fileInfo = await FileSystem.getInfoAsync(dbUri);

    if (!fileInfo.exists) {
      console.log("❌ Database file not found!");
      return;
    }

    console.log("✅ Database found, exporting...");

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(dbUri);
    } else {
      console.log("❌ Sharing not available");
    }
  } catch (error) {
    console.log("Error:", error);
  }
};

export default exportDatabase