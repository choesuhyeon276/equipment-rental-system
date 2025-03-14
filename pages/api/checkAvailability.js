import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { equipment, date } = req.body;
  const formattedDate = new Date(date).toISOString().split("T")[0]; // 🔥 YYYY-MM-DD 형식으로 변환

  console.log("✅ 받은 요청 데이터:", { equipment, date, formattedDate }); // 🚀 서버에서 받은 데이터 확인

  try {
    const reservationsRef = collection(db, "reservations");
    const q = query(
      reservationsRef,
      where("equipment", "==", equipment),
      where("date", "==", formattedDate) // 🔥 문자열 날짜 비교
    );

    const querySnapshot = await getDocs(q);
    console.log("📌 Firestore 조회 결과 개수:", querySnapshot.size); // 🚀 Firestore에서 가져온 데이터 개수 확인

    const isAvailable = querySnapshot.empty; // 예약된 데이터가 없으면 true
    console.log("🔍 서버에서 클라이언트로 보낼 값:", { available: isAvailable }); // 🚀 실제 응답 데이터 출력

    return res.status(200).json({ available: isAvailable });
  } catch (error) {
    console.log("🚨 서버 에러:", error.message);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
}
