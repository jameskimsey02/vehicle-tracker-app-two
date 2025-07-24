
import { useEffect, useState } from "react";

export default function VehicleTracker() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    VIN: "",
    MakeModelYear: "",
    Color: "",
    DatePurchased: "",
    Location: "",
    Notes: "",
    Status: "",
    Stages: ""
  });

  const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbxVXbI-wrk72FHunURmwXhPno1ob5Stysn64CaFcnI/exec";

  useEffect(() => {
    fetch(GOOGLE_SHEETS_API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Unexpected data format returned from API");
        }
        setVehicles(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? "" : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleSubmit = () => {
    fetch(GOOGLE_SHEETS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVehicle)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`POST failed: ${res.status}`);
        }
        return res.text();
      })
      .then(() => {
        alert("Vehicle added successfully");
        setNewVehicle({ VIN: "", MakeModelYear: "", Color: "", DatePurchased: "", Location: "", Notes: "", Status: "", Stages: "" });
        return fetch(GOOGLE_SHEETS_API_URL);
      })
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => {
        console.error("Submission error:", err);
        alert("Error submitting vehicle: " + err.message);
      });
  };

  if (loading) return <p>Loading vehicle data...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle Inventory (Updated)</h1>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add New Vehicle</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(newVehicle).map(([key, val]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{key}</label>
              <input
                type="text"
                name={key}
                value={val}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">VIN</th>
            <th className="border p-2">Make/Model/Year</th>
            <th className="border p-2">Color</th>
            <th className="border p-2">Date Purchased</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Notes</th>
            <th className="border p-2">Stages</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v, i) => (
            <tr key={i} className="border-t">
              <td className="border p-2">{v.VIN}</td>
              <td className="border p-2">{v.MakeModelYear}</td>
              <td className="border p-2">{v.Color}</td>
              <td className="border p-2">{formatDate(v.DatePurchased)}</td>
              <td className="border p-2">{v.Location}</td>
              <td className="border p-2">{v.Status}</td>
              <td className="border p-2">{v.Notes}</td>
              <td className="border p-2">{v["Stages (JSON)"] || v.Stages || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
