// pages/admin/clients.js
// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Card,
  Stack,
  alpha,
  Grid
} from '@mui/material'
import { NextSeo } from 'next-seo'
import LockIcon from '@mui/icons-material/Lock'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import SaveIcon from '@mui/icons-material/Save'
import PhoneIcon from '@mui/icons-material/Phone'

function AdminClientsPage() {
  // State for password authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  // State for clients data
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for create/edit dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [clientForm, setClientForm] = useState({
    customer: '',
    phone: '',
    permitting: 'Pending',
    order_status: 'Confirmed',
    shell_delivery_date: 'TBD',
    opening_date: 'TBD',
    shell_drop: 'TBD',
    closing_date: 'TBD',
    plumbing_pressure_test: 'TBD',
    equipment_set: 'TBD',
    collar_footer_pour: 'TBD',
    decking: 'TBD',
    inspection_status: 'Not Started',
    final: 'TBD',
    progress: 0
  })
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  
  // State for polling interval
  const [pollingInterval, setPollingInterval] = useState(null)
  
  // Handle password submission
  // @ts-ignore
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    
    // Simple password check - you would want to replace this with a more secure solution
    if (password === 'admin123') {
      setIsAuthenticated(true)
      setPasswordError(false)
      fetchClients()
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchClients(false) // Fetch without showing loading state
      }, 10000) // Poll every 10 seconds
      
      setPollingInterval(interval)
    } else {
      setPasswordError(true)
    }
  }
  
  // Fetch clients from the API
  const fetchClients = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }
    
    try {
      const response = await fetch('/api/clients')
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      
      const data = await response.json()
      setClients(data.clients)
      setError(null)
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Failed to load clients. Please try again.')
      setSnackbar({
        open: true,
        message: 'Failed to load clients. Please try again.',
        severity: 'error'
      })
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }
  
  // Handle dialog open for create/edit
  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditingClient(client)
      setClientForm({
        customer: client.customer,
        phone: client.phone || '',
        permitting: client.permitting,
        order_status: client.order_status,
        shell_delivery_date: client.shell_delivery_date,
        opening_date: client.opening_date,
        shell_drop: client.shell_drop,
        closing_date: client.closing_date,
        plumbing_pressure_test: client.plumbing_pressure_test,
        equipment_set: client.equipment_set,
        collar_footer_pour: client.collar_footer_pour,
        decking: client.decking,
        inspection_status: client.inspection_status,
        final: client.final,
        progress: client.progress
      })
    } else {
      setEditingClient(null)
      setClientForm({
        customer: '',
        phone: '',
        permitting: 'Pending',
        order_status: 'Confirmed',
        shell_delivery_date: 'TBD',
        opening_date: 'TBD',
        shell_drop: 'TBD',
        closing_date: 'TBD',
        plumbing_pressure_test: 'TBD',
        equipment_set: 'TBD',
        collar_footer_pour: 'TBD',
        decking: 'TBD',
        inspection_status: 'Not Started',
        final: 'TBD',
        progress: 0
      })
    }
    
    setOpenDialog(true)
  }
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingClient(null)
  }
  
  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setClientForm(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) : value
    }))
  }
  
  // Handle form submission
  const handleSubmitClient = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const url = editingClient 
        ? `/api/clients/${editingClient.id}` 
        : '/api/clients'
      
      const method = editingClient ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientForm)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingClient ? 'update' : 'create'} client`)
      }
      
      await fetchClients()
      
      setSnackbar({
        open: true,
        message: `Client ${editingClient ? 'updated' : 'created'} successfully`,
        severity: 'success'
      })
      
      handleCloseDialog()
    } catch (err) {
      console.error(`Error ${editingClient ? 'updating' : 'creating'} client:`, err)
      setSnackbar({
        open: true,
        message: `Failed to ${editingClient ? 'update' : 'create'} client. Please try again.`,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Handle delete client - open confirmation
  const handleDeleteClick = (client) => {
    setClientToDelete(client)
    setDeleteConfirmOpen(true)
  }
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/clients/${clientToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete client')
      }
      
      await fetchClients()
      
      setSnackbar({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success'
      })
    } catch (err) {
      console.error('Error deleting client:', err)
      setSnackbar({
        open: true,
        message: 'Failed to delete client. Please try again.',
        severity: 'error'
      })
    } finally {
      setDeleteConfirmOpen(false)
      setClientToDelete(null)
      setLoading(false)
    }
  }
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }
  
  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])
  
  // Status options for dropdowns
  const permitOptions = ['Approved', 'Pending', 'Rejected', 'In Review']
  const orderStatusOptions = ['Completed', 'In Progress', 'Confirmed', 'On Hold']
  const inspectionStatusOptions = ['Scheduled', 'Passed', 'Not Started']

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      'Approved': '#4caf50',
      'Pending': '#ff9800',
      'Rejected': '#f44336',
      'In Review': '#2196f3',
      'Completed': '#4caf50',
      'In Progress': '#2196f3',
      'On Hold': '#ff9800',
      'Scheduled': '#2196f3',
      'Passed': '#4caf50',
      'Not Started': '#9e9e9e'
    }
    return statusColors[status] || '#757575'
  }

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress === 100) return '#4caf50'
    if (progress > 60) return '#2196f3' 
    if (progress > 30) return '#ff9800'
    return '#f44336'
  }

  // Render password screen or table view based on authentication state
  return (
    <>
      <div className="relative min-h-screen w-full bg-gray-50">
        {!isAuthenticated ? (
          // Password Screen
          <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ 
                p: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: 'background.paper'
              }}>
                <Box sx={{ 
                  backgroundColor: alpha('#1976d2', 0.1), 
                  p: 2,
                  borderRadius: '50%',
                  mb: 3
                }}>
                  <LockIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom 
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Admin Login
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  align="center" 
                  sx={{ mb: 4 }}
                >
                  Enter your password to access the dashboard
                </Typography>
                
                <Box component="form" onSubmit={handlePasswordSubmit} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    helperText={passwordError ? "Incorrect password" : ""}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                    autoFocus
                  />
                  
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </Box>
            </Card>
          </Container>
        ) : (
          // Admin Table View
          <Box sx={{ px: 3, py: 3, maxWidth: '100vw' }}>
            {/* Header and action toolbar */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Clients Dashboard
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Add Client
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchClients()}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>
            
            {/* Loading indicator */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CircularProgress size={24} thickness={4} />
              </Box>
            )}
            
            {/* Error message */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}
            
            {/* Clients table */}
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                mb: 3
              }}
            >
              <TableContainer sx={{ maxHeight: 'calc(100vh - 180px)' }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Customer
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Permitting
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Order Status
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Shell Delivery
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Dig Date
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Shell Drop
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Plumbing Test
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Backfill Date
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Equipment Set
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Footer Pour
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Decking
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Inspection Status
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Final
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Progress
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow 
                        key={client.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: alpha('#1976d2', 0.03) 
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography fontWeight={500} sx={{ mr: 1 }}>
                              {client.customer}
                            </Typography>
                            {client.phone && (
                              <IconButton 
                                size="small" 
                                color="primary"
                                sx={{ 
                                  ml: 0.5, 
                                  backgroundColor: alpha('#1976d2', 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha('#1976d2', 0.2),
                                  } 
                                }}
                                onClick={() => window.open(`/clients/${client.phone}`, '_blank')}
                              >
                                <PhoneIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={client.permitting}
                            size="small"
                            sx={{ 
                              backgroundColor: alpha(getStatusColor(client.permitting), 0.1),
                              color: getStatusColor(client.permitting),
                              fontWeight: 500,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={client.order_status}
                            size="small"
                            sx={{ 
                              backgroundColor: alpha(getStatusColor(client.order_status), 0.1),
                              color: getStatusColor(client.order_status),
                              fontWeight: 500,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell>{client.shell_delivery_date}</TableCell>
                        <TableCell>{client.opening_date}</TableCell>
                        <TableCell>{client.shell_drop}</TableCell>
                        <TableCell>{client.plumbing_pressure_test}</TableCell>
                        <TableCell>{client.closing_date}</TableCell>
                        <TableCell>{client.equipment_set}</TableCell>
                        <TableCell>{client.collar_footer_pour}</TableCell>
                        <TableCell>{client.decking}</TableCell>
                        <TableCell>
                          <Chip
                            label={client.inspection_status}
                            size="small"
                            sx={{ 
                              backgroundColor: alpha(getStatusColor(client.inspection_status), 0.1),
                              color: getStatusColor(client.inspection_status),
                              fontWeight: 500,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell>{client.final}</TableCell>
                        <TableCell>
                          <Box sx={{ width: '150px', display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={client.progress} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: alpha(getProgressColor(client.progress), 0.15),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getProgressColor(client.progress)
                                  }
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: getProgressColor(client.progress),
                                fontWeight: 600,
                                width: 40
                              }}
                            >
                              {`${client.progress}%`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton 
                              size="small"
                              onClick={() => handleOpenDialog(client)}
                              sx={{ 
                                color: 'primary.main',
                                backgroundColor: alpha('#1976d2', 0.1),
                                '&:hover': {
                                  backgroundColor: alpha('#1976d2', 0.2),
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteClick(client)}
                              sx={{ 
                                color: 'error.main',
                                backgroundColor: alpha('#f44336', 0.1),
                                '&:hover': {
                                  backgroundColor: alpha('#f44336', 0.2),
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
            
            {/* Create/Edit Dialog */}
            <Dialog 
              open={openDialog} 
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="md"
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{ 
                py: 2,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" fontWeight={600}>
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </DialogTitle>
              
              <form onSubmit={handleSubmitClient}>
                <DialogContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {/* Customer Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Customer Name"
                        name="customer"
                        value={clientForm.customer}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Phone Number */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={clientForm.phone}
                        onChange={handleFormChange}
                        variant="outlined"
                        placeholder="For client portal access"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Permitting Status */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Permitting Status</InputLabel>
                        <Select
                          name="permitting"
                          value={clientForm.permitting}
                          onChange={handleFormChange}
                          label="Permitting Status"
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {permitOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Order Status */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Order Status</InputLabel>
                        <Select
                          name="order_status"
                          value={clientForm.order_status}
                          onChange={handleFormChange}
                          label="Order Status"
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {orderStatusOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Progress */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Progress (%)"
                        name="progress"
                        value={clientForm.progress}
                        onChange={handleFormChange}
                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Shell Delivery Date */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Shell Delivery Date"
                        name="shell_delivery_date"
                        value={clientForm.shell_delivery_date}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Opening Date */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Opening Date"
                        name="opening_date"
                        value={clientForm.opening_date}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Shell Drop */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Shell Drop"
                        name="shell_drop"
                        value={clientForm.shell_drop}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>

                    {/* Plumbing Pressure Test */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Plumbing Pressure Test"
                        name="plumbing_pressure_test"
                        value={clientForm.plumbing_pressure_test}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Closing Date */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Closing Date"
                        name="closing_date"
                        value={clientForm.closing_date}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Equipment Set */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Equipment Set"
                        name="equipment_set"
                        value={clientForm.equipment_set}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                      </Grid>
                    
                    {/* Collar/Footer Pour */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Collar/Footer Pour"
                        name="collar_footer_pour"
                        value={clientForm.collar_footer_pour}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Decking */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Decking"
                        name="decking"
                        value={clientForm.decking}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Inspection Status */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Inspection Status</InputLabel>
                        <Select
                          name="inspection_status"
                          value={clientForm.inspection_status}
                          onChange={handleFormChange}
                          label="Inspection Status"
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {inspectionStatusOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Final */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Final"
                        name="final"
                        value={clientForm.final}
                        onChange={handleFormChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                
                <DialogActions sx={{ 
                  p: 3, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  justifyContent: 'flex-end'
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleCloseDialog}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none', 
                      mr: 1
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} thickness={4} /> : <SaveIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{ 
                py: 2,
                px: 3,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" fontWeight={600}>
                  Confirm Delete
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: 3, pt: 2 }}>
                <Typography variant="body1">
                  Are you sure you want to delete <strong>{clientToDelete?.customer}</strong>? 
                  This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ 
                p: 2,
                px: 3,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                <Button 
                  onClick={() => setDeleteConfirmOpen(false)} 
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm} 
                  color="error" 
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Snackbar notifications */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={5000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={handleSnackbarClose} 
                severity={snackbar.severity}
                variant="filled" 
                sx={{ 
                  borderRadius: 2,
                  fontWeight: 500
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </div>
    </>
  )
}

export default AdminClientsPage