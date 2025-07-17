import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Inventory,
  Warning,
  LocalShipping,
  AttachMoney,
  Category,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Medication' | 'Equipment' | 'Supplies' | 'Devices';
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      category: 'Medication',
      quantity: 150,
      minQuantity: 50,
      unit: 'Tablets',
      price: 0.25,
      supplier: 'PharmaCorp',
      expiryDate: '2025-06-15',
      status: 'In Stock',
      location: 'Pharmacy A',
    },
    {
      id: '2',
      name: 'Surgical Masks',
      category: 'Supplies',
      quantity: 25,
      minQuantity: 100,
      unit: 'Boxes',
      price: 15.00,
      supplier: 'MedSupply Co',
      expiryDate: '2026-12-01',
      status: 'Low Stock',
      location: 'Storage B',
    },
    {
      id: '3',
      name: 'Blood Pressure Monitor',
      category: 'Equipment',
      quantity: 8,
      minQuantity: 5,
      unit: 'Units',
      price: 250.00,
      supplier: 'MedTech Inc',
      expiryDate: '2027-03-20',
      status: 'In Stock',
      location: 'Equipment Room',
    },
    {
      id: '4',
      name: 'IV Catheters',
      category: 'Supplies',
      quantity: 0,
      minQuantity: 200,
      unit: 'Pieces',
      price: 2.50,
      supplier: 'CareSupply',
      expiryDate: '2025-09-10',
      status: 'Out of Stock',
      location: 'Storage A',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setViewMode(true);
    } else {
      setSelectedItem({
        id: '',
        name: '',
        category: 'Medication',
        quantity: 0,
        minQuantity: 0,
        unit: '',
        price: 0,
        supplier: '',
        expiryDate: new Date().toISOString().split('T')[0],
        status: 'In Stock',
        location: '',
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setViewMode(false);
  };

  const handleSaveItem = () => {
    if (selectedItem) {
      if (viewMode) {
        setInventory(inventory.map(i => i.id === selectedItem.id ? selectedItem : i));
        toast.success('Inventory item updated successfully');
      } else {
        const newItem = { ...selectedItem, id: Date.now().toString() };
        setInventory([...inventory, newItem]);
        toast.success('Inventory item added successfully');
      }
      handleCloseDialog();
    }
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(i => i.id !== id));
    toast.success('Inventory item deleted successfully');
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'primary';
      case 'Equipment':
        return 'secondary';
      case 'Supplies':
        return 'info';
      case 'Devices':
        return 'warning';
      default:
        return 'default';
    }
  };

  const categories = ['Medication', 'Equipment', 'Supplies', 'Devices'];
  const units = ['Tablets', 'Boxes', 'Units', 'Pieces', 'Bottles', 'Packs', 'Kits'];

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'Low Stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'Out of Stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 'bold' }}
        >
          Add Item
        </Button>
      </Box>

      {/* Alerts */}
      {lowStockItems > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {lowStockItems} items are running low on stock. Please reorder soon.
        </Alert>
      )}
      {outOfStockItems > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {outOfStockItems} items are out of stock. Immediate reorder required.
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Items</Typography>
              <Typography variant="h4">{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Low Stock</Typography>
              <Typography variant="h4">{lowStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Out of Stock</Typography>
              <Typography variant="h4">{outOfStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Value</Typography>
              <Typography variant="h4">${totalValue.toFixed(0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="In Stock">In Stock</MenuItem>
                  <MenuItem value="Low Stock">Low Stock</MenuItem>
                  <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Total: {filteredInventory.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.category}
                        color={getCategoryColor(item.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {item.quantity} {item.unit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Min: {item.minQuantity}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: ${(item.quantity * item.price).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                        color="secondary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Inventory Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {viewMode ? 'View/Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedItem.category}
                    label="Category"
                    onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value as any })}
                    disabled={viewMode}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={selectedItem.quantity}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Quantity"
                  type="number"
                  value={selectedItem.minQuantity}
                  onChange={(e) => setSelectedItem({ ...selectedItem, minQuantity: parseInt(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={selectedItem.unit}
                    label="Unit"
                    onChange={(e) => setSelectedItem({ ...selectedItem, unit: e.target.value })}
                    disabled={viewMode}
                  >
                    {units.map(unit => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price per Unit"
                  type="number"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier"
                  value={selectedItem.supplier}
                  onChange={(e) => setSelectedItem({ ...selectedItem, supplier: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  value={selectedItem.expiryDate}
                  onChange={(e) => setSelectedItem({ ...selectedItem, expiryDate: e.target.value })}
                  disabled={viewMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={selectedItem.location}
                  onChange={(e) => setSelectedItem({ ...selectedItem, location: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {!viewMode && (
            <Button onClick={handleSaveItem} variant="contained">
              Save Item
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;