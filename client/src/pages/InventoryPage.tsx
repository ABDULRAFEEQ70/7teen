import { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

interface Item {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("pcs");
  const [threshold, setThreshold] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4000/api/inventory");
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/inventory", {
        name,
        quantity,
        unit,
        threshold,
      });
      setSuccess(true);
      setError("");
      setName("");
      setQuantity(0);
      setUnit("pcs");
      setThreshold(0);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed");
      setSuccess(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Inventory Management
      </Typography>
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2} maxWidth={400}>
          {success && <Alert severity="success">Item added</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <TextField
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <TextField
            label="Threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
          <Button type="submit" variant="contained">
            Add Item
          </Button>
        </Stack>
      </form>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Current Stock
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Threshold</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.name}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell>{i.unit}</TableCell>
                <TableCell>{i.threshold}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}