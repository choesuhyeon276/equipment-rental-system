import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { google } from "googleapis";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const KEYFILEPATH = path.join(process.cwd(), "service-account.json");

// 🔥 **캘린더 ID 자동 입력됨!**
const CALENDAR_ID = "837ac43ba185f6e8b56e97f1f7e15ecbb103bc44c111e6b8c81fe28ec713b8e9@group.calendar.google.com"; 

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 🔥 프론트엔드에서 전달된 데이터 받기
  const { equipment, startDate, endDate, startTime, endTime } = req.body;

  try {
    // ✅ Firestore에 예약 정보 저장
    const reservationsRef = collection(db, "reservations");
    await addDoc(reservationsRef, { equipment, startDate, endDate, startTime, endTime });

    // ✅ Google 캘린더에 이벤트 추가
    const event = {
      summary: `장비 예약: ${equipment.join(", ")}`, // 장비 여러 개 예약 가능
      start: { dateTime: `${startDate}T${startTime}:00+09:00`, timeZone: "Asia/Seoul" },
      end: { dateTime: `${endDate}T${endTime}:00+09:00`, timeZone: "Asia/Seoul" },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    console.log("📅 Google 캘린더에 일정 추가 완료:", calendarResponse.data.id);

    res.status(200).json({ message: "예약 성공!", eventId: calendarResponse.data.id });
  } catch (error) {
    console.log("🚨 에러 발생:", error.message);
    res.status(500).json({ message: "예약 실패", error: error.message });
  }
}
