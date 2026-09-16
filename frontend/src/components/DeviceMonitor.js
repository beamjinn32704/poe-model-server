import React from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';

const GET_DEVICE = gql`
  query GetDevice($id: Int!) {
    model {
      getDevice(id: $id) {
        danger
        occupied
        temperature
        humidity
        airQuality
        ledState
        evacState
        smokeDetected
      }
    }
  }
`;

const DEVICE_CHANGED_SUBSCRIPTION = gql`
  subscription OnDeviceChanged($id: Int!) {
    deviceChanged(id: $id) {
      danger
      occupied
      temperature
      humidity
      airQuality
      ledState
      evacState
      smokeDetected
    }
  }
`;

export function DeviceMonitor({ deviceId }) {
  const { data: initialData, loading, error } = useQuery(GET_DEVICE, {
    variables: { id: deviceId },
  });

  const { data: subData } = useSubscription(DEVICE_CHANGED_SUBSCRIPTION, {
    variables: { id: deviceId },
  });

  if (loading) {
    return (
      <div style={cardBaseStyle}>
        <p>Loading device {deviceId}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...cardBaseStyle, borderColor: '#d32f2f' }}>
        <p style={{ color: '#d32f2f' }}>Error loading device {deviceId}</p>
      </div>
    );
  }

  const device = subData?.deviceChanged ?? initialData?.model?.getDevice;

  if (!device) {
    return (
      <div style={cardBaseStyle}>
        <p>Device {deviceId} not found.</p>
      </div>
    );
  }

  const cardStyle = {
    ...cardBaseStyle,
    borderColor: device.danger ? '#d32f2f' : '#ccc',
    backgroundColor: device.danger ? '#fff5f5' : '#ffffff',
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        Room / Device {deviceId}
      </h3>
      <p>
        Evacuation State: <strong>{device.evacState}</strong>
      </p>
      <p>
        LED Directive: <strong>{device.ledState}</strong>
      </p>
      <p>
        Hazard Status: <strong style={{ color: device.danger ? '#d32f2f' : '#2e7d32' }}>{device.danger ? 'DANGER' : 'CLEAR'}</strong>
      </p>
      <p>Temperature: {device.temperature !== null ? `${device.temperature}°C` : 'N/A'}</p>
      <p>Humidity: {device.humidity !== null ? `${device.humidity}%` : 'N/A'}</p>
      <p>Air Quality: {device.airQuality !== null ? device.airQuality : 'N/A'}</p>
      <p>Smoke Detected: {device.smokeDetected ? 'Yes' : 'No'}</p>
      <p>Occupancy: {device.occupied ? 'Occupied' : 'Vacant'}</p>
    </div>
  );
}

const cardBaseStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'all 0.2s ease-in-out',
};
