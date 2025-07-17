import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

interface Prescription {
  id: number;
  patient_id: number;
  first_name: string;
  last_name: string;
  drug_name: string;
  dosage: string;
  instructions: string;
  status: string;
}

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4000/api/pharmacy");
      setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dispense = async (id: number) => {
    try {
      await axios.post(`http://localhost:4000/api/pharmacy/${id}/dispense`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Pharmacy
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Drug</TableCell>
              <TableCell>Dosage</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.first_name} {p.last_name}
                </TableCell>
                <TableCell>{p.drug_name}</TableCell>
                <TableCell>{p.dosage}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>
                  {p.status !== "dispensed" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => dispense(p.id)}
                    >
                      Dispense
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}