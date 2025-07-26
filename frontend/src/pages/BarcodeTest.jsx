import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { QrCodeScanner as BarcodeIcon } from '@mui/icons-material';
import BarcodeScanner from '../components/BarcodeScanner/BarcodeScanner.jsx';
import { fitnessGeekService } from '../services/fitnessGeekService';

const BarcodeTest = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedFood, setScannedFood] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState(null);

  const handleBarcodeScanned = (food) => {
    setScannedFood(food);
    setScanHistory(prev => [food, ...prev.slice(0, 4)]);
    setError(null);
  };



  const testBarcodes = [
    '3017620422003', // Nutella
    '5000159407236', // Snickers
    '737628064502',  // Doritos
    '028400108000',  // Coca Cola
    '012000001628'   // Pepsi
  ];

  const testBarcodeLookup = async (barcode) => {
    try {
      setError(null);
      const food = await fitnessGeekService.getFoodByBarcode(barcode);
      if (food) {
        setScannedFood(food);
        setScanHistory(prev => [food, ...prev.slice(0, 4)]);
      } else {
        setError(`No food found for barcode: ${barcode}`);
      }
    } catch (err) {
      setError(`Error looking up barcode ${barcode}: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
        Barcode Scanner Test
      </Typography>

      {/* Scanner Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Scanner Controls
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<BarcodeIcon />}
              onClick={() => setShowScanner(true)}
              size="large"
            >
              Open Scanner
            </Button>
            <Button
              variant="outlined"
              onClick={() => setScannedFood(null)}
            >
              Clear Results
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Barcodes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Barcodes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click on a barcode to test the lookup API:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {testBarcodes.map((barcode) => (
              <Chip
                key={barcode}
                label={barcode}
                onClick={() => testBarcodeLookup(barcode)}
                variant="outlined"
                clickable
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Result */}
      {scannedFood && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Result
            </Typography>
            <Box>
              <Typography variant="h6" color="primary">
                {scannedFood.name}
              </Typography>
              {scannedFood.brand && (
                <Typography variant="body2" color="text.secondary">
                  {scannedFood.brand}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Barcode: {scannedFood.barcode}
              </Typography>
              <Typography variant="body2">
                Source: {scannedFood.source}
              </Typography>
              {scannedFood.nutrition && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Calories: {scannedFood.nutrition.calories_per_serving} cal
                  </Typography>
                  <Typography variant="body2">
                    Protein: {scannedFood.nutrition.protein_grams}g |
                    Carbs: {scannedFood.nutrition.carbs_grams}g |
                    Fat: {scannedFood.nutrition.fat_grams}g
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Scan History
            </Typography>
            <List>
              {scanHistory.map((food, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={food.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {food.brand && `${food.brand} • `}{food.barcode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {food.nutrition?.calories_per_serving} cal • {food.source}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < scanHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />
    </Box>
  );
};

export default BarcodeTest;