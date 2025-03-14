import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { google } from "googleapis";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const KEYFILEPATH = path.join(process.cwd(), "service-account.json");
const CALENDAR_ID = "837ac43ba185f6e8b56e97f1f7e15ecbb103bc44c111e6b8c81fe28ec713b8e9@group.calendar.google.com";

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { equipment, date } = req.body;
  const formattedDate = new Date(date).toISOString().split("T")[0];

  try {
    // 🔍 Firestore에서 해당 예약 찾기
    const reservationsRef = collection(db, "reservations");
    const q = query(
      reservationsRef,
      where("equipment", "==", equipment),
      where("date", "==", formattedDate)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("해당 예약을 찾을 수 없습니다.");
    }

    // ✅ Firestore에서 예약 삭제 + eventId 가져오기
    const doc = querySnapshot.docs[0]; // 첫 번째 문서 가져오기
    const eventId = doc.data().eventId; // ✅ eventId 가져오기
    await deleteDoc(doc.ref);

    console.log("🗑 Firestore에서 예약 삭제 완료");

    // ✅ Google 캘린더에서 정확한 이벤트 삭제
    if (eventId) {
      await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId,
      });

      console.log("🗑 Google 캘린더에서 이벤트 삭제 완료");
    } else {
      console.log("⚠️ Google 캘린더 이벤트 ID가 없음, 삭제 생략");
    }

    res.status(200).json({ message: "예약 취소 성공!" });
  } catch (error) {
    console.log("🚨 에러 발생:", error.message);
    res.status(400).json({ message: error.message });
  }
}

const cancelReservation = async () => {
    if (!equipment || !date) {
      alert("🚨 취소할 예약을 선택해주세요.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/cancelReservation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipment, date }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }
  
      alert("🗑 예약이 취소되었습니다!");
      setDate(""); // 🔥 예약 취소 후 날짜 선택 초기화
    } catch (error) {
      alert("🚨 예약 취소 실패: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  