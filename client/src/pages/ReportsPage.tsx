import { useEffect, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [appointmentData, setAppointmentData] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        // Fetch appointments per day (last 7 days)
        const { data: appts } = await axios.get(
          "http://localhost:4000/api/appointments" // would be improved with dedicated stats endpoint
        );
        // simple aggregation client-side
        const counts: Record<string, number> = {};
        appts.forEach((a: any) => {
          const d = new Date(a.appointment_date).toLocaleDateString();
          counts[d] = (counts[d] || 0) + 1;
        });
        const labelsArr = Object.keys(counts);
        setLabels(labelsArr);
        setAppointmentData(labelsArr.map((l) => counts[l]));

        // Fetch invoices for revenue
        const { data: invoices } = await axios.get("http://localhost:4000/api/billing");
        const revCounts: Record<string, number> = {};
        invoices.forEach((inv: any) => {
          const d = new Date(inv.created_at).toLocaleDateString();
          revCounts[d] = (revCounts[d] || 0) + Number(inv.amount);
        });
        setRevenueData(labelsArr.map((l) => revCounts[l] || 0));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Reports
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Bar
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" as const },
              title: { display: true, text: "Appointments & Revenue" },
            },
          }}
          data={{
            labels,
            datasets: [
              {
                label: "Appointments",
                data: appointmentData,
                backgroundColor: "rgba(53, 162, 235, 0.5)",
              },
              {
                label: "Revenue",
                data: revenueData,
                backgroundColor: "rgba(75, 192, 192, 0.5)",
              },
            ],
          }}
        />
      )}
    </div>
  );
}