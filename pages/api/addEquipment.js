import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, imageUrl, status } = req.body; // 장비 정보 받기

  try {
    const docRef = await addDoc(collection(db, "equipments"), {
      name,
      imageUrl,
      status,
    });

    res.status(200).json({ message: "장비 추가 완료!", id: docRef.id });
  } catch (error) {
    res.status(500).json({ message: "장비 추가 실패", error });
  }
}
