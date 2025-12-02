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
  Grid,
  Tooltip,
  Fade,
  Slide
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
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

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
  console.log(password)

  // State for polling interval
  const [pollingInterval, setPollingInterval] = useState(null)

  // Handle password submission
  // @ts-ignore
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    console.log(password)
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

  // Calculate dashboard statistics
  const getDashboardStats = () => {
    const totalClients = clients.length
    const activeProjects = clients.filter(c => c.progress > 0 && c.progress < 100).length
    const completedProjects = clients.filter(c => c.progress === 100).length
    const avgProgress = clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.progress, 0) / clients.length)
      : 0

    return { totalClients, activeProjects, completedProjects, avgProgress }
  }

  // Status options for dropdowns
  const permitOptions = ['Approved', 'Pending', 'Rejected', 'In Review']
  const orderStatusOptions = ['Completed', 'In Progress', 'Confirmed', 'On Hold']
  const inspectionStatusOptions = ['Scheduled', 'Passed', 'Not Started']

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      'Approved': '#10b981',
      'Pending': '#f59e0b',
      'Rejected': '#ef4444',
      'In Review': '#3b82f6',
      'Completed': '#10b981',
      'In Progress': '#3b82f6',
      'On Hold': '#f59e0b',
      'Confirmed': '#8b5cf6',
      'Scheduled': '#3b82f6',
      'Passed': '#10b981',
      'Not Started': '#6b7280'
    }
    return statusColors[status] || '#6b7280'
  }

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress === 100) return '#10b981'
    if (progress >= 75) return '#3b82f6'
    if (progress >= 50) return '#8b5cf6'
    if (progress >= 25) return '#f59e0b'
    return '#ef4444'
  }

  const stats = getDashboardStats()

  // Render password screen or table view based on authentication state
  return (
    <>
      <NextSeo
        title="Admin Dashboard - Client Management"
        description="Manage your clients and projects"
      />
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!isAuthenticated ? (
          // Password Screen
          <Fade in={!isAuthenticated} timeout={600}>
            <Container maxWidth="sm" sx={{ py: 4 }}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  bgcolor: '#ffffff'
                }}
              >
                <Box sx={{
                  p: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Box sx={{
                    bgcolor: '#1e293b',
                    p: 2.5,
                    mb: 3
                  }}>
                    <LockIcon sx={{ fontSize: 48, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: '#1e293b'
                    }}
                  >
                    Admin Dashboard
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{ mb: 4, fontSize: '1rem' }}
                  >
                    Please authenticate to access the client management system
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
                      helperText={passwordError ? "Incorrect password. Please try again." : ""}
                      sx={{ mb: 3 }}
                      autoFocus
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        py: 1.75,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        bgcolor: '#1e293b',
                        '&:hover': {
                          bgcolor: '#0f172a'
                        }
                      }}
                    >
                      Access Dashboard
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Container>
          </Fade>
        ) : (
          // Admin Dashboard View
          <Box sx={{
            width: '100%',
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            py: 4
          }}>
            <Container maxWidth="xl">
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{
                    bgcolor: '#1e293b',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 0.5
                      }}
                    >
                      Client Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and monitor all client projects
                    </Typography>
                  </Box>
                </Stack>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white'
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Total Clients
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {stats.totalClients}
                          </Typography>
                        </Box>
                        <Box sx={{
                          bgcolor: '#f1f5f9',
                          p: 2
                        }}>
                          <PeopleIcon sx={{ fontSize: 32, color: '#1e293b' }} />
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white'
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Active Projects
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                            {stats.activeProjects}
                          </Typography>
                        </Box>
                        <Box sx={{
                          bgcolor: '#eff6ff',
                          p: 2
                        }}>
                          <TrendingUpIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white'
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Completed
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                            {stats.completedProjects}
                          </Typography>
                        </Box>
                        <Box sx={{
                          bgcolor: '#f0fdf4',
                          p: 2
                        }}>
                          <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Average Progress
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6', mb: 1.5 }}>
                          {stats.avgProgress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={stats.avgProgress}
                          sx={{
                            height: 6,
                            bgcolor: '#f3f4f6',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#8b5cf6'
                            }
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => fetchClients()}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc'
                      }
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#1e293b',
                      '&:hover': {
                        bgcolor: '#0f172a'
                      }
                    }}
                  >
                    Add New Client
                  </Button>
                </Stack>
              </Box>

              {/* Loading indicator */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <CircularProgress size={28} thickness={4} sx={{ color: '#1e293b' }} />
                </Box>
              )}

              {/* Error message */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: '#fee2e2'
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Clients table */}
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  bgcolor: 'white'
                }}
              >
                <TableContainer sx={{ maxHeight: 'calc(100vh - 500px)' }}>
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Customer
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Permitting
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Order Status
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Shell Delivery
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Dig Date
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Shell Drop
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Plumbing Test
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Backfill Date
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Equipment Set
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Footer Pour
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Decking
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Inspection
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Final
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
                        }}>
                          Progress
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          py: 2.5,
                          color: '#475569',
                          fontSize: '0.875rem',
                          borderBottom: '2px solid',
                          borderColor: '#e2e8f0'
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
                              bgcolor: '#f8fafc'
                            },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={600} sx={{ color: '#1e293b' }}>
                                {client.customer}
                              </Typography>
                              {client.phone && (
                                <Tooltip title="View client portal">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      bgcolor: '#f1f5f9',
                                      color: '#1e293b',
                                      '&:hover': {
                                        bgcolor: '#e2e8f0',
                                      }
                                    }}
                                    onClick={() => window.open(`/clients/${client.phone}`, '_blank')}
                                  >
                                    <PhoneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={client.permitting}
                              size="small"
                              sx={{
                                bgcolor: alpha(getStatusColor(client.permitting), 0.1),
                                color: getStatusColor(client.permitting),
                                fontWeight: 600,
                                fontSize: '0.813rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={client.order_status}
                              size="small"
                              sx={{
                                bgcolor: alpha(getStatusColor(client.order_status), 0.1),
                                color: getStatusColor(client.order_status),
                                fontWeight: 600,
                                fontSize: '0.813rem'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.shell_delivery_date}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.opening_date}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.shell_drop}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.plumbing_pressure_test}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.closing_date}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.equipment_set}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.collar_footer_pour}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.decking}</TableCell>
                          <TableCell>
                            <Chip
                              label={client.inspection_status}
                              size="small"
                              sx={{
                                bgcolor: alpha(getStatusColor(client.inspection_status), 0.1),
                                color: getStatusColor(client.inspection_status),
                                fontWeight: 600,
                                fontSize: '0.813rem'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{client.final}</TableCell>
                          <TableCell>
                            <Box sx={{ width: '160px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={client.progress}
                                  sx={{
                                    height: 8,
                                    bgcolor: '#f3f4f6',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: getProgressColor(client.progress)
                                    }
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: getProgressColor(client.progress),
                                  fontWeight: 700,
                                  minWidth: 42,
                                  fontSize: '0.875rem'
                                }}
                              >
                                {`${client.progress}%`}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Edit client">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(client)}
                                  sx={{
                                    color: '#1e293b',
                                    bgcolor: '#f1f5f9',
                                    '&:hover': {
                                      bgcolor: '#e2e8f0',
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete client">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(client)}
                                  sx={{
                                    color: '#ef4444',
                                    bgcolor: alpha('#ef4444', 0.1),
                                    '&:hover': {
                                      bgcolor: alpha('#ef4444', 0.2),
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Container>

            {/* Create/Edit Dialog */}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="md"
              TransitionComponent={Slide}
              TransitionProps={{ direction: 'up' }}
              PaperProps={{
                sx: {
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{
                py: 3,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#1e293b',
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight={700}>
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  size="small"
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </DialogTitle>

              <form onSubmit={handleSubmitClient}>
                <DialogContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
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
                      />
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions sx={{
                  p: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  justifyContent: 'flex-end',
                  gap: 1.5
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseDialog}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} thickness={4} sx={{ color: 'white' }} /> : <SaveIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#1e293b',
                      '&:hover': {
                        bgcolor: '#0f172a'
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Client'}
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
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{
                py: 2.5,
                px: 3,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                  Delete Client
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: 3, pt: 3 }}>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                  Are you sure you want to delete <strong style={{ color: '#1e293b' }}>{clientToDelete?.customer}</strong>?
                  This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions sx={{
                p: 3,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                gap: 1.5
              }}>
                <Button
                  onClick={() => setDeleteConfirmOpen(false)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    color: '#64748b'
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
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#ef4444',
                    '&:hover': {
                      bgcolor: '#dc2626'
                    }
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete Client'}
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
                  fontWeight: 500
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </Box>
    </>
  )
}

AdminClientsPage.getInitialProps = async () => {
  return {};
};

export default AdminClientsPage
