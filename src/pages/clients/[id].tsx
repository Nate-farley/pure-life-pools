// pages/client/[PHONE_NUMBER].js
// @ts-nocheck
import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
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
import { useRouter } from 'next/router'

function ClientDetail() {
  const router = useRouter()
  const { id } = router.query
const PHONE_NUMBER = id
  console.log(PHONE_NUMBER)
  
  // State for client data
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch client by phone number
  useEffect(() => {
    const fetchClient = async () => {
      if (!PHONE_NUMBER) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/clients/phone/${PHONE_NUMBER}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch client')
        }
        
        const data = await response.json()
        setClient(data.client)
        setError(null)
      } catch (err) {
        console.error('Error fetching client:', err)
        setError('Failed to load client information. Please try again or contact support.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchClient()
  }, [PHONE_NUMBER])
  
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
          title="Client Project Status"
          description="View your swimming pool project status and timeline"
        />
        
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
          Client Project Status
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : !client ? (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            No client found with this phone number. Please check the number or contact support.
          </Alert>
        ) : (
          <>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                mb: 4
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {client.customer} - Project Overview
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overall Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={client.progress} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
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
                        minWidth: 45
                      }}
                    >
                      {`${client.progress}%`}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Permitting Status
                    </Typography>
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
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order Status
                    </Typography>
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
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Inspection Status
                    </Typography>
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
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Project Milestone
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper', 
                        fontWeight: 600, 
                        py: 2 
                      }}>
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Shell Delivery</Typography>
                      </TableCell>
                      <TableCell>{client.shell_delivery_date}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Dig Date</Typography>
                      </TableCell>
                      <TableCell>{client.opening_date}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Shell Drop</Typography>
                      </TableCell>
                      <TableCell>{client.shell_drop}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Plumbing Test</Typography>
                      </TableCell>
                      <TableCell>{client.plumbing_pressure_test}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Backfill Date</Typography>
                      </TableCell>
                      <TableCell>{client.closing_date}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Equipment Set</Typography>
                      </TableCell>
                      <TableCell>{client.equipment_set}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Footer Pour</Typography>
                      </TableCell>
                      <TableCell>{client.collar_footer_pour}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Decking</Typography>
                      </TableCell>
                      <TableCell>{client.decking}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={500}>Final</Typography>
                      </TableCell>
                      <TableCell>{client.final}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </>
        )}
      </Container>
    </div>
  )
}

export default ClientDetail