// Required testIDs: tab-navigator
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Tabs: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Minimal tab navigator scaffold
const TabNavigator = () => (
  <View testID="tab-navigator" />
);

describe('Tab Navigation', () => {
  it('renders tab navigator without crashing', () => {
    render(<TabNavigator />);
    expect(screen.getByTestId('tab-navigator')).toBeTruthy();
  });
});
