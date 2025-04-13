// auth/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

const AuthLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index"/>
    <Stack.Screen name="signUp"/>
  </Stack>
);

export default AuthLayout;
