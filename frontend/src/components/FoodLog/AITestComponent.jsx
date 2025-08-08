import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { aiService } from '../../services/aiService.js';

const AITestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const testAIParsing = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const testInput = "2 chicken tacos and a dos equis";
      const parsedResult = await aiService.parseFoodDescription(testInput);
      setResult(parsedResult);
      console.log('AI Test Result:', parsedResult);
    } catch (err) {
      setError(err.message);
      console.error('AI Test Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AIIcon sx={{ color: '#6098CC' }} />
        <Typography variant="h6">AI Integration Test</Typography>
      </Box>

      <Button
        onClick={testAIParsing}
        variant="contained"
        disabled={isLoading}
        startIcon={<AIIcon />}
        sx={{
          bgcolor: '#6098CC',
          '&:hover': { bgcolor: '#4a7ba8' }
        }}
      >
        {isLoading ? 'Testing...' : 'Test AI Food Parsing'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Test Result:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
            {JSON.stringify(result, null, 2)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AITestComponent;
