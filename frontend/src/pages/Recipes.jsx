import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Recipes = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Recipes
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Recipe management functionality coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Recipes;