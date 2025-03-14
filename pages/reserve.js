import { useState, useEffect } from "react";

const equipmentList = [
  { name: "DSLR 카메라", image: "/images/dslr.jpg", note: "고화질 촬영 가능" },
  { name: "조명 장비", image: "/images/light.jpg", note: "스튜디오 촬영용" },
  { name: "삼각대", image: "/images/tripod.jpg", note: "안정적인 촬영 가능" },
];

export default function Reserve() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState(""); // ✅ 대여 시작 시간
  const [endTime, setEndTime] = useState(""); // ✅ 대여 종료 시간
  const [cart, setCart] = useState([]); // ✅ 장바구니 상태
  const [reservedEquipments, setReservedEquipments] = useState([]);

  // ✅ Firestore에서 예약 목록 자동 로드
  useEffect(() => {
    const fetchReservedEquipments = async () => {
      try {
        const response = await fetch("/api/getReservations");
        const data = await response.json();
        setReservedEquipments(data);
      } catch (error) {
        console.error("🚨 예약된 장비 불러오기 실패");
      }
    };

    fetchReservedEquipments();
  }, [startDate, endDate]);

  const isReserved = (equipmentName) => {
    return reservedEquipments.some(
      (res) =>
        res.equipment === equipmentName &&
        res.startDate <= endDate &&
        res.endDate >= startDate
    );
  };

  // ✅ 장바구니에 추가
  const addToCart = (equipment) => {
    if (!cart.includes(equipment)) {
      setCart([...cart, equipment]);
    }
  };

  // ✅ 장바구니에서 삭제
  const removeFromCart = (equipment) => {
    setCart(cart.filter((item) => item !== equipment));
  };

  // ✅ 예약 요청 (시간 추가)
  const makeReservation = async () => {
    if (cart.length === 0 || !startDate || !endDate || !startTime || !endTime) {
      alert("🚨 대여 기간과 시간을 선택해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipment: cart, startDate, endDate, startTime, endTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("✅ 예약이 완료되었습니다!");
      setCart([]); // ✅ 예약 후 장바구니 초기화
    } catch (error) {
      alert("🚨 예약 실패: " + error.message);
    }
  };

  // ✅ 시간 선택 옵션 (09:00~17:00, 10분 단위)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let min = 0; min < 60; min += 10) {
        if (hour === 17 && min > 0) break;
        const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        times.push(time);
      }
    }
    return times;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>장비 예약</h2>

      {/* 날짜 선택 */}
      <label>대여 시작 날짜:</label>
      <input type="date" onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

      <label>대여 종료 날짜:</label>
      <input type="date" onChange={(e) => setEndDate(e.target.value)} min={startDate} max={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 7)).toISOString().split("T")[0] : ""} disabled={!startDate} />

      {/* 시간 선택 */}
      <label>대여 시작 시간:</label>
      <select onChange={(e) => setStartTime(e.target.value)}>
        <option value="">시간 선택</option>
        {generateTimeOptions().map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>

      <label>대여 종료 시간:</label>
      <select onChange={(e) => setEndTime(e.target.value)} disabled={!startTime}>
        <option value="">시간 선택</option>
        {generateTimeOptions().map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>

      {/* 장비 목록 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "20px" }}>
        {equipmentList.map((equip) => (
          <div key={equip.name} style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px", textAlign: "center", backgroundColor: isReserved(equip.name) ? "#ffdddd" : "#ddffdd", position: "relative" }}>
            <img src={equip.image} alt={equip.name} style={{ width: "100px", height: "100px" }} />
            <h4>{equip.name}</h4>
            <p>{equip.note}</p>
            {isReserved(equip.name) ? <p style={{ color: "red", fontWeight: "bold" }}>❌ 예약 불가</p> : <p style={{ color: "green", fontWeight: "bold" }}>✅ 예약 가능</p>}
            {!isReserved(equip.name) && (
              <button className="reserve-btn" style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", backgroundColor: "blue", color: "white", border: "none", padding: "5px", cursor: "pointer" }} onClick={() => addToCart(equip.name)}>
                장바구니 담기
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 장바구니 */}
      {cart.length > 0 && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "10px", padding: "10px", width: "200px", boxShadow: "2px 2px 10px rgba(0,0,0,0.1)" }}>
          <h4>장바구니</h4>
          <ul>{cart.map((item) => (<li key={item}>{item} <button onClick={() => removeFromCart(item)}>❌</button></li>))}</ul>
          <button onClick={makeReservation}>예약하기</button>
        </div>
      )}
    </div>
  );
}
