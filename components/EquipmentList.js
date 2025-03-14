import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function EquipmentList() {
  const [equipments, setEquipments] = useState([]);

  useEffect(() => {
    async function fetchEquipments() {
      const querySnapshot = await getDocs(collection(db, "equipments"));
      const equipmentData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEquipments(equipmentData);
    }
    fetchEquipments();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h3>장비 목록</h3>
      <ul>
        {equipments.map((eq) => (
          <li key={eq.id}>
            <img src={eq.imageUrl} alt={eq.name} width="50" /> {eq.name} ({eq.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
