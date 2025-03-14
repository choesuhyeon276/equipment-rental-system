import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const reservationsRef = collection(db, "reservations");
    const querySnapshot = await getDocs(reservationsRef);

    const reservations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("📌 예약 목록 불러오기 성공:", reservations);
    res.status(200).json(reservations);
  } catch (error) {
    console.log("🚨 에러 발생:", error.message);
    res.status(500).json({ message: "예약 목록 조회 실패", error });
  }
}
