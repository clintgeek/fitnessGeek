import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Chip,
  Divider,
  Fab
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  QrCode as QrCodeIcon,
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
  CheckCircle as CheckCircleIcon,
  Camera as CameraIcon2
} from '@mui/icons-material';
import { fitnessGeekService } from '../../services/fitnessGeekService';
import './BarcodeScanner.css';

const BarcodeScanner = ({ open, onClose, onBarcodeScanned }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedCode, setScannedCode] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (open) {
      loadScanHistory();
      // Auto-start scanner when dialog opens
      const timeout = setTimeout(() => {
        if (!isManualMode && !isScanning) {
          startScanner();
        }
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      // Ensure camera stops on close
      stopScanner();
    }
  }, [open, isManualMode]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const loadScanHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('barcodeScanHistory') || '[]');
      setScanHistory(history.slice(0, 5)); // Keep last 5 scans
    } catch (err) {
      console.error('Error loading scan history:', err);
    }
  };

  const saveToHistory = (barcode) => {
    try {
      const history = JSON.parse(localStorage.getItem('barcodeScanHistory') || '[]');
      const newHistory = [barcode, ...history.filter(item => item !== barcode)].slice(0, 10);
      localStorage.setItem('barcodeScanHistory', JSON.stringify(newHistory));
      setScanHistory(newHistory.slice(0, 5));
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  const startScanner = async () => {
    if (isManualMode) return;

    setIsLoading(true);
    setError(null);

    try {
      await startZXingScanner();
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Camera access denied. Please check permissions or use manual entry.');
      setIsManualMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startZXingScanner = async () => {
    // Load ZXing library if not already loaded
    if (!window.ZXing) {
      await loadZXingLibrary();
    }

    const { BrowserMultiFormatReader } = window.ZXing;
    scannerRef.current = new BrowserMultiFormatReader();

    // Get video stream with back camera preference
    const constraints = {
      video: {
        facingMode: 'environment', // Use back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    setIsScanning(true);

    // Start scanning
    scannerRef.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result) => {
        if (result) {
          handleBarcodeDetected(result.text);
        }
      }
    );
  };

  const loadZXingLibrary = () => {
    return new Promise((resolve, reject) => {
      if (window.ZXing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const stopScanner = () => {
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (scannerRef.current) {
      if (scannerRef.current.reset) {
        scannerRef.current.reset();
      }
      scannerRef.current = null;
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    if (!barcode || scannedCode === barcode) return;

    setScannedCode(barcode);
    saveToHistory(barcode);
    stopScanner();

    // Validate barcode format
    if (!isValidBarcode(barcode)) {
      setError('Invalid barcode format. Please try again.');
      return;
    }

    try {
      setIsLoading(true);

      // Look up food by barcode
      const food = await fitnessGeekService.getFoodByBarcode(barcode);

      if (food) {
        onBarcodeScanned(food);
        onClose();
      } else {
        setError('No food found for this barcode. You can add it manually.');
      }
    } catch (err) {
      console.error('Error looking up barcode:', err);
      setError('Failed to look up barcode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) return;

    const barcode = manualBarcode.trim();

    if (!isValidBarcode(barcode)) {
      setError('Invalid barcode format. Please enter a valid barcode.');
      return;
    }

    await handleBarcodeDetected(barcode);
  };

  const isValidBarcode = (barcode) => {
    // Basic validation for common barcode formats
    const barcodeRegex = /^[0-9]{8,14}$/;
    return barcodeRegex.test(barcode);
  };

  const handleHistoryItemClick = (barcode) => {
    setManualBarcode(barcode);
    handleManualSubmit();
  };

  const handleClose = () => {
    stopScanner();
    setScannedCode(null);
    setError(null);
    setManualBarcode('');
    setIsManualMode(false);
    onClose();
  };

  const toggleMode = () => {
    if (isManualMode) {
      setIsManualMode(false);
      setError(null);
      setTimeout(startScanner, 100);
    } else {
      stopScanner();
      setIsManualMode(true);
      setError(null);
    }
  };

  const renderScanner = () => {
    if (isManualMode) {
      return (
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            Enter Barcode Manually
          </Typography>

          <TextField
            fullWidth
            label="Barcode"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter 8-14 digit barcode"
            inputProps={{ maxLength: 14 }}
            sx={{ mb: 3 }}
            autoFocus
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleManualSubmit}
            disabled={!manualBarcode.trim() || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            size="large"
            sx={{ mb: 3 }}
          >
            {isLoading ? 'Looking up...' : 'Look Up Barcode'}
          </Button>

          {scanHistory.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Recent Scans:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {scanHistory.map((barcode, index) => (
                  <Chip
                    key={index}
                    label={barcode}
                    onClick={() => handleHistoryItemClick(barcode)}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 350, sm: 400 },
        minHeight: 350
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 8
          }}
          autoPlay
          playsInline
          muted
        />

        {isScanning && (
          <div className="scanner-overlay">
            <div className="scanner-corners scanner-corner-tl"></div>
            <div className="scanner-corners scanner-corner-tr"></div>
            <div className="scanner-corners scanner-corner-bl"></div>
            <div className="scanner-corners scanner-corner-br"></div>
            <div className="scan-line"></div>
          </div>
        )}

        {/* Center tap-to-start if not scanning */}
        {!isScanning && !isLoading && (
          <Box
            onClick={() => startScanner()}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.4)',
              color: 'white',
              p: 2,
              borderRadius: 2,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <CameraIcon2 sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">Tap to start scanner</Typography>
          </Box>
        )}

        {isLoading && (
          <div className="scanner-loading">
            <CircularProgress />
          </div>
        )}

        {/* Mode toggle FAB */}
        <Fab
          color="primary"
          size="small"
          onClick={() => {
            if (isManualMode) {
              toggleMode();
            } else if (!isScanning) {
              startScanner();
            } else {
              toggleMode();
            }
          }}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10
          }}
        >
          <KeyboardIcon />
        </Fab>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          margin: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '90vh' },
          width: { xs: '100%', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ pb: 2, px: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {isManualMode ? 'Manual Entry' : 'Scan Barcode'}
          </Typography>
          <IconButton onClick={handleClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}

        {/* Scanner Content */}
        {renderScanner()}
      </DialogContent>

      <DialogActions sx={{ p: { xs: 3, sm: 4 }, pt: 2, gap: 2 }}>
        {!isManualMode && (
          <Button
            onClick={() => {
              if (isScanning) {
                stopScanner();
              } else {
                startScanner();
              }
            }}
            startIcon={isScanning ? <CloseIcon /> : <CameraIcon />}
            disabled={isLoading}
            size="large"
            variant="outlined"
            sx={{ minWidth: { xs: 'auto', sm: '120px' } }}
          >
            {isScanning ? 'Stop' : 'Start'}
          </Button>
        )}

        <Button onClick={handleClose} size="large">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;