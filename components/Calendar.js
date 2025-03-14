import { useEffect, useState } from "react";

export default function Calendar() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function fetchReservations() {
      const response = await fetch("/api/getReservations");
      const data = await response.json();
      setReservations(data);
    }
    fetchReservations();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h3>예약 일정</h3>
      <ul>
        {reservations.map((res, index) => (
          <li key={index}>
            {res.date}: {res.equipment}
          </li>
        ))}
      </ul>
    </div>
  );
}
