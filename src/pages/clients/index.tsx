// pages/clients.js
// @ts-nocheck
import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  alpha
} from '@mui/material'
import { NextSeo } from 'next-seo'

function ClientsPage() {
  // State for clients data
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch all clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/clients')
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients')
        }
        
        const data = await response.json()
        setClients(data.clients)
        setError(null)
      } catch (err) {
        console.error('Error fetching clients:', err)
        setError('Failed to load clients. Please try again or contact support.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchClients()
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchClients(false) // Fetch without showing loading state
    }, 60000) // Poll every minute
    
    return () => clearInterval(interval)
  }, [])
  
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
  
  return (
    <div className="relative min-h-screen w-full bg-gray-50">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <NextSeo 
          title="All Clients - Pool Projects"
          description="View all swimming pool projects and their current status"
        />
        
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
          All Pool Projects
        </Typography>
        
        {loading && clients.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : (
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
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
                        <Typography fontWeight={500}>
                          {client.customer}
                        </Typography>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Container>
    </div>
  )
}

export default ClientsPage